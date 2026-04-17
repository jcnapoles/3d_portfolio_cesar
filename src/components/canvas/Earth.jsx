import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";

const Atmosphere = () => {
  const meshRef = useRef();
  const { camera } = useThree();

  const atmosphereShader = React.useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(0x3a7bd5) },
      viewVector: { value: new THREE.Vector3() },
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float vIntensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        vIntensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float time;
      varying float vIntensity;
      void main() {
        float pulse = 0.92 + 0.08 * sin(time * 0.6);
        vec3 glow = glowColor * vIntensity * pulse;
        gl_FragColor = vec4(glow, vIntensity * 0.35 * pulse);
      }
    `,
  }), []);

  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime();
      meshRef.current.material.uniforms.viewVector.value.copy(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} scale={2.65}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        attach="material"
        uniforms={atmosphereShader.uniforms}
        vertexShader={atmosphereShader.vertexShader}
        fragmentShader={atmosphereShader.fragmentShader}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const Earth = () => {
  const earth = useGLTF("./planet/scene.gltf");
  const earthTexture = useTexture("./planet/textures/Planet_baseColor_real.jpg");
  const earthRef = useRef();

  useEffect(() => {
    // Configure the real Earth texture
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 16;
    earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    earthTexture.generateMipmaps = true;
    earthTexture.needsUpdate = true;

    earth.scene.traverse((child) => {
      if (child.isMesh) {
        const oldMat = child.material;
        if (oldMat.name === "Clouds") {
          // Hide the clouds mesh - its texture creates stripe artifacts
          child.visible = false;
        } else if (oldMat.name === "Planet") {
          const newMat = new THREE.MeshPhysicalMaterial({
            map: earthTexture,
            roughness: 0.85,
            metalness: 0.0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.5,
          });
          child.material = newMat;
        }
      }
    });
  }, [earth.scene, earthTexture]);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <primitive
      ref={earthRef}
      object={earth.scene}
      scale={2.5}
      position-y={0}
      rotation-y={0}
    />
  );
};

const EarthCanvas = () => {
  return (
    <Canvas
      shadows
      frameloop='always'
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 3, 6],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.2}
          color="#ffffff"
        />
        <directionalLight
          position={[-3, -1, -4]}
          intensity={0.2}
          color="#4a7acc"
        />

        <OrbitControls
          autoRotate
          autoRotateSpeed={1.2}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />

        <Atmosphere />
        <Earth />

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
