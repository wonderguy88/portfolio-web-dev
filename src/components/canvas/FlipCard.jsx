import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FireCard({ image, position, scale, flip }) {
    const cardRef = useRef();
    const [flipped, setFlipped] = useState(false);
    const gradientColors = ['#FFFF00', '#0000FF', '#FFFFFF', '#FF00FF'];

    useFrame(() => {
      const time = Date.now() * 0.001; // Convert current time to seconds
      const intensity = Math.sin(time * 3) * 0.5 + 0.5; // Calculate intensity based on time

      const colorIndex = Math.floor(intensity * (gradientColors.length - 1));
      const color = gradientColors[colorIndex];

      cardRef.current.rotation.y = flip ? Math.PI * intensity : 0;
      cardRef.current.material.color.set(color);
    });
  
    const handleClick = () => {
      setFlipped(!flipped);
    };
  
    return (
      <group position={position} onClick={handleClick}>
        <mesh ref={cardRef} scale={scale}>
          <boxGeometry attach="geometry" args={[1, 1, 0.05]} />
          <meshBasicMaterial attach="material" color="blue" wireframe={!flipped} wireframeLinewidth={"10px"}/>
          <meshBasicMaterial attach="material" map={image} side={THREE.DoubleSide} transparent={!flipped} />
        </mesh>
      </group>
    );
  }

const FireFlipCard = () => {

    const imageTexture = new THREE.TextureLoader().load('amazing,_laptop_image_png.png');
  
    return (
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.2} />
        <color attach="background" args={["black"]} />
        <FireCard image={imageTexture} position={[0, 0, -5]} scale={[8, 8, 8]} flip={true} />
      </Canvas>
    );
  }
  
export default FireFlipCard;