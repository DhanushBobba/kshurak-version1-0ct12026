import React, { useMemo, useRef, useState, useEffect, Suspense, Component, useCallback } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/* -----------------------------------------
   ERROR BOUNDARY (Prevents page crash if asset loading)
------------------------------------------ */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[BiometricHead] GLB model error / fallback active:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* -----------------------------------------
   BIOMETRIC POINT CLOUD (Step 1)
------------------------------------------ */

function BiometricPoints({
  model,
  groupRef,
}: {
  model: THREE.Object3D;
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const [data, setData] = React.useState<Float32Array | null>(null);
  const [lineData, setLineData] = React.useState<Float32Array | null>(null);

  useEffect(() => {
    if (!model || !groupRef.current) return;

    const group = groupRef.current;

    model.updateMatrixWorld(true);
    group.updateMatrixWorld(true);

    const points: number[] = [];

    const local = new THREE.Vector3();
    const world = new THREE.Vector3();

    model.traverse((mesh: any) => {
      if (!mesh.isMesh) return;

      // Don't sample eyes
      if (
        mesh.name === "eyeGroup2" ||
        mesh.name === "eyepolySurface1"
      ) {
        return;
      }

      if (!mesh.geometry) return;

      try {
        const sampler =
          new MeshSurfaceSampler(mesh).build();

        const count = 1500;

        for (let i = 0; i < count; i++) {
          sampler.sample(local);

          world
            .copy(local)
            .applyMatrix4(mesh.matrixWorld);

          group.worldToLocal(world);

          // Reduce points on lower neck
          if (world.y < -0.55) {
            continue;
          }

          points.push(
            world.x,
            world.y,
            world.z
          );
        }
      } catch (error) {
        console.warn(
          "Biometric sampling failed:",
          mesh.name,
          error
        );
      }
    });

    const pointArray =
      new Float32Array(points);

    setData(pointArray);

    // -----------------------------------
    // Create topology connections
    // -----------------------------------

    const positions: number[] = [];

    const totalPoints =
      points.length / 3;

    const maxDistance = 0.12;
    const maxConnections = 2;

    for (let i = 0; i < totalPoints; i++) {
      const ax = points[i * 3];
      const ay = points[i * 3 + 1];
      const az = points[i * 3 + 2];

      const neighbors: { index: number; distanceSq: number }[] = [];

      for (let j = 0; j < totalPoints; j++) {
        if (i === j) continue;

        const bx = points[j * 3];
        const by = points[j * 3 + 1];
        const bz = points[j * 3 + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;

        const distanceSq =
          dx * dx +
          dy * dy +
          dz * dz;

        if (
          distanceSq <=
          maxDistance * maxDistance
        ) {
          neighbors.push({
            index: j,
            distanceSq,
          });
        }
      }

      neighbors.sort(
        (a, b) =>
          a.distanceSq - b.distanceSq
      );

      for (
        let n = 0;
        n < Math.min(
          maxConnections,
          neighbors.length
        );
        n++
      ) {
        const j =
          neighbors[n].index;

        // Prevent duplicate lines
        if (j <= i) continue;

        positions.push(
          ax,
          ay,
          az,

          points[j * 3],
          points[j * 3 + 1],
          points[j * 3 + 2]
        );
      }
    }

    console.log(
      "BIOMETRIC POINTS:",
      totalPoints
    );

    console.log(
      "TOPOLOGY LINE SEGMENTS:",
      positions.length / 6
    );

    setLineData(
      new Float32Array(positions)
    );
  }, [model, groupRef]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.PointsMaterial;

    const pulse =
      0.68 +
      Math.sin(state.clock.elapsedTime * 2.2) * 0.12;

    material.opacity = pulse;
  });

  if (!data) return null;

  return (
    <group renderOrder={100}>

      {/* GOLD BIOMETRIC NODES */}
      <points
        ref={pointsRef}
        frustumCulled={false}
        renderOrder={101}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#d4a72c"
          size={0.008}
          sizeAttenuation
          transparent
          opacity={0.72}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* GOLD TOPOLOGY */}
      {lineData && (
        <lineSegments
          frustumCulled={false}
          renderOrder={100}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[lineData, 3]}
            />
          </bufferGeometry>

          <lineBasicMaterial
            color="#c99b28"
            transparent
            opacity={0.10}
            depthWrite={false}
            depthTest={true}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}

    </group>
  );
}

