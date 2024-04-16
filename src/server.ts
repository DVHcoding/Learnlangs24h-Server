// ##########################
// #      IMPORT NPM        #
// ##########################
import dotenv from "dotenv";
dotenv.config();

// ##########################
// #    IMPORT Components   #
// ##########################
import app from "./app.js";
import connectDatabase from "./config/database.js";

// Mongodb
connectDatabase();

// ##########################
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});
