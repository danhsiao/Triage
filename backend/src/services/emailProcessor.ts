import { EmailInput, ExtractedCaseData, Case, Email, Attachment } from '../models/schemas';
import { extractCaseData, extractAttachmentData } from './llmService';
import db from '../models/database';

export async function processEmail(emailInput: EmailInput): Promise<CaseWithRelations> {
  // Extract structured data using LLM
  const extractedData = await extractCaseData(emailInput);

  // Extract data from attachments to enrich case information
  const attachmentDataPromises = extractedData.attachments.map(async (att) => {
    const originalAtt = emailInput.attachments?.find(a => a.filename === att.filename);
    if (originalAtt) {
      const extractedData = await extractAttachmentData(
        att.filename,
        originalAtt.content,
        att.category
      );
      return { filename: att.filename, data: extractedData };
    }
    return { filename: att.filename, data: null };
  });

  const attachmentDataResults = await Promise.all(attachmentDataPromises);
  const attachmentDataMap = new Map(
    attachmentDataResults.map(r => [r.filename, r.data])
  );

  // Use attachment data to enrich case information
  // For example, if exam date is missing but found in attachment, use it
  let enrichedExamDate = extractedData.examDate;
  let enrichedLocation = extractedData.location;

  for (const [filename, data] of attachmentDataMap.entries()) {
    if (data?.keyDates && data.keyDates.length > 0 && !enrichedExamDate) {
      // Try to find exam date in attachment dates
      const examDateCandidate = data.keyDates.find(d => 
        d.includes('2025') || d.includes('2024') || d.includes('2026')
      );
      if (examDateCandidate) {
        enrichedExamDate = examDateCandidate;
      }
    }
  }

  // Start transaction
  const insertCase = db.prepare(`
    INSERT INTO cases (patient_name, case_number, exam_date, exam_type, referring_party, location, uncertainty_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmail = db.prepare(`
    INSERT INTO emails (case_id, subject, sender, recipients, body)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertAttachment = db.prepare(`
    INSERT INTO attachments (case_id, filename, category, content_preview, attachment_data)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // Insert case with uncertainty notes
    const caseResult = insertCase.run(
      extractedData.patientName,
      extractedData.caseNumber,
      enrichedExamDate || extractedData.examDate,
      extractedData.examType,
      extractedData.referringParty,
      enrichedLocation || extractedData.location,
      extractedData.uncertaintyNotes || null
    );
    const caseId = caseResult.lastInsertRowid as number;

    // Insert email
    const emailResult = insertEmail.run(
      caseId,
      emailInput.subject,
      emailInput.sender,
      JSON.stringify(emailInput.recipients),
      emailInput.body
    );
    const emailId = emailResult.lastInsertRowid as number;

    // Insert attachments with extracted data
    const attachmentIds: number[] = [];
    for (const att of extractedData.attachments) {
      // Find original attachment content for preview
      const originalAtt = emailInput.attachments?.find(a => a.filename === att.filename);
      // Always use the actual content for preview, not the reason
      const contentPreview = originalAtt?.content.substring(0, 500) || null;
      
      // Get extracted attachment data
      const extractedAttData = attachmentDataMap.get(att.filename);
      const attachmentDataJson = extractedAttData ? JSON.stringify(extractedAttData) : null;

      const attResult = insertAttachment.run(
        caseId,
        att.filename,
        att.category,
        contentPreview,
        attachmentDataJson
      );
      attachmentIds.push(attResult.lastInsertRowid as number);
    }

    return { caseId, emailId, attachmentIds };
  });

  const { caseId } = transaction();

  // Fetch the complete case with relations
  return getCaseById(caseId);
}

export interface CaseWithRelations {
  case: Case;
  emails: Email[];
  attachments: Attachment[];
}

export function getCaseById(id: number): CaseWithRelations {
  const caseRow = db.prepare('SELECT * FROM cases WHERE id = ?').get(id) as any;
  if (!caseRow) {
    throw new Error(`Case with id ${id} not found`);
  }

  const emails = db.prepare('SELECT * FROM emails WHERE case_id = ?').all(id) as any[];
  const attachments = db.prepare('SELECT * FROM attachments WHERE case_id = ?').all(id) as any[];

  return {
    case: {
      id: caseRow.id,
      patientName: caseRow.patient_name,
      caseNumber: caseRow.case_number,
      examDate: caseRow.exam_date,
      examType: caseRow.exam_type,
      referringParty: caseRow.referring_party,
      location: caseRow.location,
      uncertaintyNotes: caseRow.uncertainty_notes,
      createdAt: caseRow.created_at,
      updatedAt: caseRow.updated_at,
    },
    emails: emails.map(e => ({
      id: e.id,
      caseId: e.case_id,
      subject: e.subject,
      sender: e.sender,
      recipients: e.recipients,
      body: e.body,
      receivedAt: e.received_at,
    })),
    attachments: attachments.map(a => ({
      id: a.id,
      caseId: a.case_id,
      filename: a.filename,
      category: a.category,
      contentPreview: a.content_preview,
      attachmentData: a.attachment_data,
      createdAt: a.created_at,
    })),
  };
}

export function getAllCases(): CaseWithRelations[] {
  const cases = db.prepare('SELECT * FROM cases ORDER BY created_at DESC').all() as any[];

  return cases.map(caseRow => {
    const emails = db.prepare('SELECT * FROM emails WHERE case_id = ?').all(caseRow.id) as any[];
    const attachments = db.prepare('SELECT * FROM attachments WHERE case_id = ?').all(caseRow.id) as any[];

    return {
      case: {
        id: caseRow.id,
        patientName: caseRow.patient_name,
        caseNumber: caseRow.case_number,
        examDate: caseRow.exam_date,
        examType: caseRow.exam_type,
        referringParty: caseRow.referring_party,
        location: caseRow.location,
        uncertaintyNotes: caseRow.uncertainty_notes,
        createdAt: caseRow.created_at,
        updatedAt: caseRow.updated_at,
      },
      emails: emails.map(e => ({
        id: e.id,
        caseId: e.case_id,
        subject: e.subject,
        sender: e.sender,
        recipients: e.recipients,
        body: e.body,
        receivedAt: e.received_at,
      })),
      attachments: attachments.map(a => ({
        id: a.id,
        caseId: a.case_id,
        filename: a.filename,
        category: a.category,
        contentPreview: a.content_preview,
        attachmentData: a.attachment_data,
        createdAt: a.created_at,
      })),
    };
  });
}

