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

        // Broadcast new comment to the specific post room
        webSocketService.broadcast('new_comment', populatedComment, populatedComment.post.toString());

        return populatedComment;
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
        const updatedComment = await comment.save();

        // Broadcast updated comment to the specific post room
        webSocketService.broadcast('update_comment', updatedComment, updatedComment.post.toString());

        return updatedComment;
    }

    async delete(id: string, userId: string): Promise<void> {
        const comment = await Comment.findById(id);
        if (!comment) throw new Error('Comment not found');
        if (comment.author.toString() !== userId) throw new Error('Unauthorized');

        const postId = comment.post.toString();
        await this.deleteRecursive(id);

        // Broadcast deleted comment to the specific post room
        webSocketService.broadcast('delete_comment', { id }, postId);
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
        const updatedComment = await (await comment.populate('author', 'username avatarUrl')).populate('likes', 'username');

        // Broadcast updated (liked) comment to the specific post room
        webSocketService.broadcast('update_comment', updatedComment, updatedComment.post.toString());

        return updatedComment;
    }
}
