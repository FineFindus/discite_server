import mongoose from 'mongoose';
import IOffer from '../interfaces/offer';

const offerSchema = new mongoose.Schema(
  {
    userMail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptingUser: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    subject: { type: String, required: true },
    topic: [{ type: String, required: true }],
    year: { type: Number, default: 5 },
    endDate: { type: Date, default: Date.now },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>('Offer', offerSchema);
