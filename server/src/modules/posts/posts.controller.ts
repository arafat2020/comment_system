import { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './posts.dto';

const postsService = new PostsService();

export class PostsController {
    static async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            const post = await postsService.create(userId, { ...req.body, imageUrl } as CreatePostDto);
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async findAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await postsService.findAll(page, limit);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    static async findByUser(req: Request, res: Response) {
        try {
            const { userId } = req.params as { userId: string };
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await postsService.findByUser(userId, page, limit);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    static async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const post = await postsService.findOne(id);
            res.status(200).json(post);
        } catch (error) {
            res.status(404).json({ message: (error as Error).message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            const updateData = imageUrl ? { ...req.body, imageUrl } : req.body;
            const post = await postsService.update(id, userId, updateData);
            res.status(200).json(post);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            await postsService.delete(id, userId);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async like(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const post = await postsService.toggleLike(id, userId);
            res.status(200).json(post);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async dislike(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const post = await postsService.toggleDislike(id, userId);
            res.status(200).json(post);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
