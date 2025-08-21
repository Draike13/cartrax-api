export interface CarSpec {
  id: number;
  engine_oil_viscosity_id?: number | null;
  engine_oil_quantity_id?: number | null;
  engine_oil_filter_id?: number | null;
  brake_fluid_type_id?: number | null;
  brake_pad_id?: number | null;
  brake_rotor_id?: number | null;
  tire_size_id?: number | null;
  tire_type_id?: number | null;
  transmission_fluid_type_id?: number | null;
  transmission_fluid_quantity_id?: number | null;
  coolant_type_id?: number | null;
  engine_air_filter_id?: number | null;
  cabin_air_filter_id?: number | null;
  wiper_blade_size_driver_id?: number | null;
  wiper_blade_size_passenger_id?: number | null;
  headlight_id?: number | null;
  taillight_id?: number | null;
  brake_light_id?: number | null;
  turn_signal_light_id?: number | null;
  license_plate_light_id?: number | null;
  battery_id?: number | null;
  serpentine_belt_id?: number | null;
  thermostat_id?: number | null;
  license_plate_number?: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// For creating a new spec
export type NewCarSpec = Omit<CarSpec, 'id' | 'createdAt' | 'updatedAt'>;

// For updating a spec (all fields optional)
export type UpdateCarSpec = Partial<NewCarSpec>;
