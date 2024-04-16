// ##########################
// #      IMPORT NPM        #
// ##########################
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// ##########################
// #    IMPORT Components   #
// ##########################
import userRoute from "./routers/userRoute.js";
import authRoute from "./routers/authRoute.js";
import courseRoute from "./routers/courseRoute.js";

import { errorMiddleware } from "./middleware/error.js";

const app = express();
// ##########################
app.use(
  cors({
    origin: "",
    credentials: true, // Bật chia sẻ cookie qua CORS
  })
);

app.use(bodyParser.json()); // dùng để consol.log được req.body gửi về từ phía client
app.use(bodyParser.urlencoded({ extended: true })); // dùng để consol.log được req.body gửi về từ phía client
app.use(cookieParser());

// ##########################
// #        ROUTES          #
// ##########################
app.use("/api/v1", userRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", courseRoute);

// ############################
// # Handler middleware error #
// ############################
app.use(errorMiddleware);

export default app;
