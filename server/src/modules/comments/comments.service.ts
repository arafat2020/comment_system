import { Comment, IComment } from './comment.model';
import { CreateCommentDto } from './comments.dto';

export class CommentsService {
    async create(userId: string, createCommentDto: CreateCommentDto): Promise<IComment> {
        const comment = new Comment({
            content: createCommentDto.content,
            post: createCommentDto.postId,
            author: userId,
            parentComment: createCommentDto.parentCommentId,
        });
        const savedComment = await comment.save();
        return savedComment.populate('author', 'username avatarUrl');
    }

    async findByPost(postId: string): Promise<IComment[]> {
        return Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username');
    }

    async update(id: string, userId: string, content: string): Promise<IComment> {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.author.toString() !== userId) throw new Error('Unauthorized');

        comment.content = content;
        return await comment.save();
    }

    async delete(id: string, userId: string): Promise<void> {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.author.toString() !== userId) throw new Error('Unauthorized');

        await this.deleteRecursive(id);
    }

    private async deleteRecursive(commentId: string): Promise<void> {
        const replies = await Comment.find({ parentComment: commentId });
        for (const reply of replies) {
            await this.deleteRecursive(reply._id.toString());
        }
        await Comment.findByIdAndDelete(commentId);
    }

    async toggleLike(commentId: string, userId: string): Promise<IComment> {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        const likeIndex = comment.likes.findIndex((id) => id.toString() === userId.toString());

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(userId as any);
        }

        await comment.save();
        return (await comment.populate('author', 'username avatarUrl')).populate('likes', 'username');
    }
}
