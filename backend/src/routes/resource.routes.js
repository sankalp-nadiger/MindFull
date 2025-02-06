import express from 'express';
import { fetchResourceRecommendations } from '../controllers/resource.controller.js';
import { user_verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST route to create a resource based on interests
router.get('/create-resource', user_verifyJWT, fetchResourceRecommendations);

export default router;
