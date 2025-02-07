import express from 'express';
import { createCommunityRoom, joinCommunityRoom, sendMessageToCommunityRoom ,getCommunityRooms} from '../controllers/community.controller.js';
import { user_verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', user_verifyJWT, createCommunityRoom); // Create a Room
router.post('/join', user_verifyJWT, joinCommunityRoom); // Join a Room
router.get('/rooms', user_verifyJWT, getCommunityRooms);
router.post('/message', user_verifyJWT, sendMessageToCommunityRoom); // Send a Message

export default router;
