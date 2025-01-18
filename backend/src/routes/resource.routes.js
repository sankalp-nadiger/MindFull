import express from 'express';
import { createResource } from '../controllers/resourceController'; // Import the controller function

const router = express.Router();

// POST route to create a resource based on interests
router.post('/create-resource', createResource);

export default router;
