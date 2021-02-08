import Express from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '../error/http_error';

const authenticateAccessToken = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  //get token from header
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw 'Auth failed, since the Authorization header was null';
    }
    const token = authHeader.split(' ')[1];
    //get secret key from .env file
    const secret = process.env.JWT_ACCESS_KEY;
    if (!secret) {
      //throw error if .env couldn't be read.
      throw 'The secret key could not be read.';
    }
    const tokenData = jwt.verify(token, secret);

    console.log(tokenData);
    // req.body.tokenData = tokenData;
    next();
  } catch (error) {
    const responseError = new HttpError(401, `Authorization failed`);
    return next(responseError);
  }
};

const authenticateRefreshToken = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  //get token from header
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw 'Auth failed, since the Authorization header was null';
    }
    const token = authHeader.split(' ')[1];
    //get secret key from .env file
    const secret = process.env.JWT_REFRESH_KEY;
    if (!secret) {
      //throw error if .env couldn't be read.
      throw 'The secret key could not be read.';
    }
    const tokenData = jwt.verify(token, secret);

    console.log(tokenData);
    // req.body.tokenData = tokenData;
    next();
  } catch (error) {
    const responseError = new HttpError(401, `Authorization failed`);
    return next(responseError);
  }
};

export { authenticateAccessToken, authenticateRefreshToken };
