// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import {
    getChatById,
    getChatDetails,
    getMessages,
    getMyChats,
    getUserStatus,
    newGroupChat,
} from '../controllers/chatController.js';
import { isAuthenticated } from '../middleware/auth.js';

// ##########################
const router: Router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
router.get('/chat/my', isAuthenticated, getMyChats);
router.get('/chat/details/:id', isAuthenticated, getChatDetails);
router.get('/chat/user/status', isAuthenticated, getUserStatus);
router.get('/message/:id', isAuthenticated, getMessages);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post('/chat/new', isAuthenticated, newGroupChat);
router.post('/chat/:id', isAuthenticated, getChatById);

export default router;
