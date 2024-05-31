// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from '../middleware/auth.js';
import { userDetails, userDetailsByNickName } from '../controllers/userController.js';

// ##########################
const router: Router = express.Router();

router.get('/me', isAuthenticated, userDetails);
router.get('/profile/:nickname', userDetailsByNickName);

export default router;
