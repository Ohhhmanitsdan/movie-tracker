import { Schema, model, models, type Model } from "mongoose";

export type UserDocument = {
  _id: string;
  username: string;
  email?: string;
  passwordHash: string;
  createdAt: Date;
};

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const User: Model<UserDocument> = models.User || model<UserDocument>("User", UserSchema);
