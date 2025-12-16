import { EmailInput } from '../models/schemas';

/**
 * Sample Email Creator - Generate sample emails with different styles
 * Usage: tsx src/utils/emailCreator.ts [style]
 * Styles: clean, messy, structured, unstructured
 */

type EmailStyle = 'clean' | 'messy' | 'structured' | 'unstructured';

const cleanEmail: EmailInput = {
  subject: 'New IME Referral – Sarah Johnson – Case #IM-2025-0456',
  sender: 'referrals@premiumlaw.com',
  recipients: ['triage@brighterway.ai'],
  body: `Dear Triage Team,

We are requesting an Independent Medical Examination for the following case:

PATIENT INFORMATION:
Name: Sarah Johnson
Date of Birth: March 22, 1985
Case Number: IM-2025-0456

EXAMINATION REQUEST:
Exam Type: Orthopedic IME
Requested Date: May 15, 2025
Preferred Time: Morning (9:00 AM - 12:00 PM)
Location: Los Angeles, California

INCIDENT DETAILS:
Date of Incident: February 10, 2024
Location: Intersection of Main Street and Broadway, Los Angeles, CA
Nature: Motor vehicle accident

Please find attached:
1. Medical records from treating physicians
2. Declaration of the claimant
3. Cover letter with additional case details

We look forward to your confirmation of the examination date.

Best regards,
Michael Chen
Senior Paralegal
Premium Law Firm
(310) 555-1234`,
  attachments: [
    {
      filename: 'Johnson_S_Medical_Records.pdf',
      content: `MEDICAL RECORDS - SARAH JOHNSON
DOB: 03/22/1985
Case: IM-2025-0456

TREATMENT TIMELINE:

Initial Treatment - Los Angeles General Hospital
Date: February 10, 2024
Provider: Dr. Emily Rodriguez, Emergency Department
Diagnosis: Cervical strain, lumbar sprain
Treatment: Pain management, muscle relaxants

Orthopedic Consultation
Date: February 18, 2024
Provider: Dr. James Park, MD
Facility: Pacific Orthopedic Center
Address: 1234 Medical Plaza, Los Angeles, CA 90024
Phone: (310) 555-5678
Assessment: Persistent lower back and neck pain
Diagnosis: L4-L5 disc herniation, cervical radiculopathy
Treatment Plan: Physical therapy, NSAIDs, follow-up in 4 weeks

Follow-up Visits:
- March 15, 2024: Continued pain, PT initiated
- April 12, 2024: Some improvement, ongoing symptoms
- May 8, 2024: Persistent symptoms, considering epidural injection

Diagnostic Imaging:
- MRI Lumbar Spine (February 20, 2024): L4-L5 disc herniation
- MRI Cervical Spine (February 25, 2024): C5-C6 disc bulge

Current Medications:
- Ibuprofen 600mg twice daily
- Cyclobenzaprine 10mg at bedtime
- Gabapentin 300mg three times daily

The patient continues to experience chronic pain and functional limitations.`
    },
    {
      filename: 'Johnson_S_Declaration.pdf',
      content: `DECLARATION OF SARAH JOHNSON

I, Sarah Johnson, declare under penalty of perjury that the following is true:

1. On February 10, 2024, I was involved in a motor vehicle accident at the intersection of Main Street and Broadway in Los Angeles, California.

2. I was transported to Los Angeles General Hospital where I was treated by Dr. Emily Rodriguez in the Emergency Department.

3. I have received ongoing treatment from Dr. James Park at Pacific Orthopedic Center since February 18, 2024.

4. I continue to experience pain and limitations as a result of the February 10, 2024 accident.

5. I am requesting an Independent Medical Examination to assess my condition and future treatment needs.

Dated: April 1, 2025

Sarah Johnson`
    }
  ]
};

const messyEmail: EmailInput = {
  subject: 'ime needed asap',
  sender: 'intake@quicklaw.com',
  recipients: ['triage@brighterway.ai'],
  body: `hey,

we need an ime set up like yesterday. client name is mike thompson or maybe thomson? not 100% sure on spelling.

case number could be QT-8842 or QT-8843, something like that. 

exam type: psych eval i think? or maybe neuro? client has head issues from work accident.

date needed: sometime in june? july? whatever works.

location: san fran or oakland area.

docs are attached but might be missing some pages, let me know if you need more.

thanks,
jennifer
quick law
`,
  attachments: [
    {
      filename: 'mike_records.pdf',
      content: `patient records
mike thompson/thomson
dob: around 1980?

saw dr kim at some hospital in sf
date: maybe march 2024?
complaint: headaches, memory problems
diagnosis: concussion? tbi?

also saw someone at oakland neuro center
dr patel i think?
dates: april, may, june 2024
treatment: meds, therapy

patient still having issues
needs eval`
    },
    {
      filename: 'more_docs.pdf',
      content: `additional records
various dates
multiple providers
treatment ongoing`
    }
  ]
};

