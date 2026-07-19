import { Router } from 'express';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postsController.js';
import { requireAuth } from '../middleware/auth.js';
import { postCommentsRouter } from './comments.js';

const router = Router();

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

// Comments live under a specific post.
router.use('/:postId/comments', postCommentsRouter);

export default router;
