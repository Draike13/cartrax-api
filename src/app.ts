// src/app.ts
import express from 'express';
import cors from 'cors';
import carsRouter from './routes/cars.routes';
import partsRouter from './routes/parts.routes';

const app = express();
// 🔓 Dev CORS — allow Angular at 4200
app.use(
  cors({
    origin: 'http://localhost:4200', // your Angular dev server
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // set true only if you use cookies/auth headers cross-site
  })
);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, service: 'cartrax-api' }));

// mount car router at /api/cars
app.use('/api/cars', carsRouter);

// mount parts router at /api/parts
app.use('/api/parts', partsRouter);

export default app;