const structuredEmail: EmailInput = {
  subject: 'IME Referral Request - Formal Submission - Case #LEG-2024-8921',
  sender: 'ime.referrals@corporatelaw.com',
  recipients: ['triage@brighterway.ai'],
  body: `TO: Triage Department
FROM: Corporate Law Associates
DATE: April 15, 2025
RE: Independent Medical Examination Request

CASE INFORMATION:
Case Number: LEG-2024-8921
Claimant: David Martinez
Date of Birth: September 8, 1975
Social Security Number: [REDACTED]

INCIDENT INFORMATION:
Date: November 5, 2023
Location: 456 Industrial Boulevard, San Diego, CA 92101
Type: Workplace injury - fall from height
Employer: ABC Construction Company

EXAMINATION REQUEST:
Type: Orthopedic IME
Preferred Date: June 10, 2025
Alternative Dates: June 11, 2025 or June 12, 2025
Time Preference: Afternoon (1:00 PM - 4:00 PM)
Location: San Diego metropolitan area

TREATMENT SUMMARY:
The claimant has received treatment from multiple providers:
- Initial treatment at San Diego Medical Center (November 5, 2023)
- Orthopedic care with Dr. Lisa Wang (November 12, 2023 - present)
- Physical therapy at Rehab Plus (December 2023 - March 2024)

Please review the attached medical records and declaration. We require the IME report by July 1, 2025.

Sincerely,
Robert Anderson
Legal Assistant
Corporate Law Associates
(619) 555-9876
robert.anderson@corporatelaw.com`,
  attachments: [
    {
      filename: 'Martinez_D_Complete_Medical_Records.pdf',
      content: `COMPREHENSIVE MEDICAL RECORDS
DAVID MARTINEZ
DOB: 09/08/1975
SSN: [REDACTED]
Case: LEG-2024-8921

INITIAL TREATMENT
Date: November 5, 2023
Facility: San Diego Medical Center
Provider: Dr. Mark Thompson, Emergency Department
Chief Complaint: Right shoulder and lower back pain following fall
Diagnosis: Right shoulder dislocation, L3-L4 compression fracture
Treatment: Shoulder reduction, pain management, orthopedic consult

ORTHOPEDIC CARE
Provider: Dr. Lisa Wang, MD, Orthopedic Surgeon
Facility: San Diego Orthopedic Specialists
Address: 789 Medical Drive, San Diego, CA 92103
Phone: (619) 555-3456

Visit 1 - November 12, 2023
Assessment: Right shoulder instability, lumbar compression fracture
Treatment: Shoulder sling, back brace, pain medications
Plan: Follow-up in 2 weeks, consider surgery if no improvement

Visit 2 - November 26, 2023
Status: Continued pain, limited range of motion
Imaging: CT scan shows L3-L4 compression fracture, right shoulder MRI pending
Plan: Continue conservative treatment, schedule MRI

Visit 3 - December 10, 2023
MRI Results: Right rotator cuff tear, L3-L4 compression fracture confirmed
Treatment: Referral to physical therapy, continue medications
Plan: Re-evaluate in 6 weeks for possible surgical intervention

PHYSICAL THERAPY
Facility: Rehab Plus Physical Therapy
Address: 321 Therapy Lane, San Diego, CA 92105
Therapist: Maria Garcia, PT
Dates: December 15, 2023 - March 20, 2024 (24 sessions)
Progress: Gradual improvement in range of motion, persistent pain

CURRENT STATUS:
- Right shoulder: Limited range of motion, persistent pain
- Lower back: Chronic pain, difficulty with prolonged standing
- Medications: Oxycodone 5mg as needed, Ibuprofen 800mg three times daily
- Work Status: Unable to return to construction work

PROGNOSIS: Guarded. Patient may require surgical intervention for rotator cuff repair.`
    }
  ]
};

const unstructuredEmail: EmailInput = {
  subject: 'help with ime',
  sender: 'info@smalllaw.com',
  recipients: ['triage@brighterway.ai'],
  body: `hi there,

so we have this client, her name is amanda white. she was in a car crash in early 2023 (think january 2023).

case number might be AW-2025-9911 or close to that.

we need an ime done. exam type: orthopedic (neck/back) or maybe neuro if you think that's better.
preferred ime date: sometime next month, maybe around july 15, 2025, but flexible.
location: sacramento area.

doctor said something about a herniated disc in her neck/back. she's been seeing dr. patel at a clinic in sacramento, but records are messy.

can you help us set this up? we have one attachment with the notes.

thanks!
bob
small law office
`,
  attachments: [
    {
      filename: 'records.pdf',
      content: `PATIENT: AMANDA WHITE
DOB: 08/14/1982
Case: AW-2025-9911 (approx)
Location: Sacramento, CA

Incident: Motor vehicle accident in January 2023

Provider: Dr. R. Patel, Sacramento Spine Clinic
Visits:
- Feb 10, 2023: Initial eval, neck/back pain, possible C5-C6 herniation
- Mar 05, 2023: Follow-up, MRI ordered
- Mar 20, 2023: MRI results show C5-C6 disc protrusion
- Apr 15, 2023: Physical therapy started

Diagnoses: Cervical disc herniation (C5-C6), lumbar strain
Treatment: PT, NSAIDs, muscle relaxants
Status: Ongoing neck and back pain, limited range of motion`
    }
  ]
};

const emailTemplates: Record<EmailStyle, EmailInput> = {
  clean: cleanEmail,
  messy: messyEmail,
  structured: structuredEmail,
  unstructured: unstructuredEmail
};

function createEmail(style: EmailStyle = 'clean'): EmailInput {
  return emailTemplates[style];
}

function listStyles() {
  console.log('\nAvailable email styles:');
  console.log('  clean        - Well-formatted, professional email with complete information');
  console.log('  messy        - Unstructured, informal email with uncertain information');
  console.log('  structured   - Formal, highly structured email with detailed information');
  console.log('  unstructured - Very informal, minimal information, poorly organized\n');
}

// CLI interface
if (require.main === module) {
  const style = process.argv[2] as EmailStyle;
  
  if (!style || !emailTemplates[style]) {
    console.log('Usage: tsx src/utils/emailCreator.ts [style]');
    listStyles();
    process.exit(1);
  }
  
  const email = createEmail(style);
  console.log(JSON.stringify(email, null, 2));
}

export { createEmail, listStyles, EmailStyle, emailTemplates };

