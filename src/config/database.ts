// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose from "mongoose";

// ##########################
// #    IMPORT Components   #
// ##########################

const connectDatabase = (): void => {
  mongoose.connect(`${process.env.MONGO_URL}`).then((data) => {
    console.log(`Mongodb connect with server: ${data.connection.host}`);
  });
};

export default connectDatabase;
