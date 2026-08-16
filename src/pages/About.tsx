import { useApp } from "../App";
import { Card, SectionTitle } from "../components/ui";
import {
  Info,
  Target,
  Lightbulb,
  CheckCircle2,
  Maximize,
  Ruler,
  Layers,
  Calculator,
  Box,
  Users,
} from "lucide-react";

export default function About() {
  const benefits = [
    { icon: Maximize, title: "Space Efficient", desc: "Folds compactly to free up room space when not in use." },
    { icon: Ruler, title: "Customizable", desc: "Every dimension, material and storage option is adjustable." },
    { icon: Box, title: "Foldable", desc: "Practical folding mechanism represented in interactive 3D." },
    { icon: Calculator, title: "Cost Estimation", desc: "Instant estimated cost in Indian Rupees." },
    { icon: Box, title: "Interactive Visualization", desc: "Real-time 3D model that updates as you design." },
    { icon: Users, title: "Student Friendly", desc: "Designed for students and professionals in compact rooms." },
    { icon: Lightbulb, title: "Practical Assistance", desc: "Smart recommendations based on your inputs." },
    { icon: Layers, title: "Modular Storage", desc: "Add shelves, drawers and compartments as needed." },
  ];

  const engineering = [
    "Product Customization",
    "Dimensional Design",
    "Space Optimization",
    "Material Selection",
    "Cost Estimation",
    "Computer-Aided Visualization",
    "3D Modeling Concept",
    "User-Centered Design",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 animate-fade-in-up space-y-8">
      <SectionTitle
        title="About Foldable Study Desk Assistant"
        subtitle="What it is, why it exists and who it's for."
        icon={<Info size={22} />}
      />

      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 mb-2">What is it?</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">
          A smart design assistant that helps users create compact, customizable study desks suitable
          for limited spaces. It combines a step-by-step design wizard, an interactive 3D preview with
          fold/unfold animation, cost estimation in Indian Rupees and a professional report generator.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-error-600" />
            <h3 className="font-semibold text-neutral-900">Problem</h3>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Traditional study desks can occupy significant space and may not provide sufficient
            flexibility for students living in compact rooms. Fixed-size desks rarely fit individual
            needs or budgets.
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} className="text-warning-600" />
            <h3 className="font-semibold text-neutral-900">Solution</h3>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            The system allows users to customize dimensions, storage, materials and budget while
            visualizing the result through an interactive 3D model. A foldable design ensures the desk
            tucks away when not in use.
          </p>
        </Card>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-4">Benefits</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="p-5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <h4 className="font-medium text-neutral-900 text-sm">{b.title}</h4>
                <p className="text-xs text-neutral-500 mt-1">{b.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-success-600" />
          <h3 className="font-semibold text-neutral-900">Engineering Concepts Demonstrated</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {engineering.map((e) => (
            <span
              key={e}
              className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium"
            >
              {e}
            </span>
          ))}
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed mt-4">
          The system assists in the desk-design process by guiding a user from raw requirements to a
          concrete, costed, visualized design — demonstrating product customization, dimensional
          design, space optimization, material selection, cost estimation and computer-aided 3D
          visualization in a single workflow.
        </p>
      </Card>
    </div>
  );
}
