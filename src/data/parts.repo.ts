import { query } from './db';
import { Part, NewPart, UpdatePart } from '../models/part';

/**
 * Whitelist of valid part tables.
 * Add more table names here as you create them in the DB.
 */
const ALLOWED_PART_TABLES = new Set<string>([
  'battery',
  'brake_fluid_type',
  'brake_pad',
  'brake_light',
  'brake_rotor',
  'cabin_air_filter',
  'camshaft_position_sensor',
  'coil_pack',
  'coolant_type',
  'crankshaft_position_sensor',
  'crankshaft_sprocket',
  'engine_air_filter',
  'engine_oil_filter',
  'engine_oil_quantity',
  'engine_oil_viscosity',
  'head_gasket',
  'headlight',
  'license_plate_light',
  'maf_map_sensor',
  'serpentine_belt',
  'shocks_strut',
  'spark_plug',
  'taillight',
  'thermostat',
  'throttle_position_sensor',
  'timing_chain',
  'timing_sprocket',
  'timing_tensioner',
  'tire_type',
  'tire_size',
  'transmission_fluid_quantity',
  'transmission_fluid_type',
  'turn_signal_light',
  'valve_cover_gasket',
  'vvt_solenoid',
  'wiper_blade_size',
]);

function assertTable(table: string): string {
  const t = table.toLowerCase();
  if (!ALLOWED_PART_TABLES.has(t)) {
    throw new Error(`Unknown parts table: ${table}`);
  }
  return t;
}

const RETURNING = `id::text AS "id", data, created_at AS "createdAt", updated_at AS "updatedAt"`;

/** List all parts from a given table. */
export async function list(table: string): Promise<Part[]> {
  const t = assertTable(table);
  const sql = `SELECT ${RETURNING} FROM ${t} ORDER BY data ASC`;
  const { rows } = await query<Part>(sql);
  return rows;
}

/** Get one part by id from a given table. */
export async function getById(table: string, id: string): Promise<Part | null> {
  const t = assertTable(table);
  const sql = `SELECT ${RETURNING} FROM ${t} WHERE id = $1 LIMIT 1`;
  const { rows } = await query<Part>(sql, [id]);
  return rows[0] ?? null;
}

/** Create a new part row in the given table. */
export async function create(table: string, data: NewPart): Promise<Part> {
  const t = assertTable(table);
  const sql = `
    INSERT INTO ${t} (data, created_at, updated_at)
    VALUES ($1, NOW(), NOW())
    RETURNING ${RETURNING}
  `;
  const params = [data.data];
  const { rows } = await query<Part>(sql, params);
  return rows[0];
}

/**
 * Update a part row (only 'data' is updatable by design).
 * If no 'data' provided, returns the current row unchanged.
 */
export async function update(table: string, id: string, patch: UpdatePart): Promise<Part | null> {
  const t = assertTable(table);

  if (patch.data === undefined) {
    // nothing to update
    return await getById(t, id);
  }

  const sql = `
    UPDATE ${t}
    SET data = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING ${RETURNING}
  `;
  const { rows } = await query<Part>(sql, [patch.data, id]);
  return rows[0] ?? null;
}

/** Delete a part row by id. */
export async function remove(table: string, id: string): Promise<boolean> {
  const t = assertTable(table);
  const { rowCount } = await query(`DELETE FROM ${t} WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
