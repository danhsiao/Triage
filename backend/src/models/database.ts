import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data/triage.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    case_number TEXT,
    exam_date TEXT,
    exam_type TEXT,
    referring_party TEXT,
    location TEXT,
    uncertainty_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    sender TEXT NOT NULL,
    recipients TEXT NOT NULL,
    body TEXT NOT NULL,
    received_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    category TEXT NOT NULL,
    content_preview TEXT,
    attachment_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
  CREATE INDEX IF NOT EXISTS idx_cases_patient_name ON cases(patient_name);
  CREATE INDEX IF NOT EXISTS idx_emails_case_id ON emails(case_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_case_id ON attachments(case_id);
`);

// Migrate existing tables to add new columns if they don't exist
try {
  db.exec(`
    ALTER TABLE cases ADD COLUMN uncertainty_notes TEXT;
  `);
} catch (e: any) {
  // Column already exists, ignore
  if (!e.message?.includes('duplicate column name')) {
    console.warn('Migration note: uncertainty_notes column may already exist');
  }
}

try {
  db.exec(`
    ALTER TABLE attachments ADD COLUMN attachment_data TEXT;
  `);
} catch (e: any) {
  // Column already exists, ignore
  if (!e.message?.includes('duplicate column name')) {
    console.warn('Migration note: attachment_data column may already exist');
  }
}

export default db;

