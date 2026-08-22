import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const filePath = (name: string) => path.join(DATA_DIR, `${name}.json`);

export function readDB<T = any>(name: string): T[] {
  try {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeDB<T = any>(name: string, data: T[]): void {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8');
}

export function findById<T = any>(name: string, id: string): T | undefined {
  return readDB<any>(name).find((item: any) => item.id === id);
}

export function insertOne<T = any>(name: string, item: T): T {
  const all = readDB<any>(name);
  all.unshift(item);
  writeDB(name, all);
  return item;
}

export function updateOne<T = any>(name: string, id: string, patch: Partial<T> | Record<string, any>): T | null {
  const all = readDB<any>(name);
  const idx = all.findIndex((x: any) => x.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  writeDB(name, all);
  return all[idx] as T;
}

export function deleteOne(name: string, id: string): boolean {
  const all = readDB<any>(name);
  const filtered = all.filter((x: any) => x.id !== id);
  if (filtered.length === all.length) return false;
  writeDB(name, filtered);
  return true;
}

export function isSeeded(name: string): boolean {
  const fp = filePath(name);
  return fs.existsSync(fp) && fs.statSync(fp).size > 10;
}

export { uuidv4 };
