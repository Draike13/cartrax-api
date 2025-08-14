import { Request, Response } from 'express';
import * as partsRepo from '../data/parts.repo';
import { NewPart, UpdatePart } from '../models/part';

// GET /api/parts/:table
export async function list(req: Request, res: Response) {
  try {
    const { table } = req.params;
    const rows = await partsRepo.list(table);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// GET /api/parts/:table/:id
export async function getById(req: Request, res: Response) {
  try {
    const { table, id } = req.params;
    const row = await partsRepo.getById(table, id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// POST /api/parts/:table
export async function create(req: Request, res: Response) {
  try {
    if (req.body === null || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const { table } = req.params;
    const payload = req.body as NewPart; // { data: string }
    const created = await partsRepo.create(table, payload);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// PATCH /api/parts/:table/:id
export async function update(req: Request, res: Response) {
  try {
    if (req.body === null || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const { table, id } = req.params;
    const patch = req.body as UpdatePart; // { data?: string }
    const updated = await partsRepo.update(table, id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// DELETE /api/parts/:table/:id
export async function remove(req: Request, res: Response) {
  try {
    const { table, id } = req.params;
    const ok = await partsRepo.remove(table, id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}
