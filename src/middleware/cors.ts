import Express from 'express';

/**
 * Middleware to add Cors-Headers to the request, so that the request is not blocked.
 *
 * @param req - Request from Express
 * @param res - Response from Express
 * @param next - Next function, used to forward to next middleware
 */
export = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
};
