// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from '../middleware/auth.js';
import { followUser, unFollow, userDetails, userDetailsByNickName } from '../controllers/userController.js';

// ##########################
const router: Router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
router.get('/me', isAuthenticated, userDetails);
router.get('/profile/:nickname', userDetailsByNickName);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post('/followUser', isAuthenticated, followUser);
router.post('/unFollow', isAuthenticated, unFollow);

export default router;