/* -----------------------------------------
   FACIAL LANDMARKS (Surface-Snapped)
------------------------------------------ */

function FacialLandmarks({
  model,
  groupRef,
}: {
  model: THREE.Object3D;
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const [landmarkData, setLandmarkData] = React.useState<
    Array<{ name: string; position: THREE.Vector3 }> | null
  >(null);

  useEffect(() => {
    if (!model || !groupRef.current) return;

    model.updateMatrixWorld(true);
    groupRef.current.updateMatrixWorld(true);

    const headMesh: THREE.Mesh[] = [];

    model.traverse((child: any) => {
      if (!child.isMesh) return;

      if (
        child.name === "eyeGroup2" ||
        child.name === "eyepolySurface1"
      ) {
        return;
      }

      if (child.name === "HEAD_LOW2Group32586") {
        headMesh.push(child);
      }
    });

    if (!headMesh.length) {
      console.warn("Facial landmark head mesh not found");
      return;
    }

    /*
     * Current normalized head:
     *
     * width  ≈ 1.675
     * height = 2.4
     * depth  ≈ 1.713
     *
     * These are TARGET REGIONS.
     * We don't directly use these positions.
     * Instead, we find the nearest real surface
     * vertex from the FBX.
     */

    const targets = [
      // Eyebrows
      { name: "left-brow-inner",  x: -0.18, y: 0.47, z: 0.70 },
      { name: "left-brow-outer",  x: -0.38, y: 0.43, z: 0.60 },

      { name: "right-brow-inner", x:  0.18, y: 0.47, z: 0.70 },
      { name: "right-brow-outer", x:  0.38, y: 0.43, z: 0.60 },

      // Eyes
      { name: "left-eye-inner",   x: -0.15, y: 0.33, z: 0.73 },
      { name: "left-eye-outer",   x: -0.37, y: 0.33, z: 0.64 },

      { name: "right-eye-inner",  x:  0.15, y: 0.33, z: 0.73 },
      { name: "right-eye-outer",  x:  0.37, y: 0.33, z: 0.64 },

      // Nose
      { name: "nose-bridge",      x:  0.00, y: 0.31, z: 0.78 },
      { name: "nose-tip",         x:  0.00, y: 0.04, z: 0.88 },

      // Cheeks
      { name: "left-cheek",       x: -0.39, y: 0.08, z: 0.67 },
      { name: "right-cheek",      x:  0.39, y: 0.08, z: 0.67 },

      // Mouth
      { name: "left-mouth",       x: -0.22, y: -0.15, z: 0.77 },
      { name: "mouth-center",     x:  0.00, y: -0.13, z: 0.84 },
      { name: "right-mouth",      x:  0.22, y: -0.15, z: 0.77 },

      // Chin
      { name: "chin",             x:  0.00, y: -0.39, z: 0.69 },

      // Jaw
      { name: "left-jaw",         x: -0.40, y: -0.28, z: 0.48 },
      { name: "right-jaw",        x:  0.40, y: -0.28, z: 0.48 },
    ];

    const vertices: THREE.Vector3[] = [];

    headMesh.forEach((mesh) => {
      const position =
        mesh.geometry.attributes.position;

      if (!position) return;

      const vertex = new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);

        vertex.applyMatrix4(mesh.matrixWorld);

        groupRef.current?.worldToLocal(vertex);

        vertices.push(vertex.clone());
      }
    });

    if (!vertices.length) return;

    const result: Array<{ name: string; position: THREE.Vector3 }> = [];

    targets.forEach((target) => {
      const targetPosition =
        new THREE.Vector3(
          target.x,
          target.y,
          target.z
        );

      let closest: THREE.Vector3 | null = null;
      let closestDistance = Infinity;

      vertices.forEach((vertex) => {
        const distance =
          vertex.distanceToSquared(targetPosition);

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = vertex;
        }
      });

      if (closest) {
        result.push({
          name: target.name,
          position: (closest as THREE.Vector3).clone(),
        });
      }
    });

    console.log(
      "FACIAL LANDMARKS:",
      result.length
    );

    setLandmarkData(result);
  }, [model, groupRef]);

  if (!landmarkData) return null;

  const points = new Float32Array(
    landmarkData.flatMap((item) => [
      item.position.x,
      item.position.y,
      item.position.z,
    ])
  );

  const connectionNames = [
    // Eyebrow contours
    ["left-brow-inner", "left-brow-outer"],
    ["right-brow-inner", "right-brow-outer"],

    // Left eye
    ["left-eye-inner", "left-eye-outer"],

    // Right eye
    ["right-eye-inner", "right-eye-outer"],

    // Eye → nose bridge
    ["left-eye-inner", "nose-bridge"],
    ["right-eye-inner", "nose-bridge"],

    // Nose
    ["nose-bridge", "nose-tip"],

    // Mouth
    ["left-mouth", "mouth-center"],
    ["mouth-center", "right-mouth"],

    // Mouth → cheeks
    ["left-cheek", "left-mouth"],
    ["right-cheek", "right-mouth"],

    // Jaw
    ["left-cheek", "left-jaw"],
    ["left-jaw", "chin"],
    ["chin", "right-jaw"],
    ["right-jaw", "right-cheek"],
  ];

  const landmarkMap = new Map(
    landmarkData.map((item) => [
      item.name,
      item.position,
    ])
  );

  const linePositions: number[] = [];

  connectionNames.forEach(([a, b]) => {
    const first = landmarkMap.get(a);
    const second = landmarkMap.get(b);

    if (!first || !second) return;

    linePositions.push(
      first.x,
      first.y,
      first.z,

      second.x,
      second.y,
      second.z
    );
  });

  return (
    <group renderOrder={120}>

      {/* LANDMARK NODES */}
      <points
        frustumCulled={false}
        renderOrder={121}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[points, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#f2c94c"
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* LANDMARK CONNECTIONS */}
      <lineSegments
        frustumCulled={false}
        renderOrder={120}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(linePositions),
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          color="#e0b63c"
          transparent
          opacity={0.38}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

    </group>
  );
}

