export interface ModelMetric {
  name: string;
  mae: number;
  rmse: number;
  r2: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionInput {
  storeSize: number;
  isHoliday: boolean;
  cpi: number;
  unemployment: number;
  temperature: number;
  fuelPrice: number;
  dept: number;
}

export enum Page {
  HOME = 'HOME',
  PREDICT = 'PREDICT'
}