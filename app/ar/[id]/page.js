
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function ModelMug({ texture, ...props }) {
  const { nodes, materials } = useGLTF('/mug/scene.gltf');
  
  useEffect(() => {
    if (texture) {
      materials.image_texture.map = texture;
      materials.image_texture.map.needsUpdate = true;
      materials.image_texture.needsUpdate = true;
    }
  }, [texture, materials]);

  return (
    <group {...props} dispose={null}>
      <group scale={0.45}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh 
            geometry={nodes.Circle_Material002_0.geometry} 
            material={materials.MUG}
            castShadow
            receiveShadow
          />
          <mesh 
            geometry={nodes.Circle_Material002_0002.geometry} 
            material={materials.image_texture}
            castShadow
            receiveShadow
          />
        </group>
        <mesh 
          geometry={nodes.Circle001_Material001_0.geometry} 
          material={materials['Material.001']} 
          rotation={[-Math.PI / 2, 0, 0]} 
          scale={100}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  );
}

export async function generateStaticParams() {
  // Add all IDs you want to statically generate
  return [{ id: 'test' }]
}

export default function ARPage({ params, searchParams }) {
  const [texture, setTexture] = useState(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check AR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }

    // Load texture from URL parameter
    if (searchParams.image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = decodeURIComponent(searchParams.image);
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        setTexture(texture);
        setIsLoading(false);
      };
      img.onerror = () => {
        console.error('Failed to load image');
        setIsLoading(false);
      };
    }
  }, [searchParams.image]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isARSupported) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">AR Not Supported</h2>
          <p className="text-gray-600">
            Your device or browser doesn't support AR experiences. Please try using a modern mobile device with AR capabilities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true;
        }}
      >
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-10, -10, -10]} intensity={0.2} />
        <ModelMug texture={texture} position={[0, 0, -2]} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={30}
          rotateSpeed={1}
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}
