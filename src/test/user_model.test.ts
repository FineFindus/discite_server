import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../model/user';
import IUser from '../interfaces/user';
import Offer from '../model/offer';
import IOffer from '../interfaces/offer';

const mongodb = new MongoMemoryServer();

//user data to create a user
const userData = {
  email: 'Example.Mail@igs-buchholz.de',
};

describe('Test user model', () => {
  beforeAll(async (done) => {
    //create a in memory server for testing
    const uri = await mongodb.getUri();
    //options from mongoose documentation
    const mongooseOptions: mongoose.ConnectOptions = {
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
    try {
      await mongoose.connect(uri, mongooseOptions);
      console.log('Connect to test database: ✅');
    } catch (error) {
      console.log('Failed to connect to test database: ❌');
      console.log('connection error:' + error);
      process.exit(1);
    }
    done();
  });

  test('Create user, should exist', async () => {
    //create and save user
    const user = new User(userData);
    await user.save();

    expect(user._id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.pushMessageToken).toBeUndefined();
  });

  test('Update user, properties should change', async () => {
    //new userData
    const newUserData = { email: 'New.Email@igs-buchholz.de' };
    //create and save user
    const users: IUser[] = await User.find();
    let user: IUser = users[0];

    user = await User.findByIdAndUpdate({ _id: user._id }, newUserData, {
      returnOriginal: false,
    });

    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(user.email).toBe(newUserData.email);
    expect(user.pushMessageToken).toBeUndefined();
  });

  test('Try to create user, with wrong email, throw error', async () => {
    const wrongUserData = { email: 'Wrong@gmail.com' };
    const user = new User(wrongUserData);

    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  test('Delete existing user', async () => {
    let deletedUser = await User.deleteOne(userData, { returnOriginal: false });
    expect(deletedUser).toEqual({ deletedCount: 0, n: 0, ok: 1 });
  });
});
