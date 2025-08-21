import { Request, Response } from 'express';
import * as cars from '../services/cars.service'; // we'll implement these next

// helper
function wantsPartsExpand(q: any) {
  return String(q?.expand || '').toLowerCase() === 'parts';
}
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

// GET /api/cars/:id?expand=parts
export async function getById(req: Request, res: Response) {
  try {
    const expand = wantsPartsExpand(req.query);
    const row = await cars.getByIdWithOption(req.params.id, expand);
    if (!row) return res.status(404).json({ error: 'Car not found' });
    res.json(row);
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
    console.log('POST /api/cars body ->', req.body); // <— log it
    const created = await cars.createWithBlankSpec(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    console.error('Create car error:', e); // <— log the error
    res.status(400).json({ error: e?.message ?? 'Invalid payload' });
  }
}

/**
 * PATCH /api/cars/:id
 * Partially updates any car fields AND/OR nested spec fields (req.body.spec).
 * Only touched fields are updated; nothing else is overwritten.
 */
export async function update(req: Request, res: Response) {
  try {
    const allowNull = req.query.clear === '1';
    const updated = await cars.updateCarAndSpec(req.params.id, req.body, { allowNull });
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

// GET /api/cars/vin/:vin?expand=parts
export async function getByVin(req: Request, res: Response) {
  try {
    const expand = wantsPartsExpand(req.query);
    const row = await cars.getByVinWithOption(req.params.vin, expand);
    if (!row) return res.status(404).json({ error: 'Car not found' });
    res.json(row);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}

// GET /api/cars/filter
export async function filterCars(req: Request, res: Response) {
  try {
    const carsList = await cars.filterCars(req.query.year as string, req.query.make as string, req.query.model as string);
    res.json(carsList);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}

// GET /api/cars/license/:plate?expand=parts
export async function getByLicensePlate(req: Request, res: Response) {
  try {
    const expand = wantsPartsExpand(req.query);
    const row = await cars.getByLicensePlateWithOption(req.params.plate, expand);
    if (!row) return res.status(404).json({ error: 'Car not found' });
    res.json(row);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}
