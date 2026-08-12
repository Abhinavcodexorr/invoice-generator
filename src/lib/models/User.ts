import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional for Google-only accounts
    passwordHash: { type: String, required: false, default: null },
    name: { type: String, default: "" },
    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    planStatus: {
      type: String,
      enum: ["active", "canceled", "past_due"],
      default: "active",
    },
    planPeriodEnd: { type: Date, default: null },
    emailsSentThisMonth: { type: Number, default: 0 },
    emailsMonthKey: { type: String, default: "" },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
