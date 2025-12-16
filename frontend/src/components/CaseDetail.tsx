import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, CaseWithRelations } from '../services/api';
import AttachmentList from './AttachmentList';
import './CaseDetail.css';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCase(parseInt(id, 10));
    }
  }, [id]);

  const loadCase = async (caseId: number) => {
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load case');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="loading">Loading case details...</div>;
  }

  if (error || !caseData) {
    return (
      <div className="error">
        <p>{error || 'Case not found'}</p>
        <button onClick={() => navigate('/')}>Back to Cases</button>
      </div>
    );
  }

  const { case: caseInfo, emails, attachments } = caseData;

  return (
    <div className="case-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Cases
        </button>
        <h1>Case Details</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>Patient Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Patient Name</span>
              <span className="info-value">{caseInfo.patientName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Case Number</span>
              <span className="info-value">{caseInfo.caseNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Exam Type</span>
              <span className="info-value">{caseInfo.examType || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Exam Date</span>
              <span className="info-value">{formatDate(caseInfo.examDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Referring Party</span>
              <span className="info-value">{caseInfo.referringParty || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{caseInfo.location || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created At</span>
              <span className="info-value">{formatDate(caseInfo.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Updated At</span>
              <span className="info-value">{formatDate(caseInfo.updatedAt)}</span>
            </div>
          </div>
          {caseInfo.uncertaintyNotes && (
            <div className="uncertainty-section">
              <h3>⚠️ Uncertainty Notes</h3>
              <p className="uncertainty-text">{caseInfo.uncertaintyNotes}</p>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h2>Emails ({emails.length})</h2>
          {emails.map((email) => (
            <div key={email.id} className="email-card">
              <div className="email-header">
                <div>
                  <strong>From:</strong> {email.sender}
                </div>
                <div className="email-date">{formatDate(email.receivedAt)}</div>
              </div>
              <div className="email-subject">
                <strong>Subject:</strong> {email.subject}
              </div>
              <div className="email-recipients">
                <strong>To:</strong> {email.recipients}
              </div>
              <div className="email-body">
                <strong>Body:</strong>
                <pre>{email.body}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="detail-section">
          <h2>Attachments ({attachments.length})</h2>
          <AttachmentList attachments={attachments} />
        </div>
      </div>
    </div>
  );
}

