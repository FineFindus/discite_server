import Express from 'express';
import { isValidObjectId } from 'mongoose';
import HttpError from '../error/http_error';
import IOffer from '../interfaces/offer';
import Offer from '../model/offer';

const getAllOffers = async (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    const offers = await Offer.find();
    res.json({ count: offers.length, offers: offers });
  } catch (error) {
    next(error);
  }
};

const getOffer = async (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    //get id from url;
    const id = req.params.offerId;

    //validate object id
    if (!isValidObjectId(id)) {
      const error = new HttpError(400, `Invalid Id: ${id}`);
      return next(error);
    }

    const offer = await Offer.findById(id);
    //check if user is undefined
    if (!offer) {
      const error = new HttpError(404, `Unable to find offer with id: ${id}`);
      next(error);
    }

    res.json(offer);
  } catch (error) {
    next(error);
  }
};

const createOffer = async (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    const offer: IOffer = new Offer({
      userMail: req.body.userMail,
      subject: req.body.subject,
      topic: req.body.topic,
      year: req.body.year,
      endDate: req.body.endDate,
      isAccepted: req.body.isAccepted,
    });
    await offer.save();
    res.status(201).json({ offer: offer });
  } catch (error) {
    next(error);
  }
};

const updateOffer = async (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    const id = req.params.offerId;

    //validate id
    if (!isValidObjectId(id)) {
      const error = new HttpError(404, `Invalid id: ${id}`);
      return next(error);
    }

    const data = {
      userMail: req.body.userMail,
      subject: req.body.subject,
      topic: req.body.topic,
      year: req.body.year,
      endDate: req.body.endDate,
      isAccepted: req.body.isAccepted,
    };
    //find and update
    const offer: IOffer = await Offer.findOneAndUpdate({ _id: id }, data, {
      returnOriginal: false,
    });

    //check if user exist
    if (!offer) {
      const error = new HttpError(404, `Unable to find offer with id: ${id}`);
      return next(error);
    }

    return res.status(201).json(offer);
  } catch (error) {
    next(error);
  }
};

const deleteOffer = async (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    const id = req.params.offerId;

    //validate id
    if (!isValidObjectId(id)) {
      const error = new HttpError(404, `Invalid id: ${id}`);
      return next(error);
    }

    const offer: IOffer = await Offer.findById(id);

    //check if user exist
    if (!offer) {
      const error = new HttpError(404, `Unable to find offer with id: ${id}`);
      return next(error);
    }

    //delete offer
    await offer.delete();

    return res.status(203).json(offer);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
};
