import OpenAI from 'openai';
import { EmailInput, ExtractedCaseData, ExtractedAttachmentData } from '../models/schemas';

// Lazy-load OpenAI client to ensure dotenv has loaded
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing. Please check your .env file.');
    }
    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

const EXTRACTION_PROMPT = `You are an expert at extracting structured information from emails related to Independent Medical Examinations (IMEs).

Extract the following information from the email:
- Patient Name
- Case Number
- IME / Exam Date (convert to ISO format YYYY-MM-DD if possible)
- Exam Type (e.g., Orthopedic IME, Neurology IME, Psych IME)
- Referring Party / Law Firm
- Location (if mentioned)

IMPORTANT - Uncertainty Detection:
Pay attention to uncertain language such as: "might be", "possibly", "likely", "approximately", "hoping for", "something close to", "maybe", "probably".
When you encounter uncertainty:
- Provide your best guess for the value
- Note the uncertainty in the uncertaintyNotes field
- Set confidence levels: "high" (certain), "medium" (some uncertainty), "low" (highly uncertain)

For each attachment, categorize it as one of:
- Medical Records (files containing medical history, treatment notes, diagnostic reports, test results)
- Declarations (sworn statements, declarations, affidavits)
- Cover Letters (introductory letters, transmittal letters, cover sheets)
- Other (only use if truly cannot determine - provide reason)

Attachment Categorization Guidelines:
- Analyze filename patterns: "records", "medical", "chart" → Medical Records
- Analyze filename patterns: "declaration", "affidavit", "statement" → Declarations
- Analyze filename patterns: "cover", "letter", "transmittal" → Cover Letters
- Analyze email body context mentioning the attachment
- Analyze attachment content preview if provided
- Use "Other" sparingly - only when categorization is truly impossible

Return ONLY valid JSON in this exact format:
{
  "patientName": "string or null",
  "caseNumber": "string or null",
  "examDate": "ISO date string (YYYY-MM-DD) or null",
  "examType": "string or null",
  "referringParty": "string or null",
  "location": "string or null",
  "uncertaintyNotes": "string or null - explain any uncertain fields and why",
  "confidenceLevels": {
    "patientName": "high" | "medium" | "low",
    "caseNumber": "high" | "medium" | "low",
    "examDate": "high" | "medium" | "low",
    "examType": "high" | "medium" | "low",
    "referringParty": "high" | "medium" | "low",
    "location": "high" | "medium" | "low"
  },
  "attachments": [
    {
      "filename": "string",
      "category": "Medical Records" | "Declarations" | "Cover Letters" | "Other",
      "reason": "string (required if category is Other, otherwise null)"
    }
  ]
}

If information is not found in the email, use null. Be thorough in analyzing both the email body and attachment filenames/content.`;

