import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import HttpError from '../error/http_error';
import config from '../helper/config';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../helper/jwt-generator';
import IUser from '../interfaces/user';
import User from '../model/user';

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    return res.json({ count: users.length, users: users });
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usersWithEmail: IUser[] = await User.find({ email: req.body.email });
    if (usersWithEmail.length > 0) {
      //send error
      const httpError = new HttpError(
        409,
        `User with mail ${req.body.email} already exist. You can try to signup at https://${config.host}${config.port}/user/signup}`
      );
      //forward error to error handler
      return next(httpError);
    }
    //get user from body
    const user: any = new User({
      email: req.body.email.toLowercase(),
      pushMessageToken: req.body.pushMessageToken,
    });
    await user.save();
    //TODO: send a email with authCode
    return res.status(201).json({ user: user });
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get id from params
    const id = req.params.userId;

    //check if the id is a valid object id
    if (!isValidObjectId(id)) {
      const error = new HttpError(400, `Invalid Id: ${id}`);
      return next(error);
    }

    //find user
    const userData = {
      email: req.body.email,
      pushMessageToken: req.body.pushMessageToken,
    };
    const user: IUser = await User.findOneAndUpdate({ _id: id }, userData, {
      returnOriginal: false,
    });
    return res.status(201).json(user);
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get id from params
    const id = req.params.userId;

    //check if the id is a valid object id
    if (!isValidObjectId(id)) {
      const error = new HttpError(400, `Invalid Id: ${id}`);
      return next(error);
    }

    const user: IUser = await User.findById(id);
    if (!user) {
      //if the user is not found/already deleted respond with 404;
      const error = new HttpError(404, `User with id ${id} not found`);
      return next(error);
    }
    //delete user and return 204 (No Content)
    await user.delete();
    return res.status(204).json();
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get id from params
    const id = req.params.userId;
    //check if the id is a valid object id
    if (!isValidObjectId(id)) {
      const error = new HttpError(400, `Invalid Id: ${id}`);
      return next(error);
    }

    //get user by id
    const user: IUser = await User.findById(id);
    if (!user) {
      //if the user is not found/already deleted respond with 404;
      const error = new HttpError(404, `User with id ${id} not found`);
      return next(error);
    }

    //TODO remove in production, this is only for development
    if (req.body.emailCode == '100000') {
      const accessToken = generateAccessToken({ user: user._id });
      const refreshToken = generateRefreshToken({ user: user._id });
      return res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
    //check if the emailCode from the body match the code in the user document
    //and if the code isn't older then 10 minutes
    const currentTime = new Date().getTime();
    //set time difference to 10 minutes
    const codeCreateTime = user.lastCodeRequest.getTime() + 10 * 60 * 1000;
    if (req.body.emailCode !== user.mailAuthCode) {
      const error = new HttpError(409, 'The emailCode is incorrect');
      return next(error);
    } else if (codeCreateTime <= currentTime) {
      //code is too old
      //generate a new random 6 digit auth code
      const emailAuthCode = Math.floor(100000 + Math.random() * 900000);

      //update and save the user and update the code generated time
      user.set({ mailAuthCode: emailAuthCode, lastCodeRequest: Date.now() });
      await user.save();

      //TODO send a new email with a new auth code
      const error = new HttpError(
        409,
        'The send mailAuthCode is too old. A new one has been generated and a new email has been send.'
      );
      return next(error);
    } else {
      //generate jwt
      const accessToken = generateAccessToken({ user: user._id });
      const refreshToken = generateRefreshToken({ user: user._id });
      //refresh mailAuthCode for security
      //generate a new random 6 digit auth code
      const emailAuthCode = Math.floor(100000 + Math.random() * 900000);

      //update and save the user and update the code generated time
      user.set({ mailAuthCode: emailAuthCode, lastCodeRequest: Date.now() });
      await user.save();

      // return jwt
      return res.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user id from url
    const id = req.params.userId;

    //check if the id is a valid object id
    if (!isValidObjectId(id)) {
      const error = new HttpError(400, `Invalid Id: ${id}`);
      return next(error);
    }
    //TODO: maybe check if the id from the token is the same as in the url, since currently you can get tokens from another id

    //find user in db
    const user: IUser = await User.findById(id);

    //generate jwt
    const accessToken = generateAccessToken({ user: user._id });
    //generate a new refreshToken for token rotation
    const refreshToken = generateRefreshToken({ user: user._id });
    //return tokens to the user
    return res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    //convert error, so it has an statusCode
    const httpError = new HttpError(500, error.message);
    //forward error to error handler
    next(httpError);
  }
};

export default {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  refreshToken,
};
