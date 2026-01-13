import { Router } from 'express';
import { PostsController } from './posts.controller';
import { authGuard } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { CreatePostDto } from './posts.dto';

import { upload } from '../../common/middleware/upload.middleware';

const router = Router();

router.post('/', authGuard, upload.single('image'), validationMiddleware(CreatePostDto), PostsController.create);
router.get('/', PostsController.findAll);
router.get('/user/:userId', PostsController.findByUser);
router.get('/:id', PostsController.findOne);
router.put('/:id', authGuard, upload.single('image'), PostsController.update);
router.delete('/:id', authGuard, PostsController.delete);
router.put('/:id/like', authGuard, PostsController.like);
router.put('/:id/dislike', authGuard, PostsController.dislike);

export default router;
