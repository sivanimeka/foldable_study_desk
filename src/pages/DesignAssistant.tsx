import { useEffect, useMemo, useState } from "react";
import { useApp } from "../App";
import { Button, Card, SectionTitle, Badge } from "../components/ui";
import {
  Ruler,
  Layers,
  Box,
  Calculator,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Save,
  Lightbulb,
  Eye,
} from "lucide-react";
import {
  DesignConfig,
  DIMENSION_LIMITS,
  MATERIAL_INFO,
  FINISH_INFO,
  BUDGET_RANGES,
  USERS,
  ROOM_SPACES,
  PURPOSES,
  STORAGE_NEEDS,
  Material,
  Finish,
  DesignStyle,
} from "../types";
import { calculateCost, formatINR, generateRecommendation, createBlankDesign } from "../lib/designEngine";
import Desk3DScene from "../components/Desk3DScene";

const STEPS = [
  "Requirements",
  "Dimensions",
  "Materials",
  "Storage",
  "Budget",
  "3D Preview",
  "Final Design",
];

export default function DesignAssistant({ designId }: { designId?: string }) {
  const { currentDesign, setCurrentDesign, updateCurrentDesign, saveCurrent, navigate, toast, loadDesign } = useApp();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (designId) {
      const d = loadDesign(designId);
      if (!d) {
        toast("Design not found", "error");
        navigate({ name: "design" });
      }
    } else if (!currentDesign) {
      const blank = createBlankDesign();
      const cost = calculateCost(blank.dimensions, blank.material, blank.finish, blank.storage);
      blank.estimatedCost = cost.total;
      setCurrentDesign(blank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId]);

  const design = currentDesign;

  const cost = useMemo(
    () =>
      design
        ? calculateCost(design.dimensions, design.material, design.finish, design.storage)
        : null,
    [design]
  );

  const recommendation = useMemo(
    () => (design && cost ? generateRecommendation({ ...design, estimatedCost: cost.total }) : null),
    [design, cost]
  );

  if (!design || !cost || !recommendation) return <div className="p-8">Loading…</div>;

  const d = design;

  function validateDimensions(): boolean {
    const e: Record<string, string> = {};
    const dims = d.dimensions;
    const L = DIMENSION_LIMITS;
    if (dims.width < L.width.min || dims.width > L.width.max)
      e.width = `Width must be between ${L.width.min} cm and ${L.width.max} cm.`;
    if (dims.depth < L.depth.min || dims.depth > L.depth.max)
      e.depth = `Depth must be between ${L.depth.min} cm and ${L.depth.max} cm.`;
    if (dims.height < L.height.min || dims.height > L.height.max)
      e.height = `Height must be between ${L.height.min} cm and ${L.height.max} cm.`;
    if (dims.foldedDepth < L.foldedDepth.min || dims.foldedDepth > L.foldedDepth.max)
      e.foldedDepth = `Folded depth must be between ${L.foldedDepth.min} cm and ${L.foldedDepth.max} cm.`;
    if (dims.foldedDepth >= dims.depth) e.foldedDepth = "Folded depth must be less than unfolded depth.";
    if (dims.tabletopThickness < L.tabletopThickness.min || dims.tabletopThickness > L.tabletopThickness.max)
      e.tabletopThickness = `Tabletop thickness must be between ${L.tabletopThickness.min} cm and ${L.tabletopThickness.max} cm.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 1 && !validateDimensions()) {
      toast("Please fix the dimension errors before continuing.", "error");
      return;
    }
    if (step === 4 && d.budget < 1000) {
      toast("Budget must be at least ₹1,000.", "error");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const update = (patch: Partial<DesignConfig>) => updateCurrentDesign(patch);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SectionTitle
          title="Design Assistant"
          subtitle="Build your foldable desk step by step."
          icon={<Ruler size={22} />}
        />
        <input
          value={design.name}
          onChange={(e) => update({ name: e.target.value })}
          className="px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Design name"
          aria-label="Design name"
        />
      </div>

      {/* Progress */}
      <Card className="p-4 mb-6">
        <ol className="flex items-center flex-wrap gap-y-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i === step
                    ? "bg-primary-600 text-white"
                    : i < step
                    ? "text-primary-700 hover:bg-primary-50"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    i === step ? "bg-white/20" : i < step ? "bg-primary-100" : "bg-neutral-200"
                  }`}
                >
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-neutral-300 mx-0.5 hidden sm:block" />}
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 0 && <RequirementsStep design={design} update={update} />}
          {step === 1 && (
            <DimensionsStep design={design} update={update} errors={errors} />
          )}
          {step === 2 && <MaterialsStep design={design} update={update} />}
          {step === 3 && <StorageStep design={design} update={update} />}
          {step === 4 && <BudgetStep design={design} update={update} />}
          {step === 5 && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900">Live 3D Preview</h3>
                  <Badge color="primary">Interactive</Badge>
                </div>
                <div className="h-[420px] rounded-xl overflow-hidden bg-neutral-100">
                  <Desk3DScene config={design} folded={false} view="free" resetKey={0} showDimensions />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Drag to rotate, scroll to zoom, right-click to pan. Visit the full 3D Preview page for
                  fold/unfold controls.
                </p>
              </Card>
            </div>
          )}
          {step === 6 && (
            <FinalStep design={design} cost={cost} recommendation={recommendation} />
          )}
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Current Configuration</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Dimensions" value={`${design.dimensions.width}×${design.dimensions.depth}×${design.dimensions.height} cm`} />
              <Row label="Folded depth" value={`${design.dimensions.foldedDepth} cm`} />
              <Row label="Material" value={MATERIAL_INFO[design.material].label} />
              <Row label="Finish" value={FINISH_INFO[design.finish].label} />
              <Row label="Shelves" value={`${design.storage.shelves}`} />
              <Row label="Drawers" value={`${design.storage.drawers}`} />
              <Row label="Budget" value={formatINR(design.budget)} />
              <div className="pt-3 mt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Estimated Cost</dt>
                  <dd className="font-bold text-primary-700">{formatINR(cost.total)}</dd>
                </div>
                {cost.total > design.budget && (
                  <p className="text-xs text-error-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Exceeds budget by {formatINR(cost.total - design.budget)}
                  </p>
                )}
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-warning-600" />
              <h3 className="font-semibold text-neutral-900 text-sm">Smart Tip</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">{recommendation.summary}</p>
          </Card>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-8 gap-3">
        <Button variant="outline" onClick={back} disabled={step === 0}>
          <ChevronLeft size={18} /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={saveCurrent}>
            <Save size={16} /> Save
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Next <ChevronRight size={18} />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate({ name: "preview" })}>
                <Eye size={16} /> 3D Preview
              </Button>
              <Button onClick={saveCurrent}>Save Design</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

