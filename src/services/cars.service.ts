// src/services/cars.service.ts
import { Car, CarWithSpec, NewCar, UpdateCar } from '../models/car';
import { CarSpec } from '../models/spec';
import * as carsRepo from '../data/cars.repo';
import * as specsRepo from '../data/specs.repo';
import { expandSpec } from './spec-expand';

function ensureObject(v: unknown) {
  if (v === null || typeof v !== 'object') {
    throw new Error('Invalid body');
  }
}

/* LIST: optionally include spec */
export async function list(opts: { includeSpec?: boolean } = {}): Promise<Car[] | CarWithSpec[]> {
  const cars = await carsRepo.list();
  if (!opts.includeSpec) return cars;

  const withSpecs = await Promise.all(
    cars.map(async (c) => {
      const spec = c.specId ? await specsRepo.getById(c.specId) : null;
      return { ...c, spec } as CarWithSpec;
    })
  );
  return withSpecs;
}

/* GET BY ID: optionally include spec */
export async function getById(id: string, opts: { includeSpec?: boolean } = {}): Promise<Car | CarWithSpec | null> {
  const car = await carsRepo.getById(id);
  if (!car) return null;
  if (!opts.includeSpec) return car;

  const spec = car.specId ? await specsRepo.getById(car.specId) : null;
  return { ...car, spec } as CarWithSpec;
}

/* CREATE: make blank spec, then car pointing to it */
export async function createWithBlankSpec(body: unknown): Promise<CarWithSpec> {
  ensureObject(body);
  const b = body as Partial<NewCar>;

  // 1) create a blank spec (DB will default nulls)
  const spec = await specsRepo.create({}); // CarSpec with nulls

  // 2) create the car pointing to that spec
  const car = await carsRepo.create({
    year: b.year as any, // keep minimal; DB will enforce types
    make: b.make as any,
    model: b.model as any,
    color: b.color as any,
    vin: b.vin ?? null,
    mileage: b.mileage ?? null,
    trim: b.trim ?? null,
    notes: b.notes ?? null,
    specId: spec.id,
  });

  // 3) return hydrated
  return { ...car, spec };
}

/* UPDATE: patch car fields and/or nested spec fields */
export async function updateCarAndSpec(id: string, body: unknown, opts?: { allowNull?: boolean }): Promise<CarWithSpec | null> {
  ensureObject(body);
  const patch = body as UpdateCar;

  // ensure car exists
  const existing = await carsRepo.getById(id);
  if (!existing) return null;

  // handle spec patch if provided
  if (patch.spec) {
    let specId = existing.specId;

    // create a blank spec if missing, then link it
    if (!specId) {
      const created = await specsRepo.create({});
      specId = created.id;
      await carsRepo.update(id, { specId });
    }

    // Only call update if specId is defined (should always be after above)
    if (specId !== undefined && specId !== null) {
      await specsRepo.update(specId, patch.spec as Partial<CarSpec>, { allowNull: !!opts?.allowNull });
      const cleanSpec = sanitizeSpecPatch(patch.spec);
      if (Object.keys(cleanSpec).length) {
        await specsRepo.update(specId, cleanSpec as Partial<CarSpec>);
      }
    }
  }

  // apply car field patch (ignore spec)
  const { spec: _ignore, ...carPatch } = patch as any;
  if (Object.keys(carPatch).length) {
    await carsRepo.update(id, carPatch as Partial<Car>);
  }

  // return fresh with spec
  const updated = await carsRepo.getById(id);
  const spec = updated?.specId ? await specsRepo.getById(updated.specId) : null;
  return updated ? ({ ...updated, spec } as CarWithSpec) : null;
}

/* DELETE: remove car and its spec (not parts) */
export async function deleteCarAndSpec(id: string): Promise<boolean> {
  const car = await carsRepo.getById(id);
  if (!car) return false;

  if (car.specId) {
    await specsRepo.remove(car.specId);
  }
  const ok = await carsRepo.remove(id);
  return ok;
}

export async function getByVin(vin: string) {
  const car = await carsRepo.getByVin(vin);
  if (!car) return null;

  const spec = car.specId ? await specsRepo.getById(car.specId) : null;

  return { ...car, spec };
}

export async function filterCars(year?: string, make?: string, model?: string) {
  const cars = await carsRepo.filterCars({ year, make, model });

  return Promise.all(
    cars.map(async (car) => ({
      ...car,
      spec: car.specId ? await specsRepo.getById(car.specId) : null,
    }))
  );
}

export async function getByLicensePlate(plate: string): Promise<CarWithSpec | null> {
  const car = await carsRepo.getByLicensePlate(plate);
  if (!car) return null;

  const spec = car.specId ? await specsRepo.getById(car.specId) : null;
  return { ...car, spec }; // ← don't mutate `car`; return a CarWithSpec
}

export async function getByIdWithOption(id: string, expandParts = false): Promise<CarWithSpec | null> {
  const car = await carsRepo.getById(id);
  if (!car) return null;

  const rawSpec = car.specId ? await specsRepo.getById(car.specId) : null;
  const spec = expandParts ? await expandSpec(rawSpec) : rawSpec;

  return { ...car, spec } as CarWithSpec;
}

// You can mirror this for VIN and plate searches:
export async function getByVinWithOption(vin: string, expandParts = false): Promise<CarWithSpec | null> {
  const car = await carsRepo.getByVin(vin);
  if (!car) return null;
  const rawSpec = car.specId ? await specsRepo.getById(car.specId) : null;
  const spec = expandParts ? await expandSpec(rawSpec) : rawSpec;
  return { ...car, spec } as CarWithSpec;
}

export async function getByLicensePlateWithOption(plate: string, expandParts = false): Promise<CarWithSpec | null> {
  const car = await carsRepo.getByLicensePlate(plate);
  if (!car) return null;
  const rawSpec = car.specId ? await specsRepo.getById(car.specId) : null;
  const spec = expandParts ? await expandSpec(rawSpec) : rawSpec;
  return { ...car, spec } as CarWithSpec;
}

//sanitizer for spec update
const NULLISH = new Set([null, undefined, '', 'null']);

function sanitizeSpecPatch(patch: Partial<CarSpec>): Partial<CarSpec> {
  const clean: Partial<CarSpec> = {};
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (NULLISH.has(v as any)) continue; // treat null-ish as "no change"
    clean[k as keyof CarSpec] = v as any;
  }
  return clean;
}
