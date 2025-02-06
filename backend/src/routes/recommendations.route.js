/ routes/recommendations.route.js
import express from 'express';
import { fetchRecommendations } from '../controllers/recommendations.controller.js';
import { user_verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:id/fetch-resource', user_verifyJWT, fetchRecommendations);

export default router;