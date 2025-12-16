import express, { Request, Response } from 'express';
import { EmailInput } from '../models/schemas';
import { processEmail } from '../services/emailProcessor';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const emailInput: EmailInput = req.body;

    // Validate required fields
    if (!emailInput.subject || !emailInput.sender || !emailInput.body) {
      return res.status(400).json({
        error: 'Missing required fields: subject, sender, body'
      });
    }

    // Process the email
    const result = await processEmail(emailInput);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({
      error: 'Failed to process email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

