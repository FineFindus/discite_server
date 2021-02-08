import { ConnectOptions } from 'mongoose';

export default class config {
  //options from mongoose documentation
  static mongooseOptions: ConnectOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };

  //mongoose uri
  static mongoUri = process.env.MONGO_URI || '';

  //create at port from env or 3000;
  static port = process.env.PORT || 3000;
  //host name
  static host = process.env.HOST || 'http://localhost:';

  static isProduction = process.env.NODE_ENV === 'production';
}
