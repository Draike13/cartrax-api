// functions/src/index.ts
import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { Pool } from 'pg';

// 1) Declare the secret name you'll set via CLI (do NOT hardcode the URL)
const PG_URL = defineSecret('PG_URL');

// 2) Create one shared connection pool using the secret at runtime
//    Your Neon connection string should include ?sslmode=require
//    Example: postgres://user:pass@host.neon.tech/dbname?sslmode=require
const pool = new Pool({
  connectionString: process.env.PG_URL,
});

// 3) Standard Express app
const app = express();
app.use(cors({ origin: true })); // safe when you call via Hosting rewrite (same origin)
app.use(express.json());

// 4) Simple health check (quick way to test the function is alive)
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// 5) Quick DB check (verifies Postgres connectivity end-to-end)
app.get('/db-time', async (_req, res) => {
  try {
    const r = await pool.query('select now()');
    res.json({ now: r.rows[0].now });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed', details: err?.message });
  }
});

// 6) Example route you can replace later with your real ones
app.get('/cars', async (req, res) => {
  try {
    const includeSpec = String(req.query.includeSpec ?? 'false') === 'true';

    const carsSql = `
      SELECT
        id,
        year,
        make,
        model,
        color,
        vin,
        mileage,
        trim,
        notes,
        spec_id AS "specId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM public.cars
      ORDER BY created_at DESC
    `;
    const { rows: cars } = await pool.query(carsSql);

    if (!includeSpec) {
      res.json(cars); // <-- no `return res.json(...)`
      return;
    }

    const specIds = cars.map((c) => c.specId).filter(Boolean) as number[];
    if (specIds.length === 0) {
      res.json(cars.map((c) => ({ ...c, spec: null })));
      return;
    }

    const specsSql = `
      SELECT
        id,
        engine_oil_viscosity_id        AS "engineOilViscosityId",
        engine_oil_quantity_id         AS "engineOilQuantityId",
        engine_oil_filter_id           AS "engineOilFilterId",
        brake_fluid_type_id            AS "brakeFluidTypeId",
        brake_pad_id                   AS "brakePadId",
        brake_rotor_id                 AS "brakeRotorId",
        tire_size_id                   AS "tireSizeId",
        tire_type_id                   AS "tireTypeId",
        transmission_fluid_type_id     AS "transmissionFluidTypeId",
        transmission_fluid_quantity_id AS "transmissionFluidQuantityId",
        coolant_type_id                AS "coolantTypeId",
        engine_air_filter_id           AS "engineAirFilterId",
        cabin_air_filter_id            AS "cabinAirFilterId",
        wiper_blade_size_driver_id     AS "wiperBladeSizeDriverId",
        wiper_blade_size_passenger_id  AS "wiperBladeSizePassengerId",
        headlight_id                   AS "headlightId",
        taillight_id                   AS "taillightId",
        brake_light_id                 AS "brakeLightId",
        turn_signal_light_id           AS "turnSignalLightId",
        license_plate_light_id         AS "licensePlateLightId",
        battery_id                     AS "batteryId",
        serpentine_belt_id             AS "serpentineBeltId",
        thermostat_id                  AS "thermostatId",
        license_plate_number           AS "licensePlateNumber",
        created_at                     AS "createdAt",
        updated_at                     AS "updatedAt"
      FROM public.car_spec
      WHERE id = ANY($1::bigint[])
    `;
    const { rows: specs } = await pool.query(specsSql, [specIds]);

    const specById = new Map(specs.map((s) => [s.id, s]));
    const withSpecs = cars.map((c) => ({
      ...c,
      spec: c.specId ? specById.get(c.specId) ?? null : null,
    }));

    res.json(withSpecs);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Query failed', details: err?.message });
  }
});

// 7) Export a single HTTPS function that serves all Express routes
export const api = onRequest(
  {
    region: 'us-central1',
    secrets: [PG_URL], // <-- this makes PG_URL available as process.env.PG_URL
  },
  app
);
