import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import user from '../model/user';
import IUser from '../interfaces/user';

const mongodb = new MongoMemoryServer();

describe('Create a user, login and refresh tokens ', () => {
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

  afterAll(async (done) => {
    //close mongo connection
    await mongoose.connection.close();
    await mongodb.stop();
    done();
  });

  test('GET /users, except none', async () => {
    //request all users
    const { status, text } = await request(app).get('/user');

    const expectedResponseObject = {
      count: 0,
      users: [],
    };
    const expectedResponseStatusCode = 200;

    expect(status).toEqual(expectedResponseStatusCode);
    expect(text).toEqual(JSON.stringify(expectedResponseObject));
  });

  test('POST /signup, to create a user, expect a 200', async () => {
    //create a single user
    const { status, text } = await request(app)
      .post('/user/signup')
      .send({ email: 'Test.User@igs-buchholz.de' });

    const expectedResponseObject = {
      email: 'Test.User@igs-buchholz.de',
    };

    const expectedResponseStatusCode = 201;

    expect(status).toEqual(expectedResponseStatusCode);
    expect(text).toContain(expectedResponseObject.email);
  });

  test('POST /login, to login a user, expect 201 and tokens', async () => {
    //get the user from db to find the mail Code, which is otherwise send per mail
    const users: IUser[] = await user.find();

    //get email code of the user from db
    const { status, body } = await request(app)
      .post(`/user/login/${users[0].id}`)
      .send({ emailCode: users[0].mailAuthCode });

    const expectedResponseStatusCode = 200;

    const expectedResponseObject = {
      accessToken: expect.anything(),
      refreshToken: expect.anything(),
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toMatchObject(expectedResponseObject);
  });

  test('POST /refreshToken, to refresh the tokens, expect 200 and tokens', async () => {
    //get the user from db to find the mail Code, which is otherwise send per mail
    const users: IUser[] = await user.find();

    //get refreshToken from login
    //get email code of the user from db
    const tokensRequest = await request(app)
      .post(`/user/login/${users[0].id}`)
      .send({ emailCode: users[0].mailAuthCode });

    //get email code of the user from db
    const { status, body } = await request(app)
      .get(`/user/refreshToken/${users[0].id}`)
      .set('Authorization', 'bearer ' + tokensRequest.body.refreshToken);

    const expectedResponseStatusCode = 200;

    const expectedResponseObject = {
      accessToken: expect.anything(),
      refreshToken: expect.anything(),
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toMatchObject(expectedResponseObject);
  });

  test('GET undefined route, except 404 error', async () => {
    //define a nonexisting route
    const route = '/undefined-route';

    //request all users
    const { status, text } = await request(app).get(route);

    const expectedResponseStatusCode = 404;

    const expectedResponseObject = {
      error: {
        code: expectedResponseStatusCode,
        message: `Unable to find route: ${route}`,
      },
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(text).toEqual(JSON.stringify(expectedResponseObject));
  });
});

describe('Signup User with wrong parameter', () => {
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

  test('POST /user/signup, without parameter, expect 400', async () => {
    const route = '/user/signup';

    const { status, text } = await request(app).post(route);

    const expectedResponseStatusCode = 400;

    const expectedResponseObject = {
      error: {
        code: expectedResponseStatusCode,
        message: 'Validation error: "email" is required',
      },
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(text).toEqual(JSON.stringify(expectedResponseObject));
  });

  test('POST /user/signup, with wrong email, expect 400', async () => {
    const route = '/user/signup';

    //request all users
    const { status, body } = await request(app)
      .post(route)
      .send({ email: 'Test.User@gmail.com' });

    const expectedResponseStatusCode = 400;

    const expectedResponseObject = {
      error: {
        code: expectedResponseStatusCode,
        message: expect.any(String), //this should contain more error codes
      },
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  test('POST /user/signup, with wrong email parameter, expect 400', async () => {
    const route = '/user/signup';

    //request all users
    const { status, body } = await request(app).post(route).send({ email: 42 });

    const expectedResponseStatusCode = 400;

    const expectedResponseObject = {
      error: {
        code: expectedResponseStatusCode,
        message: expect.any(String),
      },
    };

    expect(status).toEqual(expectedResponseStatusCode);
    expect(body).toEqual(expectedResponseObject);
  });

  afterAll(async (done) => {
    //close mongo connection
    await mongoose.connection.close();
    await mongodb.stop();
    done();
  });
});
