// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { getChatById, getChatDetails, getMyChats, newGroupChat } from '../controllers/chatController.js';
import { isAuthenticated } from '../middleware/auth.js';

// ##########################
const router: Router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
router.get('/chat/my', isAuthenticated, getMyChats);
router.get('/chat/details/:id', isAuthenticated, getChatDetails);
router.get('/message/:id', isAuthenticated, getChatDetails);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post('/chat/new', isAuthenticated, newGroupChat);
router.post('/chat/:id', isAuthenticated, getChatById);

export default router;
