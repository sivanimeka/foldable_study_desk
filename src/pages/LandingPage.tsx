import { useApp } from "../App";
import { Button, Card } from "../components/ui";
import {
  Ruler,
  Box,
  Maximize,
  Layers,
  Archive,
  Calculator,
  Lightbulb,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Desk3DScene from "../components/Desk3DScene";
import { createBlankDesign } from "../lib/designEngine";

const FEATURES = [
  { icon: Ruler, title: "Smart Desk Design", desc: "Define your requirements and get a desk tailored to your space and usage." },
  { icon: Box, title: "Interactive 3D Preview", desc: "Rotate, zoom and inspect your desk in real-time 3D before building it." },
  { icon: Maximize, title: "Space Optimization", desc: "Compact folding design that tucks away when not in use." },
  { icon: Layers, title: "Material Selection", desc: "Choose from plywood, HDF, solid wood, steel and aluminium finishes." },
  { icon: Archive, title: "Storage Customization", desc: "Add shelves, drawers and compartments to match your needs." },
  { icon: Calculator, title: "Cost Estimation", desc: "Instant estimated cost in Indian Rupees based on your configuration." },
  { icon: Lightbulb, title: "Design Recommendations", desc: "Smart suggestions tuned to your room, budget and storage needs." },
  { icon: FileText, title: "Report Generation", desc: "Download a professional design report ready for presentation." },
];

export default function LandingPage() {
  const { navigate, startNewDesign } = useApp();

  const demoDesign = createBlankDesign();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-5">
                <Sparkles size={14} /> Engineering Design Assistant
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight tracking-tight">
                Foldable Study Desk Assistant
              </h1>
              <p className="mt-3 text-xl text-primary-700 font-medium">
                Design Your Perfect Study Space — Smart, Compact &amp; Personalized.
              </p>
              <p className="mt-4 text-neutral-600 leading-relaxed max-w-xl">
                Design a personalized foldable study desk based on your space, requirements, storage
                needs, materials, and budget. Visualize your design in interactive 3D and estimate the
                cost instantly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={startNewDesign}>
                  Start Designing <ArrowRight size={18} />
                </Button>
                <Button size="lg" variant="outline" onClick={scrollToFeatures}>
                  Explore Features
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="overflow-hidden p-0">
                <div className="h-[380px] sm:h-[440px] w-full bg-neutral-100">
                  <Desk3DScene config={demoDesign} folded={false} view="free" resetKey={0} showDimensions />
                </div>
              </Card>
              <div className="absolute -bottom-4 -left-4 right-4 sm:right-auto sm:w-56 bg-white rounded-xl shadow-cardHover border border-neutral-200 p-4 hidden sm:block">
                <p className="text-xs text-neutral-500">Sample Configuration</p>
                <p className="font-semibold text-neutral-900 text-sm mt-0.5">
                  {demoDesign.dimensions.width}×{demoDesign.dimensions.depth}×{demoDesign.dimensions.height} cm
                </p>
                <p className="text-xs text-neutral-600 mt-1">Plywood · 2 Shelves · 1 Drawer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">Everything you need to design your desk</h2>
          <p className="mt-3 text-neutral-600">
            A complete toolkit combining furniture design, engineering estimation and interactive 3D
            visualization.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5 hover:shadow-cardHover transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-neutral-900">{f.title}</h3>
                <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold">Ready to design your foldable desk?</h2>
          <p className="mt-3 text-neutral-300 max-w-xl mx-auto">
            Start with your requirements, customize every dimension, preview it in 3D and get a
            professional report — all in minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={startNewDesign}>
              Start Designing <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-neutral-600 text-white hover:bg-neutral-800" onClick={() => navigate({ name: "about" })}>
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
