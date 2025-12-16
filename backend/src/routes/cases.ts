import express, { Request, Response } from 'express';
import { getCaseById, getAllCases } from '../services/emailProcessor';

const router = express.Router();

// Get all cases
router.get('/', (req: Request, res: Response) => {
  try {
    const cases = getAllCases();
    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({
      error: 'Failed to fetch cases',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get case by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid case ID' });
    }

    const caseData = getCaseById(id);
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({
      error: 'Failed to fetch case',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

