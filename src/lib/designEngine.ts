import {
  CostBreakdown,
  DesignConfig,
  Dimensions,
  Material,
  FINISH_INFO,
  MATERIAL_INFO,
  Storage,
  USERS,
  ROOM_SPACES,
  PURPOSES,
  STORAGE_NEEDS,
  BUDGET_RANGES,
} from "../types";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

const cmToSqFt = (cm2: number) => cm2 / 929.0304;

export function calculateCost(
  dims: Dimensions,
  material: Material,
  finish: keyof typeof FINISH_INFO,
  storage: Storage
): CostBreakdown {
  const mat = MATERIAL_INFO[material];
  const finishInfo = FINISH_INFO[finish];

  // Tabletop area (cm² -> sq ft)
  const tabletopArea = cmToSqFt(dims.width * dims.depth);
  // Side panels + back + shelf surfaces (rough surface area estimate)
  const sidePanels = cmToSqFt(2 * dims.depth * dims.height);
  const backPanel = cmToSqFt(dims.width * dims.height * 0.6);
  const shelfArea = cmToSqFt(storage.shelves * dims.width * (dims.depth - 6));
  const totalSurface = tabletopArea + sidePanels + backPanel + shelfArea;

  const materialCost = totalSurface * mat.ratePerSqFt * finishInfo.multiplier;

  // Storage cost
  const shelfUnitCost = 350;
  const drawerUnitCost = 1200;
  const sideStorageCost = storage.sideStorage ? 900 : 0;
  const bookCompCost = storage.bookCompartment ? 600 : 0;
  const laptopCompCost = storage.laptopCompartment ? 700 : 0;
  const cableCost = storage.cableManagement ? 250 : 0;

  const storageCost =
    storage.shelves * shelfUnitCost +
    storage.drawers * drawerUnitCost +
    sideStorageCost +
    bookCompCost +
    laptopCompCost +
    cableCost;

  // Folding mechanism cost — hinges, brackets, supports based on width
  const foldingMechanismCost = 800 + dims.width * 6 + (dims.depth - dims.foldedDepth) * 12;

  // Additional components — hardware, edging, assembly
  const additionalComponentsCost =
    500 + dims.width * 4 + storage.drawers * 150 + (storage.cableManagement ? 120 : 0);

  const total = materialCost + storageCost + foldingMechanismCost + additionalComponentsCost;

  return {
    materialCost,
    storageCost,
    foldingMechanismCost,
    additionalComponentsCost,
    total,
  };
}

export interface Recommendation {
  dimensions: Dimensions;
  material: Material;
  shelves: number;
  drawers: number;
  estimatedCost: number;
  advantages: string[];
  summary: string;
}

export function generateRecommendation(config: DesignConfig): Recommendation {
  const { requirements, dimensions, material, storage, budget } = config;
  const rec: Recommendation = {
    dimensions: { ...dimensions },
    material,
    shelves: storage.shelves,
    drawers: storage.drawers,
    estimatedCost: config.estimatedCost,
    advantages: [],
    summary: "",
  };

  // Adjust dimensions based on room space
  if (requirements.roomSpace.includes("Compact") || requirements.roomSpace.includes("Hostel")) {
    rec.dimensions.width = Math.min(dimensions.width, 100);
    rec.dimensions.depth = Math.min(dimensions.depth, 55);
    rec.dimensions.foldedDepth = Math.min(dimensions.foldedDepth, 18);
  } else if (requirements.roomSpace.includes("Large")) {
    rec.dimensions.width = Math.max(dimensions.width, 130);
  }

  // Material recommendation by budget
  const cost = config.estimatedCost;
  if (budget > 0 && cost > budget) {
    if (material === "solidwood") rec.material = "plywood";
    else if (material === "aluminium") rec.material = "steel";
  }

  // Shelves/drawers based on storage need
  if (requirements.storageRequirement === "Minimal") {
    rec.shelves = Math.min(storage.shelves, 1);
    rec.drawers = Math.min(storage.drawers, 1);
  } else if (requirements.storageRequirement === "Extensive" || requirements.storageRequirement === "Books Focused") {
    rec.shelves = Math.max(storage.shelves, 3);
    rec.drawers = Math.max(storage.drawers, 2);
  }

  const recCost = calculateCost(rec.dimensions, rec.material, config.finish, {
    ...storage,
    shelves: rec.shelves,
    drawers: rec.drawers,
  });
  rec.estimatedCost = recCost.total;

  rec.advantages = [
    `Optimized for ${requirements.roomSpace.toLowerCase()} — saves floor space when folded.`,
    `${MATERIAL_INFO[rec.material].label} offers a balance of durability and cost.`,
    `${rec.shelves} shelf${rec.shelves !== 1 ? "s" : ""} and ${rec.drawers} drawer${rec.drawers !== 1 ? "s" : ""} cover your ${requirements.storageRequirement.toLowerCase()} storage needs.`,
    `Folded depth of ${rec.dimensions.foldedDepth} cm lets the desk tuck away when not in use.`,
  ];

  rec.summary = `A ${rec.dimensions.width}×${rec.dimensions.depth}×${rec.dimensions.height} cm foldable desk in ${MATERIAL_INFO[rec.material].label}, tailored for ${requirements.intendedUser.toLowerCase()} use. Designed for ${requirements.primaryPurpose.toLowerCase()} with ${requirements.storageRequirement.toLowerCase()} storage, it folds to ${rec.dimensions.foldedDepth} cm depth for compact rooms.`;

  return rec;
}

export function createBlankDesign(): DesignConfig {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "Untitled Design",
    requirements: {
      intendedUser: USERS[1],
      roomSpace: ROOM_SPACES[0],
      primaryPurpose: PURPOSES[0],
      storageRequirement: STORAGE_NEEDS[1],
      designStyle: "modern",
      budgetRange: BUDGET_RANGES[1],
    },
    dimensions: {
      width: 120,
      depth: 60,
      height: 75,
      foldedDepth: 18,
      tabletopThickness: 2.5,
    },
    material: "plywood",
    finish: "natural",
    storage: {
      shelves: 2,
      drawers: 1,
      sideStorage: false,
      bookCompartment: true,
      laptopCompartment: true,
      cableManagement: true,
    },
    budget: 20000,
    estimatedCost: 0,
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
}
