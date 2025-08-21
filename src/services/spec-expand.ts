import { CarSpec } from '../models/spec';
import * as partsRepo from '../data/parts.repo';
import { FIELD_TO_TABLE } from './parts-map';

/**
 * Input: CarSpec with *_id fields (numbers) + license_plate_number.
 * Output: object with keys like brake_pad: { id, data } | null, plus license_plate_number.
 */
export async function expandSpec(spec: CarSpec | null) {
  if (!spec) return null;

  const out: Record<string, any> = {
    license_plate_number: spec.license_plate_number ?? null,
  };

  // For each *_id present: fetch the part row and expose {id, data} at the key without "_id"
  await Promise.all(
    Object.entries(FIELD_TO_TABLE).map(async ([field, table]) => {
      const id = (spec as any)[field] as number | null | undefined;
      const key = field.replace(/_id$/, ''); // e.g., brake_pad_id -> brake_pad
      if (id == null) {
        out[key] = null;
        return;
      }
      // parts.repo.getById(table, id) expects string id; cast is fine for INT pk
      const row = await partsRepo.getById(table, String(id));
      out[key] = row ? { id: row.id, data: row.data } : null;
    })
  );

  return out;
}
