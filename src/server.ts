import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import config from './helper/config';

//load dotenv variables
dotenv.config();

/**
 * Main function
 */
const main = async () => {
  try {
    console.log('ConnectionString: ' + config.mongoUri);
    console.log('Connecting to database...');
    await mongoose.connect(config.mongoUri, config.mongooseOptions);
    console.log('Connect to database: ✅');
    // await mongoose.connection.dropDatabase();
  } catch (error) {
    console.log('Failed to connect to database: ❌');
    console.log('connection error:' + error);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(
      `Server started.\nListening at ${config.host}${config.port} \nPress CTRL-C to stop`
    );
  });
};

//main function to use async code
main();
