# Foldable Study Desk Assistant

A smart desk-design platform where users can design and customize a foldable study desk based on their available space, dimensions, storage requirements, material preferences, and budget — with an interactive 3D preview, fold/unfold animation, cost estimation in Indian Rupees (₹), and professional report generation.

## Features

- **Login / Sign up** — Local browser-based authentication with a polished split-screen login page.
- **Landing Page** — Hero section, feature cards, and a live 3D desk preview.
- **Design Assistant** — 7-step wizard: Requirements → Dimensions → Materials → Storage → Budget → 3D Preview → Final Design.
- **Interactive 3D Preview** — Built with React Three Fiber / Three.js. Rotate, zoom, pan, reset camera, front/side/top views, **fold & unfold animation**, live dimension labels, and material-based appearance.
- **Smart Recommendation** — Generates a recommended configuration based on your inputs.
- **Cost Calculator** — Breaks down material, storage, folding mechanism, and additional component costs in INR.
- **Dashboard** — Total designs, saved designs, latest design, average cost, and recent designs with view/edit/delete actions.
- **My Designs** — Save, edit, view, and delete designs (persisted in browser local storage).
- **Reports** — Professional printable / downloadable design report.
- **About** — Project background, problem, solution, benefits, and engineering concepts.
- **Responsive** — Works on desktop, tablet, and mobile with touch-friendly 3D controls.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Three.js / React Three Fiber / Drei
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

Then open the URL shown in the terminal (typically http://localhost:5173).

## How to Use

1. **Sign in / Sign up** on the login page (stored locally in your browser).
2. Click **Create New Design** or **Start Designing**.
3. Walk through the 7-step wizard — enter requirements, adjust dimensions, pick materials & finishes, customize storage, set a budget.
4. View the **3D Preview** — rotate, zoom, fold/unfold the desk, switch camera views.
5. Check the **Cost Analysis** page for the full cost breakdown.
6. **Save** your design and find it under **My Designs** or the **Dashboard**.
7. Generate a **Report** — print or download it.

## Notes

- Authentication and saved designs use browser **local storage** so the app works without any backend. The architecture is structured to make it easy to connect a real database later.
- All costs are estimates in Indian Rupees (₹) and may vary based on actual material and manufacturing prices.
- The 3D model is built from procedural geometry (no external 3D model files).

## Project Structure

```
src/
  App.tsx                  # App shell, routing, auth gate, context
  main.tsx                 # Entry point
  types.ts                 # Shared types & constants
  lib/
    designEngine.ts        # Cost calculation, recommendations, helpers
    storage.ts             # Local storage persistence for designs
  components/
    Sidebar.tsx            # Navigation sidebar
    TopBar.tsx             # Top bar with account menu
    Desk3DScene.tsx        # 3D desk model + scene (R3F)
    Toast.tsx              # Toast notifications
    ConfirmDialog.tsx      # Confirmation dialog
    ui.tsx                 # Reusable UI primitives (Button, Card, etc.)
  pages/
    LoginPage.tsx          # Login / Sign up page
    LandingPage.tsx        # Landing / marketing page
    Dashboard.tsx          # Dashboard with stats & recent designs
    DesignAssistant.tsx    # 7-step design wizard
    Preview3D.tsx          # Interactive 3D preview with fold/unfold
    MyDesigns.tsx          # Saved designs list
    CostAnalysis.tsx       # Cost breakdown & budget status
    Reports.tsx            # Printable / downloadable report
    About.tsx              # About page
```

## License

This project is an engineering project demo. Use it freely for educational and presentation purposes.
