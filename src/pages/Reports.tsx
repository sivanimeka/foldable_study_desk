import { useMemo, useRef } from "react";
import { useApp } from "../App";
import { Button, Card, EmptyState } from "../components/ui";
import {
  FileText,
  Printer,
  Download,
  ArrowRight,
  Ruler,
  Layers,
  Calculator,
  Lightbulb,
  User,
} from "lucide-react";
import { calculateCost, formatINR, generateRecommendation } from "../lib/designEngine";
import { MATERIAL_INFO, FINISH_INFO } from "../types";

export default function Reports({ designId }: { designId?: string }) {
  const { currentDesign, savedDesigns, navigate, loadDesign, toast } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);

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
  const recommendation = useMemo(
    () => (config && cost ? generateRecommendation({ ...config!, estimatedCost: cost.total }) : null),
    [config, cost]
  );

  if (!config || !cost || !recommendation) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <Card>
          <EmptyState
            icon={<FileText size={28} />}
            title="No report available"
            message="Create or load a design first to generate a professional design report."
            action={<Button onClick={() => navigate({ name: "design" })}>Start a Design</Button>}
          />
        </Card>
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const html = reportRef.current?.innerHTML ?? "";
    const full = `<!doctype html><html><head><meta charset="utf-8"><title>${config!.name} — Design Report</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;color:#0f172a;background:#fff;padding:32px;max-width:800px;margin:auto;line-height:1.6}
      h1{color:#1d44d8;margin:0 0 4px}
      h2{color:#1e3aaf;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:28px}
      h3{color:#334155}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      td,th{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:14px}
      th{background:#f1f5f9}
      .total{font-weight:700;color:#1d44d8;font-size:18px}
      .muted{color:#64748b;font-size:13px}
      .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin:8px 0}
    </style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config!.name.replace(/[^a-z0-9]/gi, "_")}_report.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Report downloaded", "success");
  }

  const storageFeatures: string[] = [];
  if (config.storage.sideStorage) storageFeatures.push("Side Storage");
  if (config.storage.bookCompartment) storageFeatures.push("Book Compartment");
  if (config.storage.laptopCompartment) storageFeatures.push("Laptop Compartment");
  if (config.storage.cableManagement) storageFeatures.push("Cable Management");

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <FileText size={22} className="text-primary-600" /> Design Report
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">A complete, printable summary of your design.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download size={16} /> Download
          </Button>
          <Button onClick={handlePrint}>
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      <Card className="p-8 print-area" >
        <div ref={reportRef}>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-5 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">Foldable Study Desk Assistant</h1>
              <p className="text-sm text-neutral-500">Engineering Design Report</p>
            </div>
            <div className="text-right text-sm text-neutral-500">
              <p>Report generated</p>
              <p className="font-medium text-neutral-800">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Project info */}
          <Section title="Project Information" icon={<FileText size={16} />}>
            <table className="w-full text-sm">
              <tbody>
                <Tr k="Design Name" v={config.name} />
                <Tr k="Date Created" v={new Date(config.createdAt).toLocaleDateString("en-IN")} />
                <Tr k="Status" v={config.status === "saved" ? "Saved" : "Draft"} />
              </tbody>
            </table>
          </Section>

          {/* User requirements */}
          <Section title="User Requirements" icon={<User size={16} />}>
            <table className="w-full text-sm">
              <tbody>
                <Tr k="Intended User" v={config.requirements.intendedUser} />
                <Tr k="Room Space" v={config.requirements.roomSpace} />
                <Tr k="Primary Purpose" v={config.requirements.primaryPurpose} />
                <Tr k="Storage Requirement" v={config.requirements.storageRequirement} />
                <Tr k="Design Style" v={config.requirements.designStyle} />
                <Tr k="Budget Range" v={config.requirements.budgetRange} />
              </tbody>
            </table>
          </Section>

          {/* Design specifications */}
          <Section title="Design Specifications" icon={<Ruler size={16} />}>
            <table className="w-full text-sm">
              <tbody>
                <Tr k="Width" v={`${config.dimensions.width} cm`} />
                <Tr k="Depth" v={`${config.dimensions.depth} cm`} />
                <Tr k="Height" v={`${config.dimensions.height} cm`} />
                <Tr k="Folded Depth" v={`${config.dimensions.foldedDepth} cm`} />
                <Tr k="Tabletop Thickness" v={`${config.dimensions.tabletopThickness} cm`} />
                <Tr k="Material" v={MATERIAL_INFO[config.material].label} />
                <Tr k="Finish" v={FINISH_INFO[config.finish].label} />
                <Tr k="Shelves" v={`${config.storage.shelves}`} />
                <Tr k="Drawers" v={`${config.storage.drawers}`} />
                <Tr k="Storage Configuration" v={storageFeatures.length ? storageFeatures.join(", ") : "Standard"} />
              </tbody>
            </table>
          </Section>

          {/* Cost analysis */}
          <Section title="Cost Analysis" icon={<Calculator size={16} />}>
            <table className="w-full text-sm">
              <tbody>
                <Tr k="Material Cost" v={formatINR(cost.materialCost)} />
                <Tr k="Storage Cost" v={formatINR(cost.storageCost)} />
                <Tr k="Folding Mechanism Cost" v={formatINR(cost.foldingMechanismCost)} />
                <Tr k="Additional Components" v={formatINR(cost.additionalComponentsCost)} />
                <tr>
                  <td className="py-2 px-3 font-semibold border border-neutral-200 bg-neutral-50">Estimated Total</td>
                  <td className="py-2 px-3 font-bold text-primary-700 border border-neutral-200 bg-neutral-50 text-lg">{formatINR(cost.total)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-neutral-500 mt-3">
              The amount shown is an estimated cost and may vary based on actual material and manufacturing prices.
            </p>
          </Section>

          {/* Design summary */}
          <Section title="Design Summary" icon={<Layers size={16} />}>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-700 leading-relaxed">
              {recommendation.summary}
            </div>
          </Section>

          {/* Recommendations */}
          <Section title="Recommendations" icon={<Lightbulb size={16} />}>
            <ul className="space-y-2 text-sm text-neutral-700 list-disc pl-5">
              {recommendation.advantages.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
              {cost.total > config.budget && (
                <li className="text-error-600">
                  Estimated cost exceeds the budget. Consider switching to a more economical material or reducing storage.
                </li>
              )}
              <li>Verify all dimensions against your actual room measurements before fabrication.</li>
              <li>Use treated plywood or powder-coated metal for durability in humid environments.</li>
            </ul>
          </Section>

          <div className="mt-8 pt-4 border-t border-neutral-200 text-center text-xs text-neutral-400">
            Generated by Foldable Study Desk Assistant · Engineering Design Tool
          </div>
        </div>
      </Card>

      <div className="no-print mt-6 flex justify-end">
        <Button onClick={() => navigate({ name: "cost" })}>
          View Cost Analysis <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2 mb-3">
        <span className="text-primary-600">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Tr({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="py-2 px-3 border border-neutral-200 text-neutral-600 w-1/2">{k}</td>
      <td className="py-2 px-3 border border-neutral-200 font-medium text-neutral-900">{v}</td>
    </tr>
  );
}
