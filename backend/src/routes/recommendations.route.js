/ routes/recommendations.route.js
import express from 'express';
import { fetchRecommendations } from '../controllers/recommendations.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, fetchRecommendations);

export default router;
