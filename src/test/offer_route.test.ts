import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import user from '../model/user';
import IUser from '../interfaces/user';
import offer from '../model/offer';
import IOffer from '../interfaces/offer';

const mongodb = new MongoMemoryServer();

var userToken: String;
var testUser: IUser;

describe('Create a offer ', () => {
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

    //create a user
    await request(app)
      .post('/user/signup')
      .send({ email: 'Test.User@igs-buchholz.de' });

    const users: IUser[] = await user.find();
    testUser = users[0];

    const { body } = await request(app)
      .post(`/user/login/${users[0]._id}`)
      .send({ emailCode: users[0].mailAuthCode });

    userToken = body.accessToken;

    done();
  });

  afterAll(async (done) => {
    //close mongo connection
    await mongoose.connection.close();
    await mongodb.stop();
    done();
  });

  test('GET /offer, expect 200', async () => {
    const route = '/offer';

    //request all users
    const { status, body } = await request(app)
      .get(route)
      .set('Authorization', 'bearer ' + userToken);

    const expectedResponseStatusCode = 200;

    const expectedResponseObject = {
      count: 0,
      offers: [],
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  test('POST /offer, with correct paramter expect 201', async () => {
    const route = '/offer';

    const { status, body } = await request(app)
      .post(route)
      .set('Authorization', 'bearer ' + userToken)
      .send({
        userMail: testUser._id,
        subject: 'Subject.math',
        topic: ['Functions'],
        year: 11,
        endDate: new Date(Date.now() + 1 * 1000 * 60),
        isAccepted: false,
      });

    const expectedResponseStatusCode = 201;

    const expectedResponseObject = {
      offer: {
        acceptingUser: [],
        topic: ['Functions'],
        year: 11,
        isAccepted: false,
        _id: expect.any(String),
        userMail: testUser._id.toString(),
        subject: 'Subject.math',
        endDate: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      },
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  test('GET /offer, return the created offer, expect 200', async () => {
    const route = '/offer';

    //request all users
    const { status, body } = await request(app)
      .get(route)
      .set('Authorization', 'bearer ' + userToken);

    const expectedResponseStatusCode = 200;

    const expectedResponseObject = {
      count: 1,
      offers: [
        {
          acceptingUser: [],
          topic: ['Functions'],
          year: 11,
          isAccepted: false,
          _id: expect.any(String),
          userMail: testUser._id.toString(),
          subject: 'Subject.math',
          endDate: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.any(Number),
        },
      ],
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  test('POST /offer, with wrong paramter expect 400', async () => {
    const route = '/offer';

    const { status, body } = await request(app)
      .post(route)
      .set('Authorization', 'bearer ' + userToken)
      .send({
        userMail: testUser._id + 'test',
        subject: 'Subject.math',
        topic: [],
        year: 16,
        endDate: new Date(Date.now() - 1 * 1000 * 60),
        isAccepted: false,
      });

    const expectedResponseStatusCode = 400;

    expect(status).toEqual(expectedResponseStatusCode);
  });

  test('PUT /offer, returns the updated offer, expect 200', async () => {
    const offers = await offer.find();
    const route = `/offer/${offers[0]._id}`;

    const { status, body } = await request(app)
      .put(route)
      .set('Authorization', 'bearer ' + userToken)
      .send({
        userMail: testUser._id,
        subject: 'Subject.math',
        topic: ['Functions', 'Terms'],
        year: 11,
        endDate: new Date(Date.now() + 1 * 1000 * 60),
        isAccepted: false,
      });

    const expectedResponseStatusCode = 201;

    const expectedResponseObject = {
      acceptingUser: [],
      topic: ['Functions', 'Terms'],
      year: 11,
      isAccepted: false,
      _id: expect.any(String),
      userMail: testUser._id.toString(),
      subject: 'Subject.math',
      endDate: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      __v: expect.any(Number),
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  test('PUT /offer, with wrong paramter, expect 200', async () => {
    const offers = await offer.find();
    const route = `/offer/${offers[0]._id}`;

    const { status, body } = await request(app)
      .put(route)
      .set('Authorization', 'bearer ' + userToken)
      .send({
        userMail: testUser._id,
        subject: 'Subject.math',
        topic: [],
        year: 20,
        endDate: new Date(Date.now() + 1 * 1000 * 60),
        isAccepted: false,
      });

    const expectedResponseStatusCode = 400;

    expect(status).toEqual(expectedResponseStatusCode);
  });

  test('DELETE /offer, expect 200', async () => {
    const offers = await offer.find();
    const route = `/offer/${offers[0]._id}`;

    const { status, body } = await request(app)
      .delete(route)
      .set('Authorization', 'bearer ' + userToken);

    const expectedResponseStatusCode = 203;

    expect(status).toEqual(expectedResponseStatusCode);
  });

  test('DELETE /offer, non existing, expect 200', async () => {
    const route = `/offer/603cb93e19a0ca4b44b11b96`;

    const { status, body } = await request(app)
      .delete(route)
      .set('Authorization', 'bearer ' + userToken);

    const expectedResponseStatusCode = 404;

    expect(status).toEqual(expectedResponseStatusCode);
  });

  test('GET /offer, expect 200', async () => {
    const route = '/offer';

    //request all users
    const { status, body } = await request(app)
      .get(route)
      .set('Authorization', 'bearer ' + userToken);

    const expectedResponseStatusCode = 200;

    const expectedResponseObject = {
      count: 0,
      offers: [],
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });
});
