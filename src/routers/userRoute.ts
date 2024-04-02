// ##########################
// #      IMPORT NPM        #
// ##########################
import express, { Router } from "express";

// ##########################
// #    IMPORT Components   #
// ##########################
import { getUsers } from "../controllers/userController.js";

// ##########################
const router: Router = express.Router();

router.get("/users", getUsers);

export default router;
