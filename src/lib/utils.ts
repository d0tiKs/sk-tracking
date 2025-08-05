import { nanoid } from 'nanoid';

export const uid = () => nanoid();

export function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

export function formatDate(dateNumber: number): string {
  const date = new Date(dateNumber);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}