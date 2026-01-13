import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, triem: true, lowercase: true },
        passwordHash: { type: String, required: true },
        avatarUrl: { type: String },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
