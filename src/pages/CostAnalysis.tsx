import { useMemo } from "react";
import { useApp } from "../App";
import { Button, Card, EmptyState, Badge } from "../components/ui";
import { Calculator, AlertCircle, ArrowRight, Info } from "lucide-react";
import { calculateCost, formatINR } from "../lib/designEngine";
import { MATERIAL_INFO, FINISH_INFO } from "../types";

export default function CostAnalysis({ designId }: { designId?: string }) {
  const { currentDesign, savedDesigns, navigate, loadDesign } = useApp();

  let config = currentDesign;
  if (designId) {
    const loaded = loadDesign(designId);
    if (loaded) config = loaded;
  }
  if (!config && savedDesigns.length > 0) config = savedDesigns[0];

  const cost = useMemo(
    () => (config ? calculateCost(config.dimensions, config.material, config.finish, config.storage) : null),
    [config]
  );

  if (!config || !cost) {
    return (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <Card>
          <EmptyState
            icon={<Calculator size={28} />}
            title="No design to analyze"
            message="Create or select a design first to see its cost breakdown."
            action={<Button onClick={() => navigate({ name: "design" })}>Start a Design</Button>}
          />
        </Card>
      </div>
    );
  }

  const items = [
    { label: "Material Cost", value: cost.materialCost, color: "bg-primary-500" },
    { label: "Storage Cost", value: cost.storageCost, color: "bg-success-500" },
    { label: "Folding Mechanism", value: cost.foldingMechanismCost, color: "bg-warning-500" },
    { label: "Additional Components", value: cost.additionalComponentsCost, color: "bg-accent-500" },
  ];
  const max = Math.max(...items.map((i) => i.value), 1);

  const overBudget = cost.total > config.budget;
  const budgetPct = Math.min(100, (cost.total / config.budget) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Calculator size={22} className="text-primary-600" /> Cost Analysis
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Estimated breakdown for "{config.name}".</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ name: "design" })}>
          Edit Design
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-neutral-700">{it.label}</span>
                    <span className="font-semibold text-neutral-900">{formatINR(it.value)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full ${it.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(it.value / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Estimated Total</span>
              <span className="text-2xl font-bold text-primary-700">{formatINR(cost.total)}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Cost Distribution</h3>
            <div className="flex h-4 rounded-full overflow-hidden">
              {items.map((it) => (
                <div
                  key={it.label}
                  className={it.color}
                  style={{ width: `${(it.value / cost.total) * 100}%` }}
                  title={`${it.label}: ${formatINR(it.value)}`}
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4 text-xs">
              {items.map((it) => (
                <div key={it.label} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${it.color}`} />
                  <span className="text-neutral-600">{it.label}</span>
                  <span className="text-neutral-900 font-medium ml-auto">
                    {Math.round((it.value / cost.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Budget Status</h3>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-neutral-600">Budget</span>
              <span className="font-medium">{formatINR(config.budget)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-error-500" : "bg-success-500"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="mt-3">
              {overBudget ? (
                <p className="text-sm text-error-600 flex items-center gap-1.5">
                  <AlertCircle size={16} /> Over budget by {formatINR(cost.total - config.budget)}
                </p>
              ) : (
                <p className="text-sm text-success-600 flex items-center gap-1.5">
                  Within budget · {formatINR(config.budget - cost.total)} remaining
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Configuration</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Dimensions</dt><dd className="font-medium">{config.dimensions.width}×{config.dimensions.depth}×{config.dimensions.height} cm</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Material</dt><dd className="font-medium">{MATERIAL_INFO[config.material].label}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Finish</dt><dd className="font-medium">{FINISH_INFO[config.finish].label}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Shelves</dt><dd className="font-medium">{config.storage.shelves}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Drawers</dt><dd className="font-medium">{config.storage.drawers}</dd></div>
            </dl>
            <Button className="w-full mt-4" onClick={() => navigate({ name: "reports" })}>
              View Full Report <ArrowRight size={16} />
            </Button>
          </Card>

          <Card className="p-4 bg-neutral-50 border-neutral-200">
            <p className="text-xs text-neutral-600 flex items-start gap-2">
              <Info size={14} className="text-neutral-400 mt-0.5 shrink-0" />
              The amount shown is an estimated cost and may vary based on actual material and
              manufacturing prices.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
