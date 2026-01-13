import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

const authService = new AuthService();

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            const { user, token } = await authService.register({ ...req.body, avatarUrl } as RegisterDto);
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { user, token } = await authService.login(req.body as LoginDto);
            res.status(200).json({ user, token });
        } catch (error) {
            res.status(401).json({ message: (error as Error).message });
        }
    }

    static async getMe(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const user = await authService.findById(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ message: (error as Error).message });
        }
    }
}
