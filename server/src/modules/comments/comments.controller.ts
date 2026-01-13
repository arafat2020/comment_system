import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './comments.dto';

const commentsService = new CommentsService();

export class CommentsController {
    static async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const comment = await commentsService.create(userId, req.body as CreateCommentDto);
            res.status(201).json(comment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async findByPost(req: Request, res: Response) {
        try {
            const { postId } = req.params as { postId: string };
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await commentsService.findByPost(postId, page, limit);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const { content } = req.body;
            const comment = await commentsService.update(id, userId, content);
            res.status(200).json(comment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            await commentsService.delete(id, userId);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async like(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const comment = await commentsService.toggleLike(id, userId);
            res.status(200).json(comment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async dislike(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const comment = await commentsService.toggleDislike(id, userId);
            res.status(200).json(comment);
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }
}
