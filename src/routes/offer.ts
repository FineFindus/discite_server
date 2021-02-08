import express from 'express';
import Joi from 'joi';
import validate from '../middleware/validator';
import offerController from '../controller/offer_controller';
import { join } from 'path';

const router = express.Router();

router.get('/', offerController.getAllOffers);

router.get('/:offerId', offerController.getOffer);

router.post(
  '/',
  validate(
    Joi.object({
      userMail: Joi.required(),
      subject: Joi.string().required(),
      topic: Joi.array().items(Joi.string().required()),
      year: Joi.number().min(5).max(13).required(),
      endDate: Joi.date().greater('now').required(),
      isAccepted: Joi.boolean().required(),
    })
  ),
  offerController.createOffer
);

router.put(
  '/:offerId',
  validate(
    Joi.object({
      userMail: Joi.required(),
      subject: Joi.string().required(),
      topic: Joi.array().items(Joi.string().required()),
      year: Joi.number().min(5).max(13).required(),
      endDate: Joi.date().greater('now').required(),
      isAccepted: Joi.boolean().required(),
    })
  ),
  offerController.updateOffer
);

router.delete('/:offerId', offerController.deleteOffer);

export = router;
