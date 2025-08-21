import { query } from './db';
import { CarSpec, NewCarSpec } from '../models/spec';

const RETURNING = `
  id,
  engine_oil_viscosity_id,
  engine_oil_quantity_id,
  engine_oil_filter_id,
  brake_fluid_type_id,
  brake_pad_id,
  brake_rotor_id,
  tire_size_id,
  tire_type_id,
  transmission_fluid_type_id,
  transmission_fluid_quantity_id,
  coolant_type_id,
  engine_air_filter_id,
  cabin_air_filter_id,
  wiper_blade_size_driver_id,
  wiper_blade_size_passenger_id,
  headlight_id,
  taillight_id,
  brake_light_id,
  turn_signal_light_id,
  license_plate_light_id,
  battery_id,
  serpentine_belt_id,
  thermostat_id,
  license_plate_number,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const UPDATABLE_COLUMNS: (keyof CarSpec)[] = [
  'engine_oil_viscosity_id',
  'engine_oil_quantity_id',
  'engine_oil_filter_id',
  'brake_fluid_type_id',
  'brake_pad_id',
  'brake_rotor_id',
  'tire_size_id',
  'tire_type_id',
  'transmission_fluid_type_id',
  'transmission_fluid_quantity_id',
  'coolant_type_id',
  'engine_air_filter_id',
  'cabin_air_filter_id',
  'wiper_blade_size_driver_id',
  'wiper_blade_size_passenger_id',
  'headlight_id',
  'taillight_id',
  'brake_light_id',
  'turn_signal_light_id',
  'license_plate_light_id',
  'battery_id',
  'serpentine_belt_id',
  'thermostat_id',
  'license_plate_number',
];

export async function getById(id: number): Promise<CarSpec | null> {
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

/** Partial update — only sets columns you pass; skips null-ish; always bumps updated_at. */
export async function update(id: number, patch: Partial<CarSpec>, opts?: { allowNull?: boolean }): Promise<CarSpec | null> {
  const allowNull = !!opts?.allowNull;

  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const col of UPDATABLE_COLUMNS) {
    if (!(col in patch)) continue; // not provided -> no change

    const v = (patch as any)[col];

    // Always skip undefined
    if (v === undefined) continue;

    // Skip empty-string and string 'null' unless we explicitly allow clearing
    if ((v === '' || v === 'null') && !allowNull) continue;

    // Handle real nulls: set to NULL only when allowNull=true; otherwise skip
    if (v === null && !allowNull) continue;

    // Optional: still support explicit clear token
    if (v === '__clear__') {
      fields.push(`${col} = NULL`);
      continue;
    }

    // Normal set (v may be null when allowNull=true)
    fields.push(`${col} = $${i++}`);
    values.push(v);
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

export async function remove(id: number): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM car_specs WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
