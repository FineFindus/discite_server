import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import favIcon from 'serve-favicon';
import cors from './middleware/cors';
import bodyParser from 'body-parser';
import HttpError from './error/http_error';
//import routes
import userRoutes from './routes/user';
import offerRoutes from './routes/offer';
//import own middleware
import { authenticateAccessToken } from './middleware/authenticator';
//load dotenv variables
dotenv.config();

const app = express();

//disable powered by header
app.disable('x-powered-by');

/**Add middleware to all routes */
//cors for cors
app.use(cors);
//helmet for protection
app.use(helmet());
//morgan for logging
app.use(
  morgan(
    'dev'
    // 'IP[:remote-addr] - :method :url :status :response-time ms - :res[content-length]'
  )
);
//fav icon for nice looks, although nobody will ever see this （￣︶￣）↗
app.use(favIcon('favicon.ico'));
//use body-parser for json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * ROUTES
 */
//user routes
app.use('/user', userRoutes);
//all offer routes are protected by a accessToken
app.use('/offer', authenticateAccessToken, offerRoutes);

/**
 * Handler for undefined routes. Forwards a 404 error to the error handler.
 *
 * @param req - Express Request
 * @param res Express Response
 * @param next Express Next Function
 *
 * @return Returns by sending the response with a 500 or the statusCode of the error
 */
app.get(
  '*',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const error = new HttpError(404, `Unable to find route: ${req.url}`);
    next(error);
  }
);

/**
 * Error handler, which return the error message in a nice json format, with status code and error message. If the error has not statusCode,
 * the code 500 will be used.
 *
 * @param error - The error
 * @param req - Express Request
 * @param res Express Response
 * @param next Express Next Function
 *
 * @return Returns by sending the response with a 500 or the statusCode of the error
 */
app.use(
  (
    error: HttpError | Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let statusCode = 500;
    //check if error contains statuscode and set it
    if (error instanceof HttpError) {
      statusCode = error.statusCode;
    }
    //return error
    return res.status(statusCode).send({
      error: {
        code: res.statusCode,
        message: error.message,
      },
    });
  }
);

export default app;
