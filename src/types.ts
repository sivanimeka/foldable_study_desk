export type Material = "plywood" | "hdf" | "solidwood" | "steel" | "aluminium";
export type Finish = "natural" | "matte" | "glossy" | "modern" | "darkwood" | "lightwood";
export type DesignStyle = "minimalist" | "modern" | "industrial" | "scandinavian" | "classic";
export type DeskStatus = "draft" | "saved";

export interface Requirements {
  intendedUser: string;
  roomSpace: string;
  primaryPurpose: string;
  storageRequirement: string;
  designStyle: DesignStyle;
  budgetRange: string;
}

export interface Dimensions {
  width: number; // cm
  depth: number; // cm
  height: number; // cm
  foldedDepth: number; // cm
  tabletopThickness: number; // cm
}

export interface Storage {
  shelves: number;
  drawers: number;
  sideStorage: boolean;
  bookCompartment: boolean;
  laptopCompartment: boolean;
  cableManagement: boolean;
}

export interface DesignConfig {
  id: string;
  name: string;
  requirements: Requirements;
  dimensions: Dimensions;
  material: Material;
  finish: Finish;
  storage: Storage;
  budget: number;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
  status: DeskStatus;
}

export interface CostBreakdown {
  materialCost: number;
  storageCost: number;
  foldingMechanismCost: number;
  additionalComponentsCost: number;
  total: number;
}

export const DIMENSION_LIMITS = {
  width: { min: 60, max: 200 },
  depth: { min: 40, max: 90 },
  height: { min: 65, max: 90 },
  foldedDepth: { min: 10, max: 40 },
  tabletopThickness: { min: 1.5, max: 5 },
};

export const MATERIAL_INFO: Record<
  Material,
  { label: string; description: string; ratePerSqFt: number; density: number; tone: string }
> = {
  plywood: {
    label: "Plywood",
    description: "Engineered wood panels — strong, affordable, lightweight.",
    ratePerSqFt: 120,
    density: 0.9,
    tone: "#c8a273",
  },
  hdf: {
    label: "HDF",
    description: "High-density fibreboard — smooth, uniform, economical.",
    ratePerSqFt: 90,
    density: 0.8,
    tone: "#b08d57",
  },
  solidwood: {
    label: "Solid Wood",
    description: "Natural hardwood — durable, premium grain, long-lasting.",
    ratePerSqFt: 280,
    density: 1.0,
    tone: "#8b5a2b",
  },
  steel: {
    label: "Steel",
    description: "Powder-coated steel frame — heavy-duty, industrial look.",
    ratePerSqFt: 220,
    density: 1.2,
    tone: "#6b7280",
  },
  aluminium: {
    label: "Aluminium",
    description: "Lightweight aluminium — rust-proof, modern, portable.",
    ratePerSqFt: 260,
    density: 0.7,
    tone: "#9ca3af",
  },
};

export const FINISH_INFO: Record<Finish, { label: string; description: string; multiplier: number; tint: string }> = {
  natural: { label: "Natural Wood", description: "Clear coat highlighting original grain.", multiplier: 1.0, tint: "#c8a273" },
  matte: { label: "Matte", description: "Soft non-reflective finish, modern feel.", multiplier: 1.05, tint: "#a8a29e" },
  glossy: { label: "Glossy", description: "High-sheen polished surface.", multiplier: 1.12, tint: "#d6d3d1" },
  modern: { label: "Modern", description: "Contemporary neutral tone.", multiplier: 1.08, tint: "#78716c" },
  darkwood: { label: "Dark Wood", description: "Rich dark walnut stain.", multiplier: 1.1, tint: "#5b3a1f" },
  lightwood: { label: "Light Wood", description: "Bright oak / maple stain.", multiplier: 1.06, tint: "#e0c08a" },
};

export const BUDGET_RANGES = [
  "Under ₹10,000",
  "₹10,000 - ₹20,000",
  "₹20,000 - ₹35,000",
  "₹35,000 - ₹50,000",
  "Above ₹50,000",
];

export const PURPOSES = ["Study", "Office Work", "Gaming", "Drawing / Drafting", "Reading", "Mixed Use"];
export const USERS = ["School Student", "College Student", "Working Professional", "Child", "Shared / Family"];
export const ROOM_SPACES = ["Compact (Small Room)", "Medium Room", "Large Room", "Hostel / Dorm", "Studio Apartment"];
export const STORAGE_NEEDS = ["Minimal", "Moderate", "Extensive", "Books Focused", "Laptop + Accessories"];
