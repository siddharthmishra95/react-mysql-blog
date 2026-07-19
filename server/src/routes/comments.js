import { Router } from 'express';
import {
  listComments,
  createComment,
  deleteComment,
} from '../controllers/commentsController.js';
import { requireAuth } from '../middleware/auth.js';

// Nested under /api/posts/:postId/comments (needs mergeParams for :postId).
export const postCommentsRouter = Router({ mergeParams: true });
postCommentsRouter.get('/', listComments);
postCommentsRouter.post('/', requireAuth, createComment);

// Mounted at /api/comments for operations on a single comment by id.
export const commentsRouter = Router();
commentsRouter.delete('/:id', requireAuth, deleteComment);
