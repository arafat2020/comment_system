import { Post, IPost } from './post.model';
import { CreatePostDto } from './posts.dto';
import { webSocketService } from '../../services/websocket.service';

export class PostsService {
    async create(userId: string, createPostDto: CreatePostDto): Promise<IPost> {
        const post = new Post({
            content: createPostDto.content,
            imageUrl: createPostDto.imageUrl,
            author: userId,
        });
        const savedPost = await post.save();
        const populatedPost = await savedPost.populate('author', 'username avatarUrl');

        // Broadcast new post to the feed room
        webSocketService.broadcast('new_post', populatedPost, 'feed');
        return populatedPost;
    }

    async findAll(): Promise<IPost[]> {
        return Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username');
    }

    async findOne(id: string): Promise<IPost> {
        const post = await Post.findById(id).populate('author', 'username avatarUrl').populate('likes', 'username');
        if (!post) throw new Error('Post not found');
        return post;
    }

    async update(id: string, userId: string, updateData: Partial<CreatePostDto>): Promise<IPost> {
        const post = await Post.findById(id);
        if (!post) throw new Error('Post not found');
        if (post.author.toString() !== userId) throw new Error('Unauthorized');

        if (updateData.content) post.content = updateData.content;
        if (updateData.imageUrl) post.imageUrl = updateData.imageUrl;

        const updatedPost = await post.save();

        // Broadcast updated post to the feed room
        webSocketService.broadcast('update_post', updatedPost, 'feed');

        return updatedPost;
    }

    async delete(id: string, userId: string): Promise<void> {
        const post = await Post.findById(id);
        if (!post) throw new Error('Post not found');
        if (post.author.toString() !== userId) throw new Error('Unauthorized');

        await Post.findByIdAndDelete(id);

        // Broadcast deleted post to the feed room
        webSocketService.broadcast('delete_post', { id }, 'feed');
    }

    async toggleLike(postId: string, userId: string): Promise<IPost> {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const likeIndex = post.likes.findIndex((id) => id.toString() === userId.toString());

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId as any);
        }

        await post.save();
        // Re-populate to return updated state
        const updatedPost = await (await post.populate('author', 'username avatarUrl')).populate('likes', 'username');

        // Broadcast updated post (for likes) to the feed room
        webSocketService.broadcast('update_post', updatedPost, 'feed');

        return updatedPost;
    }
}
