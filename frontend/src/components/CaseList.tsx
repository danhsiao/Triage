import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCases, CaseWithRelations } from '../services/api';
import './CaseList.css';

export default function CaseList() {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await getAllCases();
      setCases(data);
      setError(null);
    } catch (err) {
      setError('Failed to load cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((item) => {
    const caseData = item.case;
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      caseData.patientName?.toLowerCase().includes(searchLower) ||
      caseData.caseNumber?.toLowerCase().includes(searchLower) ||
      caseData.examType?.toLowerCase().includes(searchLower) ||
      caseData.referringParty?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="loading">Loading cases...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadCases}>Retry</button>
      </div>
    );
  }

  return (
    <div className="case-list-container">
      <div className="header">
        <h1>Triage - IME Cases</h1>
        <button onClick={loadCases} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by patient name, case number, exam type, or referring party..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredCases.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? 'No cases match your search.' : 'No cases found.'}
        </div>
      ) : (
        <div className="cases-grid">
          {filteredCases.map((item) => {
            const caseData = item.case;
            return (
              <div
                key={caseData.id}
                className="case-card"
                onClick={() => navigate(`/cases/${caseData.id}`)}
              >
                <div className="case-header">
                  <h2>{caseData.patientName || 'Unknown Patient'}</h2>
                  <span className="case-id">#{caseData.id}</span>
                </div>
                <div className="case-details">
                  <div className="detail-row">
                    <span className="label">Case Number:</span>
                    <span className="value">{caseData.caseNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Exam Type:</span>
                    <span className="value">{caseData.examType || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Exam Date:</span>
                    <span className="value">{formatDate(caseData.examDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Referring Party:</span>
                    <span className="value">{caseData.referringParty || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{caseData.location || 'N/A'}</span>
                  </div>
                </div>
                <div className="case-footer">
                  <span className="attachments-count">
                    {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
                  </span>
                  <span className="created-date">
                    Created: {formatDate(caseData.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

