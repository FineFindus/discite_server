import express from 'express';
import Joi from 'joi';
import userController from '../controller/user_controller';
import {
  authenticateAccessToken,
  authenticateRefreshToken,
} from '../middleware/authenticator';
import validate from '../middleware/validator';

const router = express.Router();

/**
 * GET route to get all user.
 * THis is should not be enabled in production mode.
 * TODO: remove this in production
 */
router.get('/', userController.getAllUsers);

/**
 * This
 */
router.post(
  '/signup',
  validate(
    Joi.object({
      email: Joi.string()
        .pattern(
          /^[a-zA-Z]+\.+[a-zA-Z]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?igs-buchholz\.de$/
        )
        .trim()
        .required(),
      pushMessageToken: Joi.string().trim(),
    })
  ),
  userController.createUser
);

router.put(
  '/:userId',
  validate(
    Joi.object({
      email: Joi.string()
        .pattern(
          /^[a-zA-Z]+\.+[a-zA-Z]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?igs-buchholz\.de$/
        )
        .trim()
        .required(),
      pushMessageToken: Joi.string(),
    })
  ),
  authenticateAccessToken,
  userController.updateUser
);

router.delete('/:userId', authenticateAccessToken, userController.deleteUser);

router.post(
  '/login/:userId',
  validate(
    Joi.object({
      emailCode: Joi.number().min(100000).max(999999).required(),
    })
  ),
  userController.loginUser
);

router.get(
  '/refreshToken/:userId',
  authenticateRefreshToken,
  userController.refreshToken
);

// router.get(
//   '/',
//   (
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {}
// );

export = router;
