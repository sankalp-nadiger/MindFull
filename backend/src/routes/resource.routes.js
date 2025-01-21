import express from 'express';
import { fetchRecommendations } from '../controllers/resource.controller.js';
import { user_verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST route to create a resource based on interests
router.post('/create-resource', fetchRecommendations);

export default router;
