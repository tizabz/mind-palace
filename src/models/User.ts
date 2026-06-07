import mongoose, { Document, Schema } from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Omit<User, "_id">, Document {}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string })?.toString();
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
