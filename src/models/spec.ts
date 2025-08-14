export interface CarSpec {
  id: string;
  engine_oil_viscosity?: string | null;
  engine_oil_quantity?: string | null;
  engine_oil_filter?: string | null;
  brake_fluid_type?: string | null;
  brake_pad?: string | null;
  brake_rotor?: string | null;
  tire_size?: string | null;
  tire_type?: string | null;
  transmission_fluid_type?: string | null;
  transmission_fluid_quantity?: string | null;
  coolant_type?: string | null;
  engine_air_filter?: string | null;
  cabin_air_filter?: string | null;
  wiper_blade_size?: string | null;
  headlight?: string | null;
  taillight?: string | null;
  brake_light?: string | null;
  turn_signal_light?: string | null;
  license_plate_light?: string | null;
  battery?: string | null;
  serpentine_belt?: string | null;
  thermostat?: string | null;
  license_plate_number?: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// For creating a new spec
export type NewCarSpec = Omit<CarSpec, 'id' | 'createdAt' | 'updatedAt'>;

// For updating a spec (all fields optional)
export type UpdateCarSpec = Partial<NewCarSpec>;
