// Turn "Engine Oil Quantity" (any case/spacing) into a clean key: "engine oil quantity"
function normalizeLabel(x: unknown): string {
  return String(x ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Friendly FE label -> actual DB table name (snake_case). */
const LABEL_TO_TABLE: Record<string, string> = {
  battery: 'battery',
  'brake fluid type': 'brake_fluid_type',
  'brake pad': 'brake_pad',
  'brake light': 'brake_light',
  'brake rotor': 'brake_rotor',
  'cabin air filter': 'cabin_air_filter',
  'camshaft position sensor': 'camshaft_position_sensor',
  'coil pack': 'coil_pack',
  'coolant type': 'coolant_type',
  'crankshaft position sensor': 'crankshaft_position_sensor',
  'crankshaft sprocket': 'crankshaft_sprocket',
  'engine air filter': 'engine_air_filter',
  'engine oil filter': 'engine_oil_filter',
  'engine oil quantity': 'engine_oil_quantity',
  'engine oil viscosity': 'engine_oil_viscosity',
  'head gasket': 'head_gasket',
  headlight: 'headlight',
  'license plate light': 'license_plate_light',
  'maf map sensor': 'maf_map_sensor',
  'serpentine belt': 'serpentine_belt',
  'shocks strut': 'shocks_strut',
  'spark plug': 'spark_plug',
  taillight: 'taillight',
  thermostat: 'thermostat',
  'throttle position sensor': 'throttle_position_sensor',
  'timing chain': 'timing_chain',
  'timing sprocket': 'timing_sprocket',
  'timing tensioner': 'timing_tensioner',
  'tire type': 'tire_type',
  'tire size': 'tire_size',
  'transmission fluid quantity': 'transmission_fluid_quantity',
  'transmission fluid type': 'transmission_fluid_type',
  'turn signal light': 'turn_signal_light',
  'valve cover gasket': 'valve_cover_gasket',
  'vvt solenoid': 'vvt_solenoid',
  'wiper blade size': 'wiper_blade_size', // <-- shared for driver & passenger
};

export function resolvePartsTable(raw: unknown): string | null {
  const label = normalizeLabel(raw);
  return LABEL_TO_TABLE[label] ?? null;
}