/* ---------- Steps ---------- */

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium text-neutral-800">{label}</label>
      {hint && <p className="text-xs text-neutral-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function RequirementsStep({
  design,
  update,
}: {
  design: DesignConfig;
  update: (patch: Partial<DesignConfig>) => void;
}) {
  const r = design.requirements;
  const setR = (patch: Partial<DesignConfig["requirements"]>) =>
    update({ requirements: { ...r, ...patch } });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-neutral-900 mb-1">Tell us about your needs</h3>
      <p className="text-sm text-neutral-500 mb-5">
        These answers help shape the recommended desk configuration.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel label="Intended User" hint="Who will primarily use this desk?" />
          <Select value={r.intendedUser} onChange={(v) => setR({ intendedUser: v })} options={USERS} />
        </div>
        <div>
          <FieldLabel label="Available Room Space" hint="Pick the option that best matches your room." />
          <Select value={r.roomSpace} onChange={(v) => setR({ roomSpace: v })} options={ROOM_SPACES} />
        </div>
        <div>
          <FieldLabel label="Primary Purpose" hint="What will the desk be used for most?" />
          <Select value={r.primaryPurpose} onChange={(v) => setR({ primaryPurpose: v })} options={PURPOSES} />
        </div>
        <div>
          <FieldLabel label="Storage Requirements" hint="How much storage do you need?" />
          <Select value={r.storageRequirement} onChange={(v) => setR({ storageRequirement: v })} options={STORAGE_NEEDS} />
        </div>
        <div>
          <FieldLabel label="Preferred Design Style" hint="Overall look and feel." />
          <Select
            value={r.designStyle}
            onChange={(v) => setR({ designStyle: v as DesignStyle })}
            options={["minimalist", "modern", "industrial", "scandinavian", "classic"]}
          />
        </div>
        <div>
          <FieldLabel label="Budget Range" hint="A rough budget bracket for your desk." />
          <Select value={r.budgetRange} onChange={(v) => setR({ budgetRange: v })} options={BUDGET_RANGES} />
        </div>
      </div>
    </Card>
  );
}

