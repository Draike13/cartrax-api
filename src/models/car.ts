import { CarSpec } from './spec';
import { UpdateCarSpec } from './spec';

export interface Car {
  id: string;
  year: number;
  make: string;
  model: string;
  color: string;
  trim?: string | null;
  mileage?: string | null;
  notes?: string | null;
  vin?: string | null;

  //linked spec from CarSpec
  specId?: string | null;

  //created timestamps
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

//use for GET requests to include car specs with car
export interface CarWithSpec extends Car {
  spec?: CarSpec | null;
}

export type NewCar = Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'specId'>;

export type UpdateCar = Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'specId'>> & {
  spec?: UpdateCarSpec;
};
