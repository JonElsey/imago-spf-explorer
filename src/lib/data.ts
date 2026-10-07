import type { Dataset, } from './types.ts';

export async function loadDataset(): Promise<Dataset> {
  // fetch the dataset
  const response = await fetch(`${import.meta.env.BASE_URL}data/processed/spf-data.json`);
  // check for HTTP errors and validate the structure of the dataset
  if (!response.ok) throw new Error(`Failed to load dataset (HTTP ${response.status})`);
  const data: Dataset = await response.json();
  if (!data.meta || !data.areas) throw new Error('Invalid dataset structure');
  return data;
}