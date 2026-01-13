import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    content: string;
    imageUrl?: string;
    author: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    dislikes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        content: { type: String, required: true, maxlength: 280 },
        imageUrl: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

export const Post = mongoose.model<IPost>('Post', PostSchema);
