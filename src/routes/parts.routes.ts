import { Router } from 'express';
import * as parts from '../controllers/parts.controller';

const router = Router();

// /api/parts/:table
router.get('/:table', parts.list);
router.get('/:table/:id', parts.getById);
router.post('/:table', parts.create);
router.patch('/:table/:id', parts.update);
router.delete('/:table/:id', parts.remove);

export default router;
