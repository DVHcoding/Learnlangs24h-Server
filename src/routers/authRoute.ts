// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import { isAuthenticated } from "../middleware/auth.js";
import {
  detailsUser,
  loginUser,
  registerUser,
} from "../controllers/authController.js";

const router: Router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isAuthenticated, detailsUser);

export default router;
