const API_BASE_URL = '/api';

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
  attachmentData: string | null; // JSON string
  createdAt: string;
}

export interface ExtractedAttachmentData {
  keyDates?: string[] | null;
  healthcareProviders?: string[] | null;
  diagnoses?: string[] | null;
  treatmentHistory?: string | null;
  caseRelevantInfo?: string | null;
}

export interface CaseWithRelations {
  case: Case;
  emails: Email[];
  attachments: Attachment[];
}

export async function getAllCases(): Promise<CaseWithRelations[]> {
  const response = await fetch(`${API_BASE_URL}/cases`);
  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  return response.json();
}

export async function getCaseById(id: number): Promise<CaseWithRelations> {
  const response = await fetch(`${API_BASE_URL}/cases/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch case');
  }
  return response.json();
}

