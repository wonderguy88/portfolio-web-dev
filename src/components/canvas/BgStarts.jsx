import React from "react";
import * as THREE from "three";
import { useState, useRef, Suspense, useMemo } from "react";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import {
  Reflector,
  CameraShake,
  OrbitControls,
  useTexture,
} from "@react-three/drei";
import { KernelSize } from "postprocessing";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import FireFlipCard from "./FlipCard";

const Cube = () => {
  const cubeRef = useRef();
  const lightRef = useRef();

  // Randomly update the cube rotation
  useFrame(() => {
    const cube = cubeRef.current;

    // Randomly update the rotation
    cube.rotation.x += Math.random() * 0.01;
    cube.rotation.y += Math.random() * 0.01;
    cube.rotation.z += Math.random() * 0.01;
  });

  // Randomly update the light color
  useFrame(() => {
    const light = lightRef.current;

    // Randomly update the color
    light.color.setRGB(Math.random(), Math.random(), Math.random());
  });

  return (
    <>
      <mesh ref={cubeRef}>
        {/* <boxGeometry args={[1, 1, 1]} /> */}
        <meshBasicMaterial color={0xff00fff} wireframe />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 3]} intensity={1} />
    </>
  );
};

function Triangle({ color, ...props }) {
  const ref = useRef();
  const [r] = useState(() => Math.random() * 10000);
  useFrame(
    (_) =>
      (ref.current.position.y = -1.75 + Math.sin(_.clock.elapsedTime + r) / 10)
  );
  const { paths: [path] } = useLoader(SVGLoader, '/triangle.svg') // prettier-ignore
  const geom = useMemo(
    () =>
      SVGLoader.pointsToStroke(
        path.subPaths[0].getPoints(),
        path.userData.style
      ),
    []
  );
  return (
    <group ref={ref}>
      <mesh geometry={geom} {...props}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  const vec = new THREE.Vector3();
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 2, 0, 3.5), 0.05);
    ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      (-mouse.x * Math.PI) / 20,
      0.1
    );
  });
  return <group ref={ref}>{children}</group>;
}

function Ground(props) {
  const [floor, normal] = useTexture([
    "/SurfaceImperfections003_1K_var1.jpg",
    "/SurfaceImperfections003_1K_Normal.jpg",
  ]);
  return (
    <Reflector resolution={1024} args={[8, 8]} {...props}>
      {(Material, props) => (
        <Material
          color="#f0f0f0"
          metalness={0}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
}

const StyledStarsCanvas = () => {
  return (
    <>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15] }}>
        <ambientLight intensity={0.2} />
        <Cube />
        <color attach="background" args={["black"]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
        <Suspense fallback={null}>
          <Rig>
            <Triangle
              color="#ff2060"
              scale={0.009}
              rotation={[0, 0, Math.PI / 3]}
            />
            <Triangle
              color="cyan"
              scale={0.009}
              position={[2, 0, -2]}
              rotation={[0, 0, Math.PI / 3]}
            />
            <Triangle
              color="orange"
              scale={0.009}
              position={[-2, 0, -2]}
              rotation={[0, 0, Math.PI / 3]}
            />
            <Triangle
              color="white"
              scale={0.009}
              position={[0, 2, -10]}
              rotation={[0, 0, Math.PI / 3]}
            />
            <Ground
              mirror={1}
              blur={[500, 100]}
              mixBlur={12}
              mixStrength={1.5}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              position-y={-0.8}
            />
          </Rig>
          <EffectComposer multisampling={8}>
            <Bloom
              kernelSize={3}
              luminanceThreshold={0}
              luminanceSmoothing={0.4}
              intensity={0.6}
            />
            <Bloom
              kernelSize={KernelSize.HUGE}
              luminanceThreshold={0}
              luminanceSmoothing={0}
              intensity={0.5}
            />
          </EffectComposer>
        </Suspense>
        <CameraShake
          yawFrequency={0.2}
          pitchFrequency={0.2}
          rollFrequency={0.2}
        />
      </Canvas>
    </>
  );
};

export default StyledStarsCanvas;
