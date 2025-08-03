import { nanoid } from 'nanoid';

export const uid = () => nanoid();

export function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}