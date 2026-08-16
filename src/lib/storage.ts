import { DesignConfig } from "../types";

const STORAGE_KEY = "fsda.designs.v1";

interface StoreShape {
  designs: DesignConfig[];
}

function read(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { designs: [] };
    const parsed = JSON.parse(raw) as StoreShape;
    if (!Array.isArray(parsed.designs)) return { designs: [] };
    return parsed;
  } catch {
    return { designs: [] };
  }
}

function write(data: StoreShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist designs", e);
  }
}

export function listDesigns(): DesignConfig[] {
  return read().designs.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

export function saveDesign(design: DesignConfig): DesignConfig {
  const store = read();
  const idx = store.designs.findIndex((d) => d.id === design.id);
  const updated: DesignConfig = { ...design, updatedAt: new Date().toISOString(), status: "saved" };
  if (idx >= 0) {
    store.designs[idx] = updated;
  } else {
    store.designs.push(updated);
  }
  write(store);
  return updated;
}

export function deleteDesign(id: string): void {
  const store = read();
  store.designs = store.designs.filter((d) => d.id !== id);
  write(store);
}

export function getDesign(id: string): DesignConfig | undefined {
  return read().designs.find((d) => d.id === id);
}
