// src/app.ts
import express from 'express';
import cors from 'cors';
import carsRouter from './routes/cars.routes';
import partsRouter from './routes/parts.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, service: 'cartrax-api' }));

// mount car router at /api/cars
app.use('/api/cars', carsRouter);

// mount parts router at /api/parts
app.use('/api/parts', partsRouter);

export default app;
