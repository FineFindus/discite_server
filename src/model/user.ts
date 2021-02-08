import mongoose from 'mongoose';
import IUser from '../interfaces/user';

//Generate a random 6 digit code, which will be sent to the userMail, to make sure the
//user owns the mail address.
const emailAuthCode = Math.floor(100000 + Math.random() * 900000);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      //mail should be from igs-buchholz.de
      match: /^[a-zA-Z]+\.+[a-zA-Z]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?igs-buchholz\.de$/,
    },
    pushMessageToken: { type: String, sparse: true },
    mailAuthCode: { type: Number, default: emailAuthCode },
    lastCodeRequest: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

// userSchema.static('getFullJson', function () {
// return {id: }
// });

//override toJSON method, to remove sensitive information and not useful
// userSchema.methods.toJSON = function () {
//   var jsonObj = { _id: this._id, email: this.email };
//   return jsonObj;
// };

export default mongoose.model<IUser>('User', userSchema);