/* -----------------------------------------
   VIEW ROTATIONS & LIMITS (Step 5)
------------------------------------------ */

const VIEW_ROTATIONS: Record<string, { x: number; y: number }> = {
  front: {
    x: 0,
    y: 0,
  },
  threeQuarter: {
    x: 0,
    y: THREE.MathUtils.degToRad(35),
  },
  "3/4": {
    x: 0,
    y: THREE.MathUtils.degToRad(35),
  },
  side: {
    x: 0,
    y: THREE.MathUtils.degToRad(90),
  },
  top: {
    x: THREE.MathUtils.degToRad(-20),
    y: 0,
  },
};

const HORIZONTAL_LIMIT = THREE.MathUtils.degToRad(100);
const VERTICAL_LIMIT = THREE.MathUtils.degToRad(30);

/* -----------------------------------------
   MALE HEAD (FBX Model)
------------------------------------------ */

function MaleHead({
  targetRotation,
}: {
  targetRotation: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const headGroup = useRef<THREE.Group>(null);
  const [headReady, setHeadReady] = useState(false);

  const model = useLoader(
    FBXLoader,
    "/models/male-head/head.fbx"
  );

  const baseColor = useLoader(
    THREE.TextureLoader,
    "/models/male-head/head_Base_Color.png"
  );

  const normalMap = useLoader(
    THREE.TextureLoader,
    "/models/male-head/head_Normal_DirectX.png"
  );

  const roughnessMap = useLoader(
    THREE.TextureLoader,
    "/models/male-head/head_Roughness.png"
  );

  const aoMap = useLoader(
    THREE.TextureLoader,
    "/models/male-head/head_Mixed_AO.png"
  );

  useEffect(() => {
    baseColor.colorSpace = THREE.SRGBColorSpace;
    baseColor.flipY = false;
    baseColor.needsUpdate = true;

    normalMap.colorSpace = THREE.NoColorSpace;
    normalMap.flipY = false;
    normalMap.needsUpdate = true;

    roughnessMap.colorSpace = THREE.NoColorSpace;
    roughnessMap.flipY = false;
    roughnessMap.needsUpdate = true;

    aoMap.colorSpace = THREE.NoColorSpace;
    aoMap.flipY = false;
    aoMap.needsUpdate = true;

    console.log("===== FBX MODEL =====");
    console.log(model);

    model.traverse((child: any) => {
      if (!child.isMesh) return;

      console.log("VISIBLE MESH:", child.name);
      console.log(
        "AO UV1:",
        !!child.geometry?.attributes?.uv1
      );

      child.visible = true;
      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;

      const name = (child.name || "").toLowerCase();

      if (name.includes("head")) {
        const geometry = child.geometry;

        // Create UV1 for AO
        if (
          geometry?.attributes?.uv &&
          !geometry?.attributes?.uv1
        ) {
          geometry.setAttribute(
            "uv1",
            geometry.attributes.uv.clone()
          );

          console.log("Created AO UV1:", child.name);
        }

        child.material = new THREE.MeshStandardMaterial({
          map: baseColor,
          normalMap: normalMap,
          roughnessMap: roughnessMap,

          aoMap: aoMap,
          aoMapIntensity: 0.55,

          color: 0xffffff,

          roughness: 0.98,
          metalness: 0,

          side: THREE.DoubleSide,
        });

        console.log(
          "BASE COLOR, NORMAL, ROUGHNESS & AO APPLIED:",
          child.name
        );
      }
    });

    // Get the actual model bounds
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log("SIZE:", size);
    console.log("CENTER:", center);

    // Normalize the model
    const maxSize = Math.max(
      size.x,
      size.y,
      size.z
    );

    if (maxSize > 0) {
      const scale = 2.58 / maxSize;

      model.scale.setScalar(scale);

      model.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
    }

    model.updateMatrixWorld(true);
    setHeadReady(true);
  }, [model, baseColor, normalMap, roughnessMap, aoMap]);

  useFrame((_state, delta) => {
    if (!headGroup.current) return;

    const group = headGroup.current;

    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      targetRotation.current.x,
      1 - Math.pow(0.001, delta)
    );

    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      targetRotation.current.y,
      1 - Math.pow(0.001, delta)
    );

    group.rotation.y = THREE.MathUtils.clamp(
      group.rotation.y,
      -HORIZONTAL_LIMIT,
      HORIZONTAL_LIMIT
    );

    group.rotation.x = THREE.MathUtils.clamp(
      group.rotation.x,
      -VERTICAL_LIMIT,
      VERTICAL_LIMIT
    );
  });

  return (
    <group ref={headGroup}>
      <primitive
        object={model}
        visible={true}
      />

      {headReady && (
        <MaleHair headModel={model} />
      )}

      {headReady && (
        <BiometricPoints
          model={model}
          groupRef={headGroup}
        />
      )}

      {headReady && (
        <FacialLandmarks
          model={model}
          groupRef={headGroup}
        />
      )}

      <BiometricRings />
    </group>
  );
}

