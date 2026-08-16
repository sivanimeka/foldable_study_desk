import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { DesignConfig, MATERIAL_INFO, FINISH_INFO } from "../types";

// Scale: 1 unit = 1 cm. We downscale for scene.
const SCALE = 0.02;

interface DeskMeshProps {
  config: DesignConfig;
  folded: boolean;
}

function getMaterialColor(config: DesignConfig): string {
  const mat = MATERIAL_INFO[config.material];
  const finish = FINISH_INFO[config.finish];
  if (config.material === "steel") return "#4b5563";
  if (config.material === "aluminium") return "#9ca3af";
  return finish.tint || mat.tone;
}

function getMaterialProps(material: DesignConfig["material"]) {
  if (material === "steel") {
    return { metalness: 0.85, roughness: 0.35 };
  }
  if (material === "aluminium") {
    return { metalness: 0.7, roughness: 0.45 };
  }
  return { metalness: 0.05, roughness: 0.6 };
}

function DeskPart({
  position,
  size,
  color,
  materialProps,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  materialProps: { metalness: number; roughness: number };
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={materialProps.metalness} roughness={materialProps.roughness} />
    </mesh>
  );
}

function DeskModel({ config, folded }: DeskMeshProps) {
  const group = useRef<THREE.Group>(null);
  const tabletopRef = useRef<THREE.Group>(null);
  const legsRef = useRef<THREE.Group>(null);

  const { width, depth, height, foldedDepth, tabletopThickness } = config.dimensions;
  const { shelves, drawers, sideStorage, bookCompartment, laptopCompartment } = config.storage;

  const color = getMaterialColor(config);
  const matProps = getMaterialProps(config.material);
  const frameColor = config.material === "steel" || config.material === "aluminium" ? color : "#3a3a3a";

  // Animation factor 0 = unfolded, 1 = folded
  const targetFold = useRef(0);
  const currentFold = useRef(0);

  useEffect(() => {
    targetFold.current = folded ? 1 : 0;
  }, [folded]);

  useFrame((_, delta) => {
    const t = Math.min(delta * 3, 1);
    currentFold.current += (targetFold.current - currentFold.current) * t;
    const f = currentFold.current;

    // Fold animation: rotate tabletop down and pull legs inward
    if (tabletopRef.current) {
      // Tabletop tilts down toward back
      tabletopRef.current.rotation.x = -f * (Math.PI / 2 - 0.15);
      // Move tabletop back as it folds
      tabletopRef.current.position.z = ((depth - foldedDepth) / 2) * SCALE * f;
      tabletopRef.current.position.y = height * SCALE - (height * SCALE * 0.5) * f;
    }
    if (legsRef.current) {
      // Legs swing backward/upward
      legsRef.current.rotation.x = f * (Math.PI / 2.2);
    }
  });

  const w = width * SCALE;
  const d = depth * SCALE;
  const h = height * SCALE;
  const t = tabletopThickness * SCALE;
  const legW = 0.04;
  const legH = (height - tabletopThickness) * SCALE;

  // Shelves positioned on back/side
  const shelfPositions = useMemo(() => {
    const arr: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    const shelfSpacing = (height - tabletopThickness - 10) / Math.max(shelves, 1);
    for (let i = 0; i < shelves; i++) {
      const y = (tabletopThickness + 8 + shelfSpacing * (i + 0.5)) * SCALE;
      arr.push({
        pos: [0, y, -(depth / 2 - 4) * SCALE],
        size: [w * 0.92, 0.03, d * 0.3],
      });
    }
    return arr;
  }, [shelves, w, d, height, tabletopThickness]);

  // Drawers as boxes under tabletop on right side
  const drawerPositions = useMemo(() => {
    const arr: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    const drawerH = 0.1;
    const drawerW = w * 0.28;
    for (let i = 0; i < drawers; i++) {
      const y = (height - tabletopThickness - 5 - i * 12) * SCALE;
      arr.push({
        pos: [(w / 2 - drawerW / 2 - 0.02), y, 0],
        size: [drawerW, drawerH, d * 0.7],
      });
    }
    return arr;
  }, [drawers, w, d, height, tabletopThickness]);

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Legs / support structure */}
      <group ref={legsRef}>
        {/* Front legs */}
        <DeskPart position={[-w / 2 + legW, legH / 2, d / 2 - legW]} size={[legW, legH, legW]} color={frameColor} materialProps={matProps} />
        <DeskPart position={[w / 2 - legW, legH / 2, d / 2 - legW]} size={[legW, legH, legW]} color={frameColor} materialProps={matProps} />
        {/* Back legs */}
        <DeskPart position={[-w / 2 + legW, legH / 2, -d / 2 + legW]} size={[legW, legH, legW]} color={frameColor} materialProps={matProps} />
        <DeskPart position={[w / 2 - legW, legH / 2, -d / 2 + legW]} size={[legW, legH, legW]} color={frameColor} materialProps={matProps} />
        {/* Cross supports */}
        <DeskPart position={[0, 0.04, d / 2 - legW]} size={[w - legW * 2, 0.04, 0.03]} color={frameColor} materialProps={matProps} />
        <DeskPart position={[0, 0.04, -d / 2 + legW]} size={[w - legW * 2, 0.04, 0.03]} color={frameColor} materialProps={matProps} />
      </group>

      {/* Tabletop group (folds) */}
      <group ref={tabletopRef} position={[0, h, 0]}>
        <DeskPart position={[0, 0, 0]} size={[w, t, d]} color={color} materialProps={matProps} />

        {/* Hinge representation on back edge */}
        <mesh position={[0, -t / 2 - 0.01, -d / 2 + 0.01]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, w * 0.9, 12]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Shelves (fixed to back legs) */}
      {shelfPositions.map((s, i) => (
        <DeskPart key={`shelf-${i}`} position={s.pos} size={s.size} color={color} materialProps={matProps} />
      ))}

      {/* Side storage panel */}
      {sideStorage && (
        <DeskPart
          position={[-w / 2 + 0.02, h * 0.45, 0]}
          size={[0.03, h * 0.8, d * 0.7]}
          color={color}
          materialProps={matProps}
        />
      )}

      {/* Book compartment divider */}
      {bookCompartment && (
        <DeskPart
          position={[-w * 0.2, h * 0.55, -d / 2 + 0.08]}
          size={[0.02, h * 0.5, 0.2]}
          color={color}
          materialProps={matProps}
        />
      )}

      {/* Laptop compartment (raised back ledge) */}
      {laptopCompartment && (
        <DeskPart
          position={[w * 0.15, h + t / 2 + 0.04, -d / 2 + 0.08]}
          size={[w * 0.45, 0.08, 0.04]}
          color={color}
          materialProps={matProps}
        />
      )}

      {/* Drawers */}
      {drawerPositions.map((dr, i) => (
        <group key={`drawer-${i}`}>
          <DeskPart position={dr.pos} size={dr.size} color={color} materialProps={matProps} />
          {/* Drawer handle */}
          <mesh position={[dr.pos[0], dr.pos[1], dr.pos[2] + dr.size[2] / 2 + 0.005]} castShadow>
            <boxGeometry args={[dr.size[0] * 0.4, 0.012, 0.012]} />
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Cable management grommet */}
      {config.storage.cableManagement && (
        <mesh position={[w * 0.3, h + t / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.015, 0.025, 16]} />
          <meshStandardMaterial color="#222" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function DimensionLabel({ position, text, rotation = [0, 0, 0] }: { position: [number, number, number]; text: string; rotation?: [number, number, number] }) {
  return (
    <Html position={position} rotation={rotation} center distanceFactor={6} occlude={false}>
      <div className="px-2 py-1 rounded-md bg-primary-600 text-white text-xs font-semibold whitespace-nowrap select-none pointer-events-none shadow-md">
        {text}
      </div>
    </Html>
  );
}

interface CameraRigProps {
  view: "free" | "front" | "side" | "top";
  resetKey: number;
}

function CameraRig({ view, resetKey }: CameraRigProps) {
  const { camera, controls } = useThree() as any;

  useEffect(() => {
    if (!camera) return;
    let pos: [number, number, number] = [2.2, 1.8, 3.2];
    if (view === "front") pos = [0, 1.0, 3.2];
    if (view === "side") pos = [3.5, 1.0, 0];
    if (view === "top") pos = [0, 3.5, 0.01];
    camera.position.set(...pos);
    if (controls?.target) {
      controls.target.set(0, 0.7, 0);
      controls.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, resetKey]);

  return null;
}

export default function Desk3DScene({
  config,
  folded,
  view,
  resetKey,
  showDimensions,
}: {
  config: DesignConfig;
  folded: boolean;
  view: "free" | "front" | "side" | "top";
  resetKey: number;
  showDimensions: boolean;
}) {
  const { width, depth, height } = config.dimensions;
  const w = width * SCALE;
  const d = depth * SCALE;
  const h = height * SCALE;

  return (
    <Canvas shadows camera={{ position: [2.2, 1.8, 3.2], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />

      <CameraRig view={view} resetKey={resetKey} />

      <DeskModel config={config} folded={folded} />

      {showDimensions && !folded && (
        <>
          <DimensionLabel position={[0, h + 0.25, d / 2]} text={`W: ${width} cm`} />
          <DimensionLabel position={[-w / 2 - 0.15, h / 2, 0]} text={`H: ${height} cm`} rotation={[0, 0, 0]} />
          <DimensionLabel position={[0, -0.05, d / 2 + 0.15]} text={`D: ${depth} cm`} />
        </>
      )}

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={6} blur={2.4} far={4} />
      <Grid
        position={[0, -0.001, 0]}
        args={[8, 8]}
        cellSize={0.2}
        cellThickness={0.6}
        cellColor="#cbd5e1"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={10}
        fadeStrength={1}
        infiniteGrid
      />
      <Environment preset="apartment" />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={1.2}
        maxDistance={8}
        target={[0, 0.7, 0]}
      />
    </Canvas>
  );
}
