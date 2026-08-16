import { useState } from "react";
import { useApp } from "../App";
import { Button, Card, Badge, EmptyState } from "../components/ui";
import Desk3DScene from "../components/Desk3DScene";
import { createBlankDesign, calculateCost } from "../lib/designEngine";
import {
  RotateCcw,
  FoldVertical,
  UnfoldVertical,
  Maximize,
  Box,
  Info,
  Ruler,
} from "lucide-react";

type ViewName = "free" | "front" | "side" | "top";

export default function Preview3D({ designId }: { designId?: string }) {
  const { currentDesign, setCurrentDesign, navigate, toast, loadDesign, savedDesigns } = useApp();
  const [folded, setFolded] = useState(false);
  const [view, setView] = useState<ViewName>("free");
  const [resetKey, setResetKey] = useState(0);
  const [showDimensions, setShowDimensions] = useState(true);

  // Resolve config: explicit design > current > first saved > blank demo
  let config = currentDesign;
  if (designId) {
    const loaded = loadDesign(designId);
    if (loaded) config = loaded;
  }
  if (!config) {
    if (savedDesigns.length > 0) {
      config = savedDesigns[0];
    } else {
      const blank = createBlankDesign();
      blank.estimatedCost = calculateCost(blank.dimensions, blank.material, blank.finish, blank.storage).total;
      config = blank;
    }
  }

  function ensureCurrent() {
    if (!currentDesign && config) {
      setCurrentDesign(config);
    }
  }

  const views: { name: ViewName; label: string }[] = [
    { name: "free", label: "Free" },
    { name: "front", label: "Front" },
    { name: "side", label: "Side" },
    { name: "top", label: "Top" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Box size={22} className="text-primary-600" /> 3D Preview
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Interact with your foldable desk — rotate, zoom, fold and unfold.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={folded ? "warning" : "success"}>
            Desk Status: {folded ? "Folded" : "Unfolded"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden p-0">
            <div className="h-[420px] sm:h-[520px] bg-neutral-100">
              <Desk3DScene
                config={config!}
                folded={folded}
                view={view}
                resetKey={resetKey}
                showDimensions={showDimensions && !folded}
              />
            </div>
          </Card>
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <Info size={12} /> Drag to rotate · Scroll to zoom · Right-click drag to pan · Touch supported.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Fold Control</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={folded ? "outline" : "primary"}
                onClick={() => setFolded(false)}
                disabled={!folded}
              >
                <UnfoldVertical size={16} /> Unfold Desk
              </Button>
              <Button
                variant={folded ? "primary" : "outline"}
                onClick={() => setFolded(true)}
                disabled={folded}
              >
                <FoldVertical size={16} /> Fold Desk
              </Button>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-neutral-50 text-center">
              <span className="text-sm text-neutral-600">Status: </span>
              <span className={`text-sm font-semibold ${folded ? "text-warning-600" : "text-success-600"}`}>
                {folded ? "Folded" : "Unfolded"}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Camera Views</h3>
            <div className="grid grid-cols-2 gap-2">
              {views.map((v) => (
                <Button
                  key={v.name}
                  variant={view === v.name ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView(v.name)}
                >
                  {v.label}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                setView("free");
                setResetKey((k) => k + 1);
              }}
            >
              <RotateCcw size={14} /> Reset Camera
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Display</h3>
            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <Ruler size={14} /> Show dimension labels
            </label>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-neutral-900 mb-2">Configuration</h3>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Width</dt><dd className="font-medium">{config!.dimensions.width} cm</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Depth</dt><dd className="font-medium">{config!.dimensions.depth} cm</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Height</dt><dd className="font-medium">{config!.dimensions.height} cm</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Folded</dt><dd className="font-medium">{config!.dimensions.foldedDepth} cm</dd></div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => {
                ensureCurrent();
                navigate({ name: "design" });
              }}
            >
              <Maximize size={14} /> Edit Configuration
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
