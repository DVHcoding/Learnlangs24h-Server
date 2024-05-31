// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from '../middleware/auth.js';
import { detailsUser, userDetailsByNickName } from '../controllers/userController.js';

// ##########################
const router: Router = express.Router();

router.get('/me', isAuthenticated, detailsUser);
router.get('/profile/:nickname', userDetailsByNickName);

export default router;
