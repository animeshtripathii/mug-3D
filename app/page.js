'use client'

import ImageEditor from './components/editor/ImageEditor'
import LandingPage from './components/LandingPage'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useState, useEffect, useRef, useRef as useCanvasRef } from 'react'
import * as THREE from 'three'
import { FaCube, FaEdit, FaCheckCircle, FaArrowLeft, FaMobileAlt } from 'react-icons/fa'
import ARQRModal from './components/ARQRModal'

function ModelMug({ texture, ...props }) {
  const { nodes, materials } = useGLTF('/mug/scene.gltf')
  
  useEffect(() => {
    if (texture) {
      materials.image_texture.map = texture
      materials.image_texture.map.needsUpdate = true
      materials.image_texture.needsUpdate = true
    }
  }, [texture, materials])

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
  )
}

// AR Scene Component
function ARScene({ texture }) {
  const { gl, scene, camera } = useThree()
  
  useEffect(() => {
    if (!gl.xr) return;

    // Enable WebXR
    gl.xr.enabled = true;

    // Set up AR session
    const startAR = async () => {
      if (navigator.xr) {
        try {
          const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
          });
          
          await gl.xr.setSession(session);
          
          session.addEventListener('end', () => {
            gl.xr.setSession(null);
          });
        } catch (error) {
          console.error('Error starting AR session:', error);
        }
      }
    };

    // Start AR when component mounts
    startAR();

    return () => {
      if (gl.xr.getSession()) {
        gl.xr.getSession().end();
      }
    };
  }, [gl.xr]);

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -10]} intensity={0.2} />
      <ModelMug 
        position={[0, 0, 0]} 
        rotation={[0, Math.PI / 4, 0]}
        texture={texture}
      />
    </>
  )
}

export default function Home() {
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editedImage, setEditedImage] = useState(null)
  const [uploadedTexture, setUploadedTexture] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [arURL, setARURL] = useState('')
  const imageEditorRef = useRef();
  const canvasRef = useCanvasRef();

  const handleImageEdit = (imageUrl) => {
    setEditedImage(imageUrl)
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const texture = new THREE.Texture(img)
      texture.needsUpdate = true
      texture.encoding = THREE.sRGBEncoding
      texture.flipY = false
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      setUploadedTexture(texture)
    }
  }

  const handleUploadDesign = () => {
    setShowEditor(true);
  };

  // When toggling preview ON, get the latest composited image (with text) from the editor
  const handleTogglePreview = async () => {
    if (!showPreview && imageEditorRef.current) {
      // Await the promise for composited image with background color
      const dataUrl = await imageEditorRef.current.getCompositedImageDataUrl();
      if (dataUrl) {
        const img = new window.Image();
        img.src = dataUrl;
        img.onload = () => {
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          setUploadedTexture(texture);
          setShowPreview(true);
        };
        return;
      }
    }
    setShowPreview(!showPreview);
  };

  const handleToggleAR = async () => {
    if (!showQRModal) {
      try {
        // Get the canvas
        const canvas = document.querySelector('canvas');
        if (!canvas) {
          throw new Error('Canvas not found');
        }

        // Create a simple URL for testing
        const testUrl = `${window.location.origin}/ar/test`;
        console.log('Using test URL:', testUrl);

        // Generate AR URL through our API
        const response = await fetch('/api/ar-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: testUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate AR URL');
        }

        const data = await response.json();
        console.log('AR URL generated:', data.url);
        setARURL(data.url);
        setShowQRModal(true);
      } catch (error) {
        console.error('Error preparing AR view:', error);
        alert('Failed to prepare AR view: ' + error.message);
      }
    } else {
      setShowQRModal(false);
      setARURL('');
    }
  };

  if (!showEditor) {
    return <LandingPage onUploadDesign={handleUploadDesign} />;
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                <FaCube className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MugCraft Pro</h1>
                <p className="text-xs text-gray-500">Professional Mug Designer</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  !showPreview 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setShowPreview(false);
                  setShowQRModal(false);
                }}
              >
                <FaEdit className="inline-block w-4 h-4 mr-2" />
                Design
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  showPreview 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={handleTogglePreview}
              >
                <FaCube className="inline-block w-4 h-4 mr-2" />
                3D Preview
              </button>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowEditor(false)}
              className="btn btn-secondary"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            <button className="btn btn-secondary">
              Save Draft
            </button>
            <button className="btn btn-primary">
              <FaCheckCircle className="w-4 h-4" />
              Export Design
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* 3D Preview */}
        {showPreview ? (
          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
            {/* 3D Preview Toolbar */}
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-in">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setShowQRModal(false);
                  }}
                  className="btn btn-secondary"
                >
                  <FaArrowLeft className="w-4 h-4 mr-2" />
                  Back to Editor
                </button>
                <button
                  onClick={handleToggleAR}
                  className="btn btn-primary"
                >
                  <FaMobileAlt className="w-4 h-4 mr-2" />
                  View in AR
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {showQRModal ? 'QR CODE' : '3D PREVIEW MODE'}
                </p>
                <p className="text-sm text-gray-500">
                  {showQRModal ? 'Scan QR code to view in AR' : 'Rotate to view all angles'}
                </p>
              </div>
            </div>

            {/* 3D Canvas Container */}
            <div className="w-full h-full flex items-center justify-center p-12">
              <div className="w-full h-[calc(100vh-160px)] min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Canvas
                  ref={canvasRef}
                  shadows
                  camera={{
                    position: [16, 8, 16],
                    fov: 40,
                    near: 0.1,
                    far: 1000
                  }}
                  style={{ background: '#f8fafc' }}
                  gl={{
                    preserveDrawingBuffer: true,
                    antialias: true
                  }}
                >
                  <color attach="background" args={['#f8fafc']} />
                  <ambientLight intensity={1} />
                  <directionalLight
                    position={[10, 10, 10]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                  />
                  <directionalLight
                    position={[-10, -10, -10]}
                    intensity={0.2}
                  />
                  <ModelMug 
                    position={[0, 0, 0]} 
                    rotation={[0, Math.PI / 4, 0]}
                    texture={uploadedTexture}
                  />
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
                  <gridHelper args={[40, 40, '#e2e8f0', '#e2e8f0']} position={[0, -4, 0]} />
                </Canvas>
              </div>
            </div>
          </div>
        ) : (
          <ImageEditor ref={imageEditorRef} onImageEdit={handleImageEdit} />
        )}

        {/* AR QR Code Modal */}
        <ARQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          arURL={arURL}
        />
      </div>
    </main>
  )
}