/* -----------------------------------------
   BIOMETRIC ORBITAL RINGS (Refined 4-Plane Shell)
------------------------------------------ */

function BiometricRings() {
  const orbitGroup = useRef<THREE.Group>(null);

  const orbitConfigs = useMemo(
    () => [
      {
        radiusX: 1.02,
        radiusY: 1.32,
        rotation: [0.0, 0.0, 0.0],
        start: 0.05,
        arc: Math.PI * 1.55,
        opacity: 0.22,
      },

      {
        radiusX: 1.16,
        radiusY: 1.18,
        rotation: [0.42, 0.28, 0.28],
        start: 0.75,
        arc: Math.PI * 1.25,
        opacity: 0.16,
      },

      {
        radiusX: 1.10,
        radiusY: 1.38,
        rotation: [-0.35, 0.52, -0.22],
        start: 2.1,
        arc: Math.PI * 1.15,
        opacity: 0.14,
      },

      {
        radiusX: 1.30,
        radiusY: 0.90,
        rotation: [0.58, -0.32, 0.42],
        start: 3.0,
        arc: Math.PI * 1.05,
        opacity: 0.12,
      },
    ],
    []
  );

  const createOrbit = useCallback(
    (config: {
      radiusX: number;
      radiusY: number;
      rotation: number[];
      start: number;
      arc: number;
      opacity: number;
    }) => {
      const points: number[] = [];
      const segments = 180;

      const euler = new THREE.Euler(
        config.rotation[0],
        config.rotation[1],
        config.rotation[2]
      );

      const vector = new THREE.Vector3();

      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;

        const angle =
          config.start +
          progress * config.arc;

        vector.set(
          Math.cos(angle) * config.radiusX,
          Math.sin(angle) * config.radiusY,
          0
        );

        vector.applyEuler(euler);

        points.push(
          vector.x,
          vector.y,
          vector.z
        );
      }

      return new Float32Array(points);
    },
    []
  );

  const orbitData = useMemo(
    () =>
      orbitConfigs.map((config) =>
        createOrbit(config)
      ),
    [orbitConfigs, createOrbit]
  );

  /*
   * Small orbital dots
   */
  const orbitalDots = useMemo(() => {
    const dots: number[] = [];
    const nodes: number[] = [];

    orbitConfigs.forEach((config, orbitIndex) => {
      const euler = new THREE.Euler(
        config.rotation[0],
        config.rotation[1],
        config.rotation[2]
      );

      const vector = new THREE.Vector3();

      // Micro dots
      const dotCount = 34;

      for (let i = 0; i < dotCount; i++) {
        const progress = i / dotCount;

        const angle =
          config.start +
          progress * config.arc;

        vector.set(
          Math.cos(angle) * config.radiusX,
          Math.sin(angle) * config.radiusY,
          0
        );

        vector.applyEuler(euler);

        dots.push(
          vector.x,
          vector.y,
          vector.z
        );
      }

      // Larger nodes
      const nodeCount = orbitIndex % 2 === 0 ? 4 : 3;

      for (let i = 0; i < nodeCount; i++) {
        const progress = i / nodeCount;

        const angle =
          config.start +
          progress * config.arc;

        vector.set(
          Math.cos(angle) * config.radiusX,
          Math.sin(angle) * config.radiusY,
          0
        );

        vector.applyEuler(euler);

        nodes.push(
          vector.x,
          vector.y,
          vector.z
        );
      }
    });

    return {
      dots: new Float32Array(dots),
      nodes: new Float32Array(nodes),
    };
  }, [orbitConfigs]);

  useFrame((state, delta) => {
    if (!orbitGroup.current) return;

    orbitGroup.current.rotation.y +=
      delta * 0.012;

    orbitGroup.current.rotation.x =
      Math.sin(
        state.clock.elapsedTime * 0.10
      ) * 0.015;
  });

  return (
    <group
      ref={orbitGroup}
      scale={0.92}
      renderOrder={80}
    >

      {/* ========================= */}
      {/* ORBITAL ARCS */}
      {/* ========================= */}

      {orbitData.map((positions, index) => {
        const ThreeLine = "line" as any;
        return (
          <ThreeLine
            key={`orbit-${index}`}
            frustumCulled={false}
            renderOrder={80}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[positions, 3]}
              />
            </bufferGeometry>

            <lineBasicMaterial
              color="#cda52f"
              transparent
              opacity={
                orbitConfigs[index].opacity
              }
              depthWrite={false}
              depthTest={true}
              blending={THREE.AdditiveBlending}
            />
          </ThreeLine>
        );
      })}

      {/* ========================= */}
      {/* MICRO DOTS */}
      {/* ========================= */}

      <points
        frustumCulled={false}
        renderOrder={82}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              orbitalDots.dots,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#d5aa32"
          size={0.009}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========================= */}
      {/* ORBIT NODES */}
      {/* ========================= */}

      <points
        frustumCulled={false}
        renderOrder={84}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              orbitalDots.nodes,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#edc34b"
          size={0.023}
          sizeAttenuation
          transparent
          opacity={0.78}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

    </group>
  );
}