function DimensionsStep({
  design,
  update,
  errors,
}: {
  design: DesignConfig;
  update: (patch: Partial<DesignConfig>) => void;
  errors: Record<string, string>;
}) {
  const d = design.dimensions;
  const setD = (patch: Partial<DesignConfig["dimensions"]>) =>
    update({ dimensions: { ...d, ...patch } });
  const L = DIMENSION_LIMITS;

  const sliders: {
    key: keyof typeof L;
    label: string;
    value: number;
    step: number;
    hint: string;
  }[] = [
    { key: "width", label: "Desk Width", value: d.width, step: 1, hint: "Total left-to-right span of the tabletop." },
    { key: "depth", label: "Desk Depth", value: d.depth, step: 1, hint: "Front-to-back size when unfolded." },
    { key: "height", label: "Desk Height", value: d.height, step: 1, hint: "Floor to tabletop top edge." },
    { key: "foldedDepth", label: "Folded Depth", value: d.foldedDepth, step: 1, hint: "Depth when the desk is folded flat." },
    { key: "tabletopThickness", label: "Tabletop Thickness", value: d.tabletopThickness, step: 0.1, hint: "Thickness of the top panel." },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-neutral-900 mb-1">Customize Desk Dimensions</h3>
      <p className="text-sm text-neutral-500 mb-5">Adjust each measurement with the sliders or numeric inputs.</p>
      <div className="space-y-6">
        {sliders.map((s) => {
          const lim = L[s.key];
          const err = errors[s.key];
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <label className="text-sm font-medium text-neutral-800">{s.label}</label>
                  <p className="text-xs text-neutral-500">{s.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={s.value}
                    min={lim.min}
                    max={lim.max}
                    step={s.step}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setD({ [s.key]: v } as any);
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500 w-6">cm</span>
                </div>
              </div>
              <input
                type="range"
                min={lim.min}
                max={lim.max}
                step={s.step}
                value={s.value}
                onChange={(e) => setD({ [s.key]: parseFloat(e.target.value) } as any)}
                className="w-full"
              />
              {err && (
                <p className="text-xs text-error-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {err}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MaterialsStep({
  design,
  update,
}: {
  design: DesignConfig;
  update: (patch: Partial<DesignConfig>) => void;
}) {
  const materials: Material[] = ["plywood", "hdf", "solidwood", "steel", "aluminium"];
  const finishes: Finish[] = ["natural", "matte", "glossy", "modern", "darkwood", "lightwood"];

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 mb-1">Select Material</h3>
        <p className="text-sm text-neutral-500 mb-5">Each material has its own price, strength and appearance.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {materials.map((m) => {
            const info = MATERIAL_INFO[m];
            const active = design.material === m;
            return (
              <button
                key={m}
                onClick={() => update({ material: m })}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  active ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">{info.label}</span>
                  <span
                    className="w-6 h-6 rounded-full border border-neutral-300"
                    style={{ backgroundColor: info.tone }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1.5">{info.description}</p>
                <p className="text-xs font-medium text-primary-700 mt-2">₹{info.ratePerSqFt}/sq ft</p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 mb-1">Select Finish</h3>
        <p className="text-sm text-neutral-500 mb-5">The finish affects the look and the final price.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {finishes.map((f) => {
            const info = FINISH_INFO[f];
            const active = design.finish === f;
            return (
              <button
                key={f}
                onClick={() => update({ finish: f })}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  active ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-md border border-neutral-300"
                    style={{ backgroundColor: info.tint }}
                  />
                  <span className="font-medium text-sm text-neutral-900">{info.label}</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5">{info.description}</p>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StorageStep({
  design,
  update,
}: {
  design: DesignConfig;
  update: (patch: Partial<DesignConfig>) => void;
}) {
  const s = design.storage;
  const setS = (patch: Partial<DesignConfig["storage"]>) =>
    update({ storage: { ...s, ...patch } });

  const toggles: { key: keyof typeof s; label: string; desc: string }[] = [
    { key: "sideStorage", label: "Side Storage", desc: "Vertical panel storage on one side." },
    { key: "bookCompartment", label: "Book Compartment", desc: "Dedicated divider for books." },
    { key: "laptopCompartment", label: "Laptop Compartment", desc: "Raised ledge to hold a laptop in place." },
    { key: "cableManagement", label: "Cable Management", desc: "Grommet hole for routing cables." },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-neutral-900 mb-1">Customize Storage</h3>
      <p className="text-sm text-neutral-500 mb-5">Add shelves, drawers and compartments to fit your needs.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-800">Number of Shelves</label>
            <span className="font-bold text-primary-700">{s.shelves}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={s.shelves}
            onChange={(e) => setS({ shelves: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>0</span><span>5</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-800">Number of Drawers</label>
            <span className="font-bold text-primary-700">{s.drawers}</span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={s.drawers}
            onChange={(e) => setS({ drawers: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>0</span><span>4</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {toggles.map((t) => {
          const active = s[t.key] as boolean;
          return (
            <button
              key={t.key}
              onClick={() => setS({ [t.key]: !active } as any)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                active ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  active ? "bg-primary-600 text-white" : "bg-neutral-200"
                }`}
              >
                {active && <Check size={14} />}
              </div>
              <div>
                <div className="font-medium text-sm text-neutral-900">{t.label}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual config */}
      <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
        <div className="flex items-center gap-2 mb-3">
          <Box size={16} className="text-primary-600" />
          <span className="text-sm font-medium text-neutral-800">Storage Configuration</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color="primary">{s.shelves} Shelves</Badge>
          <Badge color="primary">{s.drawers} Drawers</Badge>
          {s.sideStorage && <Badge color="primary">Side Storage</Badge>}
          {s.bookCompartment && <Badge color="primary">Book Compartment</Badge>}
          {s.laptopCompartment && <Badge color="primary">Laptop Compartment</Badge>}
          {s.cableManagement && <Badge color="primary">Cable Management</Badge>}
        </div>
      </div>
    </Card>
  );
}

function BudgetStep({
  design,
  update,
}: {
  design: DesignConfig;
  update: (patch: Partial<DesignConfig>) => void;
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-neutral-900 mb-1">Set Your Budget</h3>
      <p className="text-sm text-neutral-500 mb-5">
        We'll compare your budget with the estimated cost and recommend adjustments.
      </p>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-neutral-800">Budget (₹)</label>
        <span className="font-bold text-primary-700 text-lg">{formatINR(design.budget)}</span>
      </div>
      <input
        type="range"
        min={2000}
        max={80000}
        step={500}
        value={design.budget}
        onChange={(e) => update({ budget: parseInt(e.target.value) })}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>₹2,000</span>
        <span>₹80,000</span>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-neutral-800">Enter exact amount</label>
        <div className="flex items-center mt-1.5">
          <span className="px-3 py-2.5 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 text-sm">₹</span>
          <input
            type="number"
            min={1000}
            value={design.budget}
            onChange={(e) => update({ budget: Math.max(1000, parseInt(e.target.value) || 1000) })}
            className="w-40 px-3 py-2.5 rounded-r-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </Card>
  );
}

function FinalStep({
  design,
  cost,
  recommendation,
}: {
  design: DesignConfig;
  cost: ReturnType<typeof calculateCost>;
  recommendation: ReturnType<typeof generateRecommendation>;
}) {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-warning-600" />
          <h3 className="font-semibold text-neutral-900">Recommended Design</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <Row label="Width" value={`${recommendation.dimensions.width} cm`} />
            <Row label="Depth" value={`${recommendation.dimensions.depth} cm`} />
            <Row label="Height" value={`${recommendation.dimensions.height} cm`} />
            <Row label="Material" value={MATERIAL_INFO[recommendation.material].label} />
          </div>
          <div className="space-y-2">
            <Row label="Shelves" value={`${recommendation.shelves}`} />
            <Row label="Drawers" value={`${recommendation.drawers}`} />
            <Row label="Folded depth" value={`${recommendation.dimensions.foldedDepth} cm`} />
            <Row label="Est. cost" value={formatINR(recommendation.estimatedCost)} />
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
          <p className="text-sm text-neutral-800 leading-relaxed">{recommendation.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {recommendation.advantages.map((a, i) => (
              <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                <Check size={16} className="text-success-600 mt-0.5 shrink-0" /> {a}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 mb-3">Cost Summary</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Row label="Material Cost" value={formatINR(cost.materialCost)} />
          <Row label="Storage Cost" value={formatINR(cost.storageCost)} />
          <Row label="Folding Mechanism" value={formatINR(cost.foldingMechanismCost)} />
          <Row label="Additional Components" value={formatINR(cost.additionalComponentsCost)} />
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
          <span className="font-semibold text-neutral-900">Estimated Total</span>
          <span className="text-xl font-bold text-primary-700">{formatINR(cost.total)}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          This is an estimated cost and may vary based on actual material and manufacturing prices.
        </p>
      </Card>

      <Card className="p-6">
        <div className="h-[360px] rounded-xl overflow-hidden bg-neutral-100">
          <Desk3DScene config={design} folded={false} view="free" resetKey={0} showDimensions />
        </div>
      </Card>
    </div>
  );
}
