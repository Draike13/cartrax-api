// src/routes/cars.routes.ts
import { Router } from 'express';
import * as cars from '../controllers/cars.controller';

const r = Router();

//searches

// GET /api/cars/vin/1HGCM82633A123456
r.get('/vin/:vin', cars.getByVin);
// GET /api/cars/license/ABC123
r.get('/license/:plate', cars.getByLicensePlate);
// GET /api/cars/filter?year=2020&make=Toyota&model=Camry
r.get('/filter', cars.filterCars);

//basics

// GET /api/cars
r.get('/', cars.list);
// GET /api/cars/:id
r.get('/:id', cars.getById);
// POST /api/cars
r.post('/', cars.create);
// PATCH /api/cars/:id
r.patch('/:id', cars.update);
// DELETE /api/cars/:id
r.delete('/:id', cars.remove);

export default r;
