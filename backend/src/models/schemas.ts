// TypeScript types for the application

export interface EmailInput {
  subject: string;
  sender: string;
  recipients: string[];
  body: string;
  attachments?: AttachmentInput[];
}

export interface AttachmentInput {
  filename: string;
  content: string;
}

export interface ExtractedCaseData {
  patientName: string | null;
  caseNumber: string | null;
  examDate: string | null; // ISO date string
  examType: string | null;
  referringParty: string | null;
  location?: string | null;
  attachments: ExtractedAttachment[];
  uncertaintyNotes?: string | null; // LLM's explanation of uncertain fields
  confidenceLevels?: Record<string, 'high' | 'medium' | 'low'>; // Confidence per field
}

export interface ExtractedAttachment {
  filename: string;
  category: 'Medical Records' | 'Declarations' | 'Cover Letters' | 'Other';
  reason?: string; // Required if category is 'Other'
}

export interface ExtractedAttachmentData {
  keyDates?: string[]; // Treatment dates, injury dates, exam dates
  healthcareProviders?: string[]; // Providers/facilities mentioned
  diagnoses?: string[]; // Diagnoses or conditions
  treatmentHistory?: string; // Summary of treatment history
  caseRelevantInfo?: string; // Any other case-relevant information
}

export interface Case {
  id: number;
  patientName: string | null;
  caseNumber: string | null;
  examDate: string | null;
  examType: string | null;
  referringParty: string | null;
  location: string | null;
  uncertaintyNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: number;
  caseId: number;
  subject: string;
  sender: string;
  recipients: string;
  body: string;
  receivedAt: string;
}

export interface Attachment {
  id: number;
  caseId: number;
  filename: string;
  category: string;
  contentPreview: string | null;
  attachmentData: string | null; // JSON string of ExtractedAttachmentData
  createdAt: string;
}

export interface CaseWithRelations {
  case: Case;
  emails: Email[];
  attachments: Attachment[];
}

