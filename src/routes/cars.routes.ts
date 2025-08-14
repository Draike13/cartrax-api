// src/routes/cars.routes.ts
import { Router } from 'express';
import * as cars from '../controllers/cars.controller';

const r = Router();

r.get('/', cars.list);
r.get('/:id', cars.getById);
r.post('/', cars.create);
r.patch('/:id', cars.update);
r.delete('/:id', cars.remove);

export default r;
