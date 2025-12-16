import dotenv from 'dotenv';
dotenv.config();

import { extractCaseData } from '../services/llmService';
import { createEmail } from './emailCreator';

/**
 * Test script to verify LLM extraction is working
 * Usage: tsx src/utils/testLLM.ts
 */

async function testLLM() {
  console.log('🧪 Testing LLM Extraction\n');
  
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.error('   Make sure you have a .env file with OPENAI_API_KEY set');
    process.exit(1);
  }
  
  console.log('✅ OPENAI_API_KEY found');
  console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}\n`);
  
  // Test with a clean sample email generated via emailCreator
  const testEmail = createEmail('clean');
  console.log('📧 Testing with sample email:');
  console.log(`   Subject: ${testEmail.subject}`);
  console.log(`   From: ${testEmail.sender}\n`);
  
  try {
    console.log('🔄 Calling LLM...\n');
    const result = await extractCaseData(testEmail);
    
    console.log('✅ Extraction successful!\n');
    console.log('📊 Extracted Data:');
    console.log('   Patient Name:', result.patientName || '(null)');
    console.log('   Case Number:', result.caseNumber || '(null)');
    console.log('   Exam Date:', result.examDate || '(null)');
    console.log('   Exam Type:', result.examType || '(null)');
    console.log('   Referring Party:', result.referringParty || '(null)');
    console.log('   Location:', result.location || '(null)');
    console.log('\n📎 Attachments:');
    result.attachments.forEach((att, idx) => {
      console.log(`   ${idx + 1}. ${att.filename} - ${att.category}`);
    });
    
    // Check if extraction was successful
    if (!result.patientName && !result.caseNumber) {
      console.log('\n⚠️  WARNING: Extraction returned mostly null values');
      console.log('   This might indicate the LLM is not extracting correctly');
    } else {
      console.log('\n✅ Extraction looks good!');
    }
    
  } catch (error) {
    console.error('\n❌ Extraction failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if (error.message.includes('API key')) {
        console.error('\n💡 Tip: Check that your OpenAI API key is valid and has credits');
      }
    }
    process.exit(1);
  }
}

testLLM();