/* -----------------------------------------
   MALE HAIR (FBX Model)
------------------------------------------ */

function MaleHair({ headModel }: { headModel: THREE.Object3D }) {
  const hair = useLoader(
    FBXLoader,
    "/models/male-head/DummyHair.fbx"
  );

  useEffect(() => {
    if (!hair || !headModel) return;

    console.log("===== HAIR MODEL =====");
    console.log(hair);

    // ---------------------------------------
    // Prepare hair
    // ---------------------------------------
    hair.traverse((child: any) => {
      if (!child.isMesh) return;

      console.log("HAIR MESH:", child.name);

      if (child.name === "Dummy") {
        child.visible = false;
        return;
      }

      child.visible = true;
      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.name === "Hair") {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#15110f"),

          roughness: 0.62,
          metalness: 0.0,

          side: THREE.DoubleSide,

          transparent: false,
          opacity: 1,

          depthWrite: true,
          depthTest: true,
        });

        child.material.onBeforeCompile = (shader: any) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <output_fragment>",
            `
              float hairHighlight =
                pow(
                  max(dot(normalize(vNormal), normalize(vec3(0.25, 0.75, 0.6))), 0.0),
                  8.0
                );

              outgoingLight +=
                hairHighlight * vec3(0.08, 0.065, 0.05);

              #include <output_fragment>
            `
          );
        };

        child.material.needsUpdate = true;
      }
    });

    // ---------------------------------------
    // Reset transform
    // ---------------------------------------
    hair.position.set(0, 0, 0);
    hair.rotation.set(0, 0, 0);
    hair.scale.set(1, 1, 1);

    hair.updateMatrixWorld(true);
    headModel.updateMatrixWorld(true);

    // ---------------------------------------
    // HEAD BOUNDS
    // ---------------------------------------
    const headBox = new THREE.Box3().setFromObject(
      headModel
    );

    const headSize = headBox.getSize(
      new THREE.Vector3()
    );

    const headCenter = headBox.getCenter(
      new THREE.Vector3()
    );

    // ---------------------------------------
    // HAIR BOUNDS
    // ---------------------------------------
    const hairBox = new THREE.Box3();

    hair.traverse((child: any) => {
      if (!child.isMesh || !child.visible) return;

      hairBox.expandByObject(child);
    });

    const hairSize = hairBox.getSize(
      new THREE.Vector3()
    );

    console.log("HEAD:", headSize);
    console.log("HAIR:", hairSize);

    // ---------------------------------------
    // SCALE
    // ---------------------------------------
    const scale =
      (headSize.x / hairSize.x) * 0.84;

    hair.scale.setScalar(scale);

    hair.updateMatrixWorld(true);

    // ---------------------------------------
    // RECALCULATE HAIR BOUNDS
    // ---------------------------------------
    const scaledHairBox = new THREE.Box3();

    hair.traverse((child: any) => {
      if (!child.isMesh || !child.visible) return;

      scaledHairBox.expandByObject(child);
    });

    const scaledHairCenter =
      scaledHairBox.getCenter(
        new THREE.Vector3()
      );

    // ---------------------------------------
    // CENTER HAIR ON HEAD
    // ---------------------------------------
    hair.position.x +=
      headCenter.x - scaledHairCenter.x;

    hair.position.z +=
      headCenter.z - scaledHairCenter.z;

    // ---------------------------------------
    // MOVE HAIR DOWN
    // ---------------------------------------
    const headTop = headBox.max.y;

    const hairBottom =
      scaledHairBox.min.y;

    hair.position.y +=
      headTop - hairBottom - 0.12;

    hair.scale.y *= 0.55;

    // Final scalp alignment
    hair.position.y -= 0.68;

    // ---------------------------------------
    // FINAL
    // ---------------------------------------
    hair.updateMatrixWorld(true);

    console.log(
      "FINAL HAIR SCALE:",
      hair.scale.x
    );

    console.log(
      "FINAL HAIR POSITION:",
      hair.position
    );
  }, [hair, headModel]);

  return (
    <primitive
      object={hair}
      visible={true}
    />
  );
}

