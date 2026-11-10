import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  preferredCategories: { type: [String], default: [] },
}, { timestamps: true });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
