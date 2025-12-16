import { createEmail, EmailStyle, listStyles } from './emailCreator';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a created email to the API
 * Usage: tsx src/utils/sendCreatedEmail.ts [style]
 * Example: tsx src/utils/sendCreatedEmail.ts clean
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function sendCreatedEmail(style: EmailStyle) {
  const email = createEmail(style);
  
  console.log(`\n📧 Sending ${style} email to API...\n`);
  console.log(`Subject: ${email.subject}`);
  console.log(`From: ${email.sender}`);
  console.log(`Attachments: ${email.attachments?.length || 0}\n`);

  try {
    // Check if API is available
    const healthCheck = await fetch(`${API_URL}/health`);
    if (!healthCheck.ok) {
      throw new Error('Health check failed');
    }

    const response = await fetch(`${API_URL}/api/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Email processed successfully!`);
    console.log(`   Case ID: ${result.case.id}`);
    console.log(`   Patient: ${result.case.patientName || 'Unknown'}`);
    console.log(`   Case Number: ${result.caseNumber || 'N/A'}`);
    if (result.case.uncertaintyNotes) {
      console.log(`   ⚠️  Uncertainty Notes: ${result.case.uncertaintyNotes}`);
    }
    console.log(`\n   View in frontend: http://localhost:3000/cases/${result.case.id}\n`);
    
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email:`, error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.error('\n💡 Make sure the backend server is running:');
        console.error('   cd backend && npm run dev\n');
      }
    }
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const style = process.argv[2] as EmailStyle;
  
  if (!style) {
    console.log('Usage: tsx src/utils/sendCreatedEmail.ts [style]');
    listStyles();
    process.exit(1);
  }

  const validStyles: EmailStyle[] = ['clean', 'messy', 'structured', 'unstructured'];
  if (!validStyles.includes(style)) {
    console.error(`❌ Invalid style: ${style}`);
    listStyles();
    process.exit(1);
  }

  sendCreatedEmail(style).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { sendCreatedEmail };