/* -----------------------------------------
   FALLBACK 3D HEAD MODEL
------------------------------------------ */

function FallbackHeadModel() {
  const fallbackMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.0, 48, 48);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      let x = v.x;
      let y = v.y;
      let z = v.z;
      let scaleY = 1.35;
      let scaleX = 0.98;
      let scaleZ = 1.2;
      if (z < 0) scaleZ = 1.28;
      if (y > 0.2 && y < 0.75 && z > 0) {
        if (y > 0.25 && y < 0.45) {
          const brow = Math.sin(((y - 0.25) / 0.2) * Math.PI);
          z += brow * 0.15;
        }
      }
      if (y > 0.05 && y < 0.28 && z > 0) {
        const eyeDist = Math.min(Math.hypot(x + 0.35, y - 0.16), Math.hypot(x - 0.35, y - 0.16));
        if (eyeDist < 0.25) z -= Math.cos((eyeDist / 0.25) * (Math.PI / 2)) * 0.18;
      }
      if (y > -0.25 && y < 0.28 && Math.abs(x) < 0.25 && z > 0) {
        z += Math.cos((Math.abs(x) / 0.25) * (Math.PI / 2)) * 0.28;
      }
      if (y < -0.35) {
        scaleX *= 0.85;
        if (y > -0.75 && y < -0.52 && Math.abs(x) < 0.28 && z > 0) {
          z += Math.sin(((y + 0.75) / 0.23) * Math.PI) * 0.22;
        }
      }
      pos.setXYZ(i, x * scaleX, y * scaleY, z * scaleZ);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      color: "#8a6f54",
      metalness: 0.1,
      roughness: 0.55,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "head_skin";
    return mesh;
  }, []);

  return (
    <group
      scale={1.5}
      position={[0, 0, 0]}
      rotation={[0, THREE.MathUtils.degToRad(-25), 0]}
    >
      <primitive object={fallbackMesh} />
    </group>
  );
}

