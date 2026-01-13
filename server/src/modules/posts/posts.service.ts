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

    async findAll(page: number = 1, limit: number = 10): Promise<{ posts: IPost[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl')
                .populate('likes', 'username')
                .populate('dislikes', 'username'),
            Post.countDocuments()
        ]);

        return {
            posts,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<{ posts: IPost[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post.find({ author: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatarUrl')
                .populate('likes', 'username')
                .populate('dislikes', 'username'),
            Post.countDocuments({ author: userId })
        ]);

        return {
            posts,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string): Promise<IPost> {
        const post = await Post.findById(id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username');
        if (!post) throw new Error('Post not found');
        return post;
    }

    async update(id: string, userId: string, updateData: Partial<CreatePostDto>): Promise<IPost> {
        const post = await Post.findById(id);
        if (!post) throw new Error('Post not found');
        if (post.author.toString() !== userId) throw new Error('Unauthorized');

        if (updateData.content) post.content = updateData.content;
        if (updateData.imageUrl) post.imageUrl = updateData.imageUrl;

        const savedPost = await post.save();

        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username');

        if (!populatedPost) return savedPost;

        // Broadcast updated post to the feed room
        webSocketService.broadcast('update_post', populatedPost, 'feed');

        return populatedPost;
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
        if (!post) throw new Error('Post not found');

        const likeIndex = post.likes.findIndex((id) => id.toString() === userId.toString());
        const dislikeIndex = post.dislikes.findIndex((id) => id.toString() === userId.toString());

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId as any);
            if (dislikeIndex > -1) {
                post.dislikes.splice(dislikeIndex, 1);
            }
        }

        const savedPost = await post.save();
        return (await Post.findById(savedPost._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username')) as IPost;
    }

    async toggleDislike(postId: string, userId: string): Promise<IPost> {
        const post = await Post.findById(postId);
        if (!post) throw new Error('Post not found');

        const dislikeIndex = post.dislikes.findIndex((id) => id.toString() === userId.toString());
        const likeIndex = post.likes.findIndex((id) => id.toString() === userId.toString());

        if (dislikeIndex > -1) {
            post.dislikes.splice(dislikeIndex, 1);
        } else {
            post.dislikes.push(userId as any);
            if (likeIndex > -1) {
                post.likes.splice(likeIndex, 1);
            }
        }

        const savedPost = await post.save();
        return (await Post.findById(savedPost._id)
            .populate('author', 'username avatarUrl')
            .populate('likes', 'username')
            .populate('dislikes', 'username')) as IPost;
    }
}
