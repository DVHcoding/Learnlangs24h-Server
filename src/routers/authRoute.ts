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
  logoutUser,
  registerUser,
} from "../controllers/authController.js";

const router: Router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/login-google", loginGoogle);

export default router;
