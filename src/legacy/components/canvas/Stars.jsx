import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import CanvasBoundary from "./CanvasBoundary";
import { useLegacyReduced } from "../../motionPref";

const Stars = (props) => {
  const ref = useRef();
  const reduced = useLegacyReduced();
  const [sphere] = useState(() => random.inSphere(new Float32Array(39000), { radius: 1.5}));

  useFrame((state, delta) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color='#f272c8'
          size={0.0005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  const reduced = useLegacyReduced();
  return (
    <div className='w-full h-auto absolute inset-0 z-[-1]'>
      <CanvasBoundary>
        <Canvas camera={{ position: [0, 0, 1] }} frameloop={reduced ? "demand" : "always"}>
          <Suspense fallback={null}>
            <Stars />
          </Suspense>

          <Preload all />
        </Canvas>
      </CanvasBoundary>
    </div>
  );
};

export default StarsCanvas;
