import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { RegisterDto, LoginDto } from './auth.dto';
import { upload } from '../../common/middleware/upload.middleware';
import { authGuard } from '../../common/middleware/auth.middleware';

const router = Router();

router.post('/register', upload.single('avatar'), AuthController.register);
router.post('/login', validationMiddleware(LoginDto), AuthController.login);
router.get('/me', authGuard, AuthController.getMe);

export default router;
