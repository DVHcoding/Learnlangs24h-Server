// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import {
  loginGoogle,
  loginUser,
  registerUser,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router: Router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login-google", loginGoogle);

export default router;
