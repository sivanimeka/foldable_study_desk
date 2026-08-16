import { useApp } from "../App";
import { Button, Card, EmptyState, Badge } from "../components/ui";
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  Wallet,
  Plus,
  Eye,
  Edit2,
  FileText,
  Calculator,
} from "lucide-react";
import { formatINR } from "../lib/designEngine";
import { MATERIAL_INFO } from "../types";

export default function Dashboard() {
  const { savedDesigns, navigate, loadDesign, startNewDesign } = useApp();

  const total = savedDesigns.length;
  const avgCost = total > 0 ? savedDesigns.reduce((s, d) => s + d.estimatedCost, 0) / total : 0;
  const latest = savedDesigns[0];

  const stats = [
    { label: "Total Designs", value: `${total}`, icon: LayoutDashboard, color: "text-primary-600", bg: "bg-primary-50" },
    { label: "Saved Designs", value: `${savedDesigns.filter((d) => d.status === "saved").length}`, icon: FolderOpen, color: "text-success-600", bg: "bg-success-500/10" },
    { label: "Latest Design", value: latest ? latest.name : "—", icon: Clock, color: "text-warning-600", bg: "bg-warning-500/10" },
    { label: "Avg. Estimated Cost", value: total > 0 ? formatINR(avgCost) : "—", icon: Wallet, color: "text-accent-600", bg: "bg-accent-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <LayoutDashboard size={22} className="text-primary-600" /> Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Overview of your desk designs and activity.</p>
        </div>
        <Button onClick={startNewDesign}>
          <Plus size={16} /> New Design
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-xs text-neutral-500">{s.label}</p>
              <p className="font-bold text-neutral-900 text-lg mt-0.5 truncate">{s.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent designs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-900">Recent Designs</h2>
        {total > 0 && (
          <Button variant="ghost" size="sm" onClick={() => navigate({ name: "designs" })}>
            View all
          </Button>
        )}
      </div>

      {total === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No designs yet"
            message="Start your first foldable desk design and it will appear here with cost, dimensions and quick actions."
            action={<Button onClick={startNewDesign}><Plus size={16} /> Create New Design</Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedDesigns.slice(0, 6).map((d) => (
            <Card key={d.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-neutral-900 truncate">{d.name}</h3>
                <Badge color={d.status === "saved" ? "success" : "neutral"}>{d.status}</Badge>
              </div>
              <div className="text-sm text-neutral-600 space-y-1 mb-4 flex-1">
                <p>{d.dimensions.width}×{d.dimensions.depth}×{d.dimensions.height} cm</p>
                <p>{MATERIAL_INFO[d.material].label}</p>
                <p className="text-neutral-500 text-xs">
                  {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <span className="font-bold text-primary-700">{formatINR(d.estimatedCost)}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { loadDesign(d.id); navigate({ name: "preview", designId: d.id }); }} title="View"><Eye size={15} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { loadDesign(d.id); navigate({ name: "design", designId: d.id }); }} title="Edit"><Edit2 size={15} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { loadDesign(d.id); navigate({ name: "cost", designId: d.id }); }} title="Cost"><Calculator size={15} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { loadDesign(d.id); navigate({ name: "reports", designId: d.id }); }} title="Report"><FileText size={15} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
