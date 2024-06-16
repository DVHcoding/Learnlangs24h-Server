// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { getMyChats, newGroupChat } from '../controllers/chatController.js';
import { isAuthenticated } from '../middleware/auth.js';

// ##########################
const router: Router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
router.get('/chat/my', isAuthenticated, getMyChats);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post('/chat/new', isAuthenticated, newGroupChat);

export default router;
