import { Request, Response } from 'express';
import * as cars from '../services/cars.service'; // we'll implement these next

/**
 * GET /api/cars
 * Always returns the full car objects WITH their spec embedded.
 */
export async function list(_req: Request, res: Response) {
  try {
    const rows = await cars.list({ includeSpec: true });
    res.json(rows); // Array<CarWithSpec>
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}

/**
 * GET /api/cars/:id
 * Always returns the car WITH its spec embedded.
 */
export async function getById(req: Request, res: Response) {
  try {
    const row = await cars.getById(req.params.id, { includeSpec: true });
    if (!row) return res.status(404).json({ error: 'Car not found' });
    res.json(row); // CarWithSpec
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}

/**
 * POST /api/cars
 * Creates a new car and also creates a blank spec linked to it.
 * All optional fields default to null; spec fields start as nulls.
 */
export async function create(req: Request, res: Response) {
  try {
    const created = await cars.createWithBlankSpec(req.body);
    res.status(201).json(created); // CarWithSpec
  } catch (e: any) {
    // 400 for validation problems; 500 reserved for unexpected errors in service
    const status = e?.name === 'ValidationError' ? 400 : 400;
    res.status(status).json({ error: e?.message ?? 'Invalid payload' });
  }
}

/**
 * PATCH /api/cars/:id
 * Partially updates any car fields AND/OR nested spec fields (req.body.spec).
 * Only touched fields are updated; nothing else is overwritten.
 */
export async function update(req: Request, res: Response) {
  try {
    const updated = await cars.updateCarAndSpec(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Car not found' });
    res.json(updated); // CarWithSpec (post-update)
  } catch (e: any) {
    const status = e?.name === 'ValidationError' ? 400 : 400;
    res.status(status).json({ error: e?.message ?? 'Invalid payload' });
  }
}

/**
 * DELETE /api/cars/:id
 * Deletes the car and cascades to delete its linked spec.
 * (Does NOT delete parts tables — only the spec join row.)
 */
export async function remove(req: Request, res: Response) {
  try {
    const ok = await cars.deleteCarAndSpec(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Car not found' });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}
