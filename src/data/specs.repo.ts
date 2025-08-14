import { query } from './db';
import { CarSpec, NewCarSpec } from '../models/spec';

const RETURNING = `
  id,
  engine_oil_viscosity,
  engine_oil_quantity,
  engine_oil_filter,
  brake_fluid_type,
  brake_pad,
  brake_rotor,
  tire_size,
  tire_type,
  transmission_fluid_type,
  transmission_fluid_quantity,
  coolant_type,
  engine_air_filter,
  cabin_air_filter,
  wiper_blade_size,
  headlight,
  taillight,
  brake_light,
  turn_signal_light,
  license_plate_light,
  battery,
  serpentine_belt,
  thermostat,
  license_plate_number,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const UPDATABLE_COLUMNS: (keyof CarSpec)[] = [
  'engine_oil_viscosity',
  'engine_oil_quantity',
  'engine_oil_filter',
  'brake_fluid_type',
  'brake_pad',
  'brake_rotor',
  'tire_size',
  'tire_type',
  'transmission_fluid_type',
  'transmission_fluid_quantity',
  'coolant_type',
  'engine_air_filter',
  'cabin_air_filter',
  'wiper_blade_size',
  'headlight',
  'taillight',
  'brake_light',
  'turn_signal_light',
  'license_plate_light',
  'battery',
  'serpentine_belt',
  'thermostat',
  'license_plate_number',
];

export async function getById(id: string): Promise<CarSpec | null> {
  const sql = `
    SELECT
      ${RETURNING}
    FROM car_specs
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await query<CarSpec>(sql, [id]);
  return rows[0] ?? null;
}

//Create a spec row.
export async function create(data: NewCarSpec | {}): Promise<CarSpec> {
  const keys = Object.keys(data ?? {});
  if (keys.length === 0) {
    // Simplest path for "blank" spec row
    const sql = `
      INSERT INTO car_specs DEFAULT VALUES
      RETURNING ${RETURNING}
    `;
    const { rows } = await query<CarSpec>(sql);
    return rows[0];
  }

  // Insert only provided columns
  const cols: string[] = [];
  const placeholders: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const k of keys) {
    cols.push(k);
    placeholders.push(`$${i++}`);
    values.push((data as any)[k]);
  }

  const sql = `
    INSERT INTO car_specs (${cols.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING ${RETURNING}
  `;
  const { rows } = await query<CarSpec>(sql, values);
  return rows[0];
}

/** Partial update — only sets columns you pass; always bumps updated_at. */
export async function update(id: string, patch: Partial<CarSpec>): Promise<CarSpec | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const col of UPDATABLE_COLUMNS) {
    if (col in patch) {
      fields.push(`${col} = $${i++}`);
      values.push((patch as any)[col]);
    }
  }

  // nothing to change
  if (fields.length === 0) return await getById(id);

  // bump updated_at
  fields.push(`updated_at = NOW()`);

  const sql = `
    UPDATE car_specs
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING ${RETURNING}
  `;
  values.push(id);

  const { rows } = await query<CarSpec>(sql, values);
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM car_specs WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
