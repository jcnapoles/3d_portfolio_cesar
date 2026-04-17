import React, { Suspense, useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, useTexture, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "../Loader";

// Distribute points evenly on a sphere using Fibonacci spiral
function fibonacciSphere(count, radius) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * radiusAtY * radius,
        y * radius,
        Math.sin(theta) * radiusAtY * radius
      )
    );
  }
  return points;
}

const TechBall = ({ position, imgUrl, name }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const [texture] = useTexture([imgUrl]);

  // Make texture render nicely on sphere
  texture.anisotropy = 16;

  // Each ball always faces the camera
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={hovered ? 0.7 : 0.55}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {hovered && (
        <Html
          center
          distanceFactor={8}
          position={[0, -1.1, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

const RotatingSphere = ({ technologies, isDragging }) => {
  const groupRef = useRef();

  const positions = useMemo(
    () => fibonacciSphere(technologies.length, 4.5),
    [technologies.length]
  );

  // Auto-rotate only when user is not dragging
  useFrame((_, delta) => {
    if (groupRef.current && !isDragging) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {technologies.map((tech, i) => (
        <TechBall
          key={tech.name}
          position={positions[i]}
          imgUrl={tech.icon}
          name={tech.name}
        />
      ))}
    </group>
  );
};

const TechSphereCanvas = ({ technologies }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="w-full h-[600px] md:h-[700px]">
      <Canvas
        frameloop="always"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.4} />
          <RotatingSphere
            technologies={technologies}
            isDragging={isDragging}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            onStart={() => setIsDragging(true)}
            onEnd={() => setIsDragging(false)}
          />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default TechSphereCanvas;
