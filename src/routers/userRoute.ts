// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from 'express';

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from '../middleware/auth.js';
import {
    addFriend,
    followUser,
    searchUsers,
    unFollow,
    unFriend,
    userDetails,
    userDetailsByNickName,
    userDetailsPopulate,
} from '../controllers/userController.js';

// ##########################
const router: Router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
router.get('/me', isAuthenticated, userDetails);
router.get('/userDetailsPopulate/:nickname', isAuthenticated, userDetailsPopulate);
router.get('/profile/:nickname', userDetailsByNickName);
router.get('/user', isAuthenticated, searchUsers);

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */
router.post('/followUser', isAuthenticated, followUser);
router.post('/unFollow', isAuthenticated, unFollow);
router.post('/addFriend', isAuthenticated, addFriend);
router.post('/unFriend', isAuthenticated, unFriend);

export default router;