/* -----------------------------------------
   3D SCENE
------------------------------------------ */

function BiometricScene({
  targetRotation,
}: {
  targetRotation: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <>
      <ambientLight intensity={2} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={3}
      />

      <ModelErrorBoundary fallback={<FallbackHeadModel />}>
        <Suspense fallback={<FallbackHeadModel />}>
          <MaleHead targetRotation={targetRotation} />
        </Suspense>
      </ModelErrorBoundary>
    </>
  );
}

/* -----------------------------------------
   MAIN COMPONENT
------------------------------------------ */

interface BiometricHeadProps {
  view?: string;
}

export default function BiometricHead({ view = "3/4" }: BiometricHeadProps) {
  const targetRotation = useRef<{ x: number; y: number }>({
    x: 0,
    y: THREE.MathUtils.degToRad(35),
  });

  const isDragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startRotation = useRef({ x: 0, y: 0 });

  // Update target rotation when preset view changes
  useEffect(() => {
    if (view && VIEW_ROTATIONS[view]) {
      const rot = VIEW_ROTATIONS[view];
      targetRotation.current = {
        x: rot.x,
        y: rot.y,
      };
    }
  }, [view]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startRotation.current = { ...targetRotation.current };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startPointer.current.x;
    const deltaY = e.clientY - startPointer.current.y;
    const sensitivity = 0.006;

    targetRotation.current = {
      x: THREE.MathUtils.clamp(
        startRotation.current.x + deltaY * sensitivity,
        -VERTICAL_LIMIT,
        VERTICAL_LIMIT
      ),
      y: THREE.MathUtils.clamp(
        startRotation.current.y + deltaX * sensitivity,
        -HORIZONTAL_LIMIT,
        HORIZONTAL_LIMIT
      ),
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div
      className="biometric-3d"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: "grab", touchAction: "none" }}
    >
      <Canvas
        camera={{
          position: [0, 0, 6],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <BiometricScene targetRotation={targetRotation} />
      </Canvas>
    </div>
  );
}
