import express from 'express';
import { fetchRecommendations } from '../controllers/resource.controller.js';

const router = express.Router();

// POST route to create a resource based on interests
router.post('/create-resource', verifyJWT, fetchRecommendations);

export default router;
