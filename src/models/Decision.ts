import mongoose, { Document, Schema, Types } from "mongoose";

export interface DecisionFactor {
  id: string;
  factorName: string;
  factorWeight: number;
}

export interface DecisionOptions {
  id: string;
  decisionName: string;
  ratings: Record<string, number>;
  score: number;
  base10Score: number;
}

export interface Decision {
  id: string;
  userId: Types.ObjectId | string;
  title: string;
  description?: string;
  factors: DecisionFactor[];
  options: DecisionOptions[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDecision extends Omit<Decision, "id">, Document {}

const DecisionFactorSchema = new Schema<DecisionFactor>(
  {
    id: { type: String, required: true },
    factorName: { type: String, required: true },
    factorWeight: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const DecisionOptionSchema = new Schema<DecisionOptions>(
  {
    id: { type: String, required: true },
    decisionName: { type: String, required: true },
    ratings: { type: Map, of: Number, default: {} },
    score: { type: Number, required: true, default: 0 },
    base10Score: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const DecisionSchema = new Schema<IDecision>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    factors: { type: [DecisionFactorSchema], default: [] },
    options: { type: [DecisionOptionSchema], default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string })?.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

export default mongoose.models.Decision ||
  mongoose.model<IDecision>("Decision", DecisionSchema);
