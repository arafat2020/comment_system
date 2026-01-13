import { Comment, IComment } from './comment.model';
import { CreateCommentDto } from './comments.dto';
import { webSocketService } from '../../services/websocket.service';

export class CommentsService {
    async create(userId: string, createCommentDto: CreateCommentDto): Promise<IComment> {
        const comment = new Comment({
            content: createCommentDto.content,
            post: createCommentDto.postId,
            author: userId,
            parentComment: createCommentDto.parentCommentId,
        });
        const savedComment = await comment.save();
        const populatedComment = await savedComment.populate('author', 'username avatarUrl');

        // Broadcast new comment to the specific post room (standardized with 'post_' prefix)
        const postId = populatedComment.post.toString();
        webSocketService.broadcast('new_comment', populatedComment, `post_${postId}`);

        return populatedComment;
    }

    async findByPost(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: IComment[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            Comment.find({ post: postId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl')
                .populate('likes', 'username')
                .populate('dislikes', 'username'),
            Comment.countDocuments({ post: postId })
        ]);

        return {
            comments,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    async update(id: string, userId: string, content: string): Promise<IComment> {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.author.toString() !== userId) throw new Error('Unauthorized');

        comment.content = content;
        const savedComment = await comment.save();

        const populatedComment = await Comment.findById(savedComment._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username');

        if (!populatedComment) return savedComment;

        // Broadcast updated comment to the specific post room
        const postId = populatedComment.post.toString();
        webSocketService.broadcast('update_comment', populatedComment, `post_${postId}`);

        return populatedComment;
    }

    async delete(id: string, userId: string): Promise<void> {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.author.toString() !== userId) throw new Error('Unauthorized');

        const postId = comment.post.toString();
        await this.deleteRecursive(id);

        // Broadcast deleted comment to the specific post room
        webSocketService.broadcast('delete_comment', { id }, `post_${postId}`);
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
        const dislikeIndex = comment.dislikes.findIndex((id) => id.toString() === userId.toString());

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(userId as any);
            // Mutually exclusive: remove from dislikes
            if (dislikeIndex > -1) {
                comment.dislikes.splice(dislikeIndex, 1);
            }
        }

        const savedComment = await comment.save();
        const updatedComment = await Comment.findById(savedComment._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username');

        if (updatedComment) {
            webSocketService.broadcast('update_comment', updatedComment, `post_${updatedComment.post.toString()}`);
            return updatedComment;
        }
        return savedComment;
    }

    async toggleDislike(commentId: string, userId: string): Promise<IComment> {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        const dislikeIndex = comment.dislikes.findIndex((id) => id.toString() === userId.toString());
        const likeIndex = comment.likes.findIndex((id) => id.toString() === userId.toString());

        if (dislikeIndex > -1) {
            comment.dislikes.splice(dislikeIndex, 1);
        } else {
            comment.dislikes.push(userId as any);
            // Mutually exclusive: remove from likes
            if (likeIndex > -1) {
                comment.likes.splice(likeIndex, 1);
            }
        }

        const savedComment = await comment.save();
        const updatedComment = await Comment.findById(savedComment._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username');

        if (updatedComment) {
            webSocketService.broadcast('update_comment', updatedComment, `post_${updatedComment.post.toString()}`);
            return updatedComment;
        }
        return savedComment;
    }
}
