import { Document } from 'mongoose';

export default interface IUser extends Document {
  email: string;
  pushMessageToken: string;
  mailAuthCode: number;
  lastCodeRequest: Date;
}
