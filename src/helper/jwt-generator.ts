import jwt from 'jsonwebtoken';

/**
 * Generate a jwt access token, by signing the token with the access token secret from the .env file.
 * The difference to generateRefreshToken is, accessToken live much shorter and use the accessTokenSecret instead
 * of the RefreshTokenSecret.
 * The default duration of the accessToken is currently one day.
 *
 * @param payload - Payload of the jwt.
 * @returns returns a signed jsonWebToken as a string.
 */
const generateAccessToken = (payload: object | string) => {
  //get secret key from .env file
  const secret = process.env.JWT_ACCESS_KEY;
  if (!secret) {
    //throw error if .env couldn't be read.
    throw 'The secret key could not be read.';
  }
  //TODO adjust time
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });
  return token;
};

/**
 * Generate a jwt refresh token, by signing the token with the RefreshTokenSecret from the .env file.
 * The difference to generateAccessToken is, refresh token live much longer and use the RefreshTokenSecret.
 * The default duration of the refreshToken is currently one week.
 *
 * @param payload - Payload of the jwt.
 * @returns returns a signed jsonWebToken as a string.
 */
const generateRefreshToken = (payload: object | string) => {
  //get secret key from .env file
  const secret = process.env.JWT_REFRESH_KEY;
  if (!secret) {
    //throw error if .env couldn't be read.
    throw 'The secret key could not be read.';
  }
  //TODO adjust time
  const token = jwt.sign(payload, secret, { expiresIn: '7d' });
  return token;
};

export { generateAccessToken, generateRefreshToken };
