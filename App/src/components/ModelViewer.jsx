import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model({ url }) {
  const group = useRef();
  const { scene } = useGLTF(url);
  
  // Rotate the model
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={group} scale={0.5}>
      <primitive object={scene} />
    </group>
  );
}

function ModelViewer({ modelPath }) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [2, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        shadows
      >
        {/* Main key light - bright and slightly yellow */}
        <directionalLight 
          position={[5, 10, 7]} 
          intensity={1.5} 
          color="#ffffee"
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-bias={-0.0001}
        />
        
        {/* Fill light - soft blue from the opposite side */}
        <directionalLight 
          position={[-5, 5, 5]} 
          intensity={0.8}
          color="#e0f7ff"
        />
        
        {/* Rim/Back light - highlights the edges */}
        <directionalLight 
          position={[0, 5, -5]} 
          intensity={0.6}
          color="#ffffff"
        />
        
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.4} color="#ffffff" />
        
        {/* Hemisphere light for natural-looking ambient */}
        <hemisphereLight 
          args={['#ffffff', '#000000']} 
          intensity={0.6} 
        />
        
        <Suspense fallback={null}>
          <Model url={modelPath} />
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
          />
        </Suspense>
        
      </Canvas>
    </div>
  );
}

export default ModelViewer;
