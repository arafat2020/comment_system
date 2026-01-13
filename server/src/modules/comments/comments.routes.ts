import { Router } from 'express';
import { CommentsController } from './comments.controller';
import { authGuard } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreateCommentDto } from './comments.dto';

const router = Router();

router.post('/', authGuard, validationMiddleware(CreateCommentDto), CommentsController.create);
router.get('/:postId', CommentsController.findByPost);
router.put('/:id', authGuard, CommentsController.update);
router.delete('/:id', authGuard, CommentsController.delete);
router.put('/:id/like', authGuard, CommentsController.like);

export default router;
