import { query } from './db';
import { Car } from '../models/car';

/** Return all cars (no join here; service will hydrate spec). */
export async function list(): Promise<Car[]> {
  const sql = `
    SELECT id, year, make, model, color,
           vin, mileage, trim, notes, spec_id AS "specId",
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM cars
    ORDER BY created_at DESC
  `;
  const { rows } = await query<Car>(sql);
  return rows;
}

export async function getById(id: string): Promise<Car | null> {
  const sql = `
    SELECT id, year, make, model, color,
           vin, mileage, trim, notes, spec_id AS "specId",
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM cars
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await query<Car>(sql, [id]);
  return rows[0] ?? null;
}

/** Create a car row. specId may be null or a string (if you pre-created a spec). */
export async function create(data: {
  year: string;
  make: string;
  model: string;
  color: string;
  vin?: string | null;
  mileage?: string | null;
  trim?: string | null;
  notes?: string | null;
  specId?: string | null;
}): Promise<Car> {
  const sql = `
    INSERT INTO cars (
      year, make, model, color,
      vin, mileage, trim, notes,
      spec_id, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, NOW(), NOW()
    )
    RETURNING
      id, year, make, model, color,
      vin, mileage, trim, notes, spec_id AS "specId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  const params = [data.year, data.make, data.model, data.color, data.vin ?? null, data.mileage ?? null, data.trim ?? null, data.notes ?? null, data.specId ?? null];
  const { rows } = await query<Car>(sql, params);
  return rows[0];
}

/**
 * Partial update: only sets columns you pass.
 * Always bumps updated_at.
 */
export async function update(id: string, patch: Partial<Car>): Promise<Car | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  const set = (col: string, val: any) => {
    fields.push(`${col} = $${i++}`);
    values.push(val);
  };

  if (patch.year !== undefined) set('year', patch.year);
  if (patch.make !== undefined) set('make', patch.make);
  if (patch.model !== undefined) set('model', patch.model);
  if (patch.color !== undefined) set('color', patch.color);
  if (patch.vin !== undefined) set('vin', patch.vin);
  if (patch.mileage !== undefined) set('mileage', patch.mileage);
  if (patch.trim !== undefined) set('trim', patch.trim);
  if (patch.notes !== undefined) set('notes', patch.notes);
  if (patch.specId !== undefined) set('spec_id', patch.specId);

  // always set updated_at
  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) {
    // nothing to update except updated_at — no-op; return current row
    return await getById(id);
  }

  const sql = `
    UPDATE cars
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING
      id, year, make, model, color,
      vin, mileage, trim, notes, spec_id AS "specId",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  values.push(id);

  const { rows } = await query<Car>(sql, values);
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM cars WHERE id = $1`, [id]);
  return rowCount! > 0;
}
