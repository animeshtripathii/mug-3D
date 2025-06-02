'use client'

import Image from 'next/image'
import React, { useRef, useState } from 'react'

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useGLTF,OrbitControls,Stats } from '@react-three/drei'

import { LinearFilter, NearestFilter } from 'three';
import  * as THREE from 'three';

function ModelMug({ texture, ...props }) {
    const { nodes, materials } = useGLTF('/mug/scene.gltf')
    // Apply uploaded texture to the mug's image_texture material
    React.useEffect(() => {
      if (texture) {
        materials.image_texture.map = texture;
        materials.image_texture.map.needsUpdate = true;
        materials.image_texture.needsUpdate = true;
      }
    }, [texture, materials]);
    return (
      <group {...props} dispose={null}>
        <group scale={0.01}>
          <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <mesh geometry={nodes.Circle_Material002_0.geometry} material={materials.MUG} />
            <mesh geometry={nodes.Circle_Material002_0002.geometry} material={materials.image_texture} />
          </group>
          <mesh geometry={nodes.Circle001_Material001_0.geometry} material={materials['Material.001']} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        </group>
      </group>
    )
}

export default function Home() {
  const [uploadedTexture, setUploadedTexture] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false); // default to no photo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = function (event) {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = function () {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        setUploadedTexture(texture);
        setShowPhoto(true);
      };
    };
    reader.readAsDataURL(file);
  };
  const handleRemovePhoto = () => {
    setShowPhoto(false);
    setUploadedTexture(null);
  };
  const modelUrl = '/mug/scenev1.gltf'
  return (
    <main className="flex flex-col items-center justify-between pt-4 min-h-screen" style={{ background: 'black' }}>
      <h1 className="text-3xl font-bold mb-4 text-white">Personalized Mug Designer</h1>
      <label className="mb-4 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 z-10">
        Upload Your Image
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </label>
      {uploadedTexture && showPhoto && (
        <button onClick={handleRemovePhoto} className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-10">Remove Photo</button>
      )}
      <div className="w-full h-[70vh] flex items-center justify-center relative">
        <div className="absolute inset-0 z-0" style={{ background: 'black' }} />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Canvas camera={{ position: [5, 3, 7], near: 1.55, zoom: 30 }} style={{ height: '100%', width: '100%', background: 'transparent' }}>
            <ambientLight intensity={3} />
            <directionalLight position={[3, 4, 5]} />
            <ModelMug position={[0, 0, 0]} texture={showPhoto ? uploadedTexture : null} />
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </main>
  )
}

