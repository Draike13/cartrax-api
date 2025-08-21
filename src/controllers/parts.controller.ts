import { Request, Response } from 'express';
import * as partsRepo from '../data/parts.repo';
import { NewPart, UpdatePart } from '../models/part';
import { resolvePartsTable } from '../services/parts-resolver';

// GET /api/parts/:table
export async function list(req: Request, res: Response) {
  try {
    const resolved = resolvePartsTable(req.params.table);
    if (!resolved) return res.status(400).json({ error: `Unknown parts type: ${req.params.table}` });
    const rows = await partsRepo.list(resolved);
    const label = req.params.table; // ✅ add friendly type to each row
    res.json(rows.map((r) => ({ ...r, type: label })));
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// GET /api/parts/:table/:id
export async function getById(req: Request, res: Response) {
  try {
    const resolved = resolvePartsTable(req.params.table);
    if (!resolved) return res.status(400).json({ error: `Unknown parts type: ${req.params.table}` });
    const row = await partsRepo.getById(resolved, req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const label = req.params.table; // ✅ add friendly type
    res.json({ ...row, type: label });
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
    const resolved = resolvePartsTable(req.params.table);
    if (!resolved) return res.status(400).json({ error: `Unknown parts type: ${req.params.table}` });
    const payload = req.body as NewPart; // { data: string }
    const created = await partsRepo.create(resolved, payload);
    const label = req.params.table; // ✅ add friendly type
    res.status(201).json({ ...created, type: label });
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
    const resolved = resolvePartsTable(req.params.table);
    if (!resolved) return res.status(400).json({ error: `Unknown parts type: ${req.params.table}` });
    const patch = req.body as UpdatePart; // { data?: string }
    const updated = await partsRepo.update(resolved, req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    const label = req.params.table; // ✅ add friendly type
    res.json({ ...updated, type: label });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}

// DELETE /api/parts/:table/:id
export async function remove(req: Request, res: Response) {
  try {
    const resolved = resolvePartsTable(req.params.table);
    if (!resolved) return res.status(400).json({ error: `Unknown parts type: ${req.params.table}` });
    const ok = await partsRepo.remove(resolved, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Bad request' });
  }
}
