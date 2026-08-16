import { useApp } from "../App";
import { Button, Card, EmptyState, Badge } from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  FolderOpen,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Ruler,
  Layers,
  Calendar,
} from "lucide-react";
import { formatINR } from "../lib/designEngine";
import { MATERIAL_INFO, FINISH_INFO } from "../types";
import { useState } from "react";

export default function MyDesigns() {
  const { savedDesigns, navigate, removeDesign, loadDesign, toast } = useApp();
  const [toDelete, setToDelete] = useState<string | null>(null);

  function handleEdit(id: string) {
    const d = loadDesign(id);
    if (d) {
      navigate({ name: "design", designId: id });
      toast("Design loaded into editor", "info");
    }
  }

  function handleView(id: string) {
    loadDesign(id);
    navigate({ name: "preview", designId: id });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <FolderOpen size={22} className="text-primary-600" /> My Designs
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">All your saved desk designs in one place.</p>
        </div>
        <Button onClick={() => navigate({ name: "design" })}>
          <Plus size={16} /> New Design
        </Button>
      </div>

      {savedDesigns.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen size={28} />}
            title="No designs yet"
            message="Create your first foldable desk design and save it here. It will appear in this list for easy editing and review."
            action={<Button onClick={() => navigate({ name: "design" })}><Plus size={16} /> Start a Design</Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedDesigns.map((d) => (
            <Card key={d.id} className="p-5 flex flex-col hover:shadow-cardHover transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate">{d.name}</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} />
                    {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge color={d.status === "saved" ? "success" : "neutral"}>
                  {d.status === "saved" ? "Saved" : "Draft"}
                </Badge>
              </div>

              <div className="space-y-1.5 text-sm mb-4 flex-1">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Ruler size={14} className="text-neutral-400" />
                  {d.dimensions.width}×{d.dimensions.depth}×{d.dimensions.height} cm
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Layers size={14} className="text-neutral-400" />
                  {MATERIAL_INFO[d.material].label} · {FINISH_INFO[d.finish].label}
                </div>
                <div className="text-neutral-600">
                  {d.storage.shelves} shelves · {d.storage.drawers} drawers
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <span className="font-bold text-primary-700">{formatINR(d.estimatedCost)}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleView(d.id)} title="View">
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(d.id)} title="Edit">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(d.id)} title="Delete" className="text-error-600 hover:bg-error-500/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this design?"
        message="This will permanently remove the design from your saved list. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) removeDesign(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
