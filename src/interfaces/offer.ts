import { Document, Schema } from 'mongoose';
export default interface IOffer extends Document {
  userMail: Schema.Types.ObjectId;
  acceptingUser: Schema.Types.ObjectId[];
  subject: String;
  topic: String[];
  year: Number;
  endDate: Date;
  isAccepted: Boolean;
}
