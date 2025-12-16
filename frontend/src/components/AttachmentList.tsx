import { Attachment, ExtractedAttachmentData } from '../services/api';
import './AttachmentList.css';

interface AttachmentListProps {
  attachments: Attachment[];
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
  const parseAttachmentData = (dataJson: string | null): ExtractedAttachmentData | null => {
    if (!dataJson) return null;
    try {
      return JSON.parse(dataJson);
    } catch {
      return null;
    }
  };
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medical Records':
        return '#e74c3c';
      case 'Declarations':
        return '#3498db';
      case 'Cover Letters':
        return '#2ecc71';
      case 'Other':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  if (attachments.length === 0) {
    return <div className="no-attachments">No attachments found.</div>;
  }

  return (
    <div className="attachments-list">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="attachment-card">
          <div className="attachment-header">
            <div className="attachment-name">
              <span className="file-icon">📎</span>
              {attachment.filename}
            </div>
            <span
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(attachment.category) }}
            >
              {attachment.category}
            </span>
          </div>
          {attachment.contentPreview && (
            <div className="attachment-preview">
              <strong>Preview:</strong>
              <p>{attachment.contentPreview}</p>
            </div>
          )}
          {(() => {
            const extractedData = parseAttachmentData(attachment.attachmentData);
            if (extractedData) {
              return (
                <div className="attachment-extracted-data">
                  <strong>📊 Extracted Data:</strong>
                  {extractedData.keyDates && extractedData.keyDates.length > 0 && (
                    <div className="extracted-item">
                      <strong>Key Dates:</strong> {extractedData.keyDates.join(', ')}
                    </div>
                  )}
                  {extractedData.healthcareProviders && extractedData.healthcareProviders.length > 0 && (
                    <div className="extracted-item">
                      <strong>Healthcare Providers:</strong> {extractedData.healthcareProviders.join(', ')}
                    </div>
                  )}
                  {extractedData.diagnoses && extractedData.diagnoses.length > 0 && (
                    <div className="extracted-item">
                      <strong>Diagnoses:</strong> {extractedData.diagnoses.join(', ')}
                    </div>
                  )}
                  {extractedData.treatmentHistory && (
                    <div className="extracted-item">
                      <strong>Treatment History:</strong> {extractedData.treatmentHistory}
                    </div>
                  )}
                  {extractedData.caseRelevantInfo && (
                    <div className="extracted-item">
                      <strong>Case-Relevant Info:</strong> {extractedData.caseRelevantInfo}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
          <div className="attachment-meta">
            <span>Created: {formatDate(attachment.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