export async function extractCaseData(email: EmailInput): Promise<ExtractedCaseData> {
  try {
    // Build context from email - include more attachment content for better categorization
    const emailContext = `
Subject: ${email.subject}
From: ${email.sender}
Body:
${email.body}

Attachments:
${email.attachments?.map(att => `- ${att.filename}: ${att.content.substring(0, 1000)}`).join('\n\n') || 'None'}
`;

    const client = getOpenAIClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: emailContext }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const extracted = JSON.parse(content) as ExtractedCaseData;

    // Ensure confidenceLevels is set
    if (!extracted.confidenceLevels) {
      extracted.confidenceLevels = {};
    }

    // Add uncertainty notes for missing key fields
    const missingFields: string[] = [];
    if (!extracted.patientName) missingFields.push('patientName');
    if (!extracted.caseNumber) missingFields.push('caseNumber');
    if (!extracted.examType) missingFields.push('examType');
    if (!extracted.examDate) missingFields.push('examDate');

    if (missingFields.length > 0) {
      const note = `Missing or uncertain fields: ${missingFields.join(', ')}. Added for manual review.`;
      extracted.uncertaintyNotes = extracted.uncertaintyNotes
        ? `${extracted.uncertaintyNotes} ${note}`
        : note;
      missingFields.forEach((f) => {
        extracted.confidenceLevels![f] = extracted.confidenceLevels![f] || 'low';
      });
    }

    // Validate and set default attachments if not provided
    if (!extracted.attachments) {
      extracted.attachments = email.attachments?.map(att => ({
        filename: att.filename,
        category: 'Other' as const,
        reason: 'Unable to categorize from email content'
      })) || [];
    }

    // Ensure all attachments from email are included
    if (email.attachments) {
      const extractedFilenames = new Set(extracted.attachments.map(a => a.filename));
      for (const att of email.attachments) {
        if (!extractedFilenames.has(att.filename)) {
          extracted.attachments.push({
            filename: att.filename,
            category: 'Other',
            reason: 'Not categorized by LLM'
          });
        }
      }
    }

    // Drop LLM-produced attachments without filenames
    if (extracted.attachments) {
      extracted.attachments = extracted.attachments
        .map(att => {
          if (!att.filename || !att.filename.trim()) {
            return null;
          }
          return att;
        })
        .filter(Boolean) as typeof extracted.attachments;
    }

    return extracted;
  } catch (error) {
    console.error('❌ Error extracting case data:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    
    // Fallback: return minimal structure with nulls
    console.warn('⚠️  Falling back to null values - LLM extraction failed');
    return {
      patientName: null,
      caseNumber: null,
      examDate: null,
      examType: null,
      referringParty: null,
      location: null,
      attachments: email.attachments?.map(att => ({
        filename: att.filename,
        category: 'Other' as const,
        reason: 'Extraction failed'
      })) || [],
      uncertaintyNotes: 'LLM extraction failed - manual review required',
      confidenceLevels: {}
    };
  }
}

/**
 * Extract structured data from an attachment's content
 */
export async function extractAttachmentData(
  filename: string,
  content: string,
  category: string
): Promise<ExtractedAttachmentData | null> {
  try {
    const client = getOpenAIClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

    const prompt = `You are analyzing a ${category} attachment for an IME case.

Filename: ${filename}
Category: ${category}

Extract structured information from this attachment content:
${content.substring(0, 4000)}

Extract:
- Key dates (treatment dates, injury dates, exam dates, appointment dates) - return as array of date strings in YYYY-MM-DD format or original format
- Healthcare providers/facilities mentioned - return as array of STRING values only (e.g., "Dr. John Smith" or "City Hospital", NOT objects)
- Diagnoses or medical conditions mentioned - return as array of diagnosis strings
- Treatment history summary - return as a single string summary
- Any other case-relevant information - return as a single string

IMPORTANT: healthcareProviders must be an array of STRINGS, not objects. For example:
- CORRECT: ["Dr. John Smith", "City Hospital", "Dr. Jane Doe"]
- WRONG: [{"name": "Dr. John Smith"}, {"name": "City Hospital"}]

Return ONLY valid JSON in this format:
{
  "keyDates": ["2024-02-08", "2024-01-15"] or null,
  "healthcareProviders": ["Dr. John Smith", "City Hospital"] or null,
  "diagnoses": ["Post-concussion syndrome", "Mild TBI"] or null,
  "treatmentHistory": "brief summary string" or null,
  "caseRelevantInfo": "any other relevant information" or null
}

If no relevant information is found, return null for all fields.`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are an expert at extracting structured medical and legal information from documents.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      return null;
    }

    const extracted = JSON.parse(responseContent) as ExtractedAttachmentData;
    
    // Validate and normalize healthcareProviders - ensure they are strings
    if (extracted.healthcareProviders) {
      extracted.healthcareProviders = extracted.healthcareProviders.map(provider => {
        if (typeof provider === 'string') {
          return provider;
        } else if (typeof provider === 'object' && provider !== null) {
          // If it's an object, try to extract name or convert to string
          const name = (provider as any).name || (provider as any).provider || JSON.stringify(provider);
          return name;
        }
        return String(provider);
      }).filter(p => p && p.trim().length > 0);
    }
    
    // Ensure all arrays contain strings
    if (extracted.keyDates) {
      extracted.keyDates = extracted.keyDates.map(d => String(d));
    }
    if (extracted.diagnoses) {
      extracted.diagnoses = extracted.diagnoses.map(d => String(d));
    }
    
    return extracted;
  } catch (error) {
    console.error(`❌ Error extracting data from attachment ${filename}:`, error);
    return null;
  }
}

