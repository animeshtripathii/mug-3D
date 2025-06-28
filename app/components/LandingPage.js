'use client'

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Stage } from '@react-three/drei'
import { FaWhatsapp, FaChevronRight, FaHeart, FaFileAlt } from 'react-icons/fa'

// 3D Mug Model Component - Keep original appearance
function MugModel({ ...props }) {
  const { nodes, materials } = useGLTF('/mug/scene.gltf')
  
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

export default function LandingPage({ onUploadDesign }) {
  const [selectedSize, setSelectedSize] = useState('190 ml')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedStyle, setSelectedStyle] = useState('2-sided')
  const [selectedDelivery, setSelectedDelivery] = useState('standard')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorite, setIsFavorite] = useState(false)
  
  const insideColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#facc15' },
    { name: 'Purple', hex: '#9333ea' },
  ]

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value) || 1
    setQuantity(Math.max(1, newQuantity))
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer">Home</span>
            <FaChevronRight className="w-3 h-3" />
            <span className="hover:text-gray-900 cursor-pointer">Photo Gifts</span>
            <FaChevronRight className="w-3 h-3" />
            <span className="hover:text-gray-900 cursor-pointer">Mugs</span>
            <FaChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Personalised Mugs</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - 3D Model Viewer */}
          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-4 relative h-[600px]">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <FaHeart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
              </button>
              
              {/* 3D Canvas */}
              <Canvas
                shadows
                camera={{ position: [16, 8, 16], fov: 40 }}
                style={{ background: '#f8fafc' }}
              >
                <Suspense fallback={null}>
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
                  <MugModel 
                    position={[0, 0, 0]} 
                    rotation={[0, Math.PI / 4, 0]}
                  />
                  <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={10}
                    maxDistance={25}
                    autoRotate
                    autoRotateSpeed={2}
                  />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalised Mugs</h1>
              <p className="text-lg text-gray-700">Printed Mugs that bring smiles every day!</p>
            </div>

            {/* Features List */}
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Personalise with photos, logo and more with Sharp, high-quality photo printing</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>8 color options for handle and mug interior with 2-side and wraparound print options available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Food-grade quality for safe use. Microwave and Dishwasher friendly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Looking for other Color Changing Mugs? <a href="#" className="text-blue-600 underline">Click here</a></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Same Day Delivery available</strong> on select <a href="#" className="text-blue-600 underline">pin codes</a> in <strong>Mumbai.</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Place your orders before 12 noon for same day delivery.</strong> Orders placed post 12 noon under Same day delivery option will be delivered the next working day</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Same day delivery orders will be delivered between 6 PM to 10 PM</span>
              </li>
            </ul>

            {/* WhatsApp Button */}
            <button 
              onClick={() => window.open('https://wa.me/?text=I%20want%20to%20order%20a%20custom%20mug', '_blank')}
              className="flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
            >
              <FaWhatsapp className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Share design on WhatsApp</div>
                <div className="text-sm">Get design support to place your order</div>
              </div>
            </button>

            {/* Additional Info */}
            <div className="space-y-2 text-gray-700">
              <p className="italic">Cash on Delivery available</p>
              <p><strong>Price below is MRP (inclusive of all taxes)</strong></p>
            </div>

            {/* See Details Link */}
            <button 
              onClick={() => setActiveTab('overview')}
              className="text-blue-600 underline text-sm hover:text-blue-700"
            >
              See Details
            </button>

            {/* View Specs Link */}
            <div className="flex items-center gap-2 text-sm">
              <FaFileAlt className="w-4 h-4" />
              <button 
                onClick={() => setActiveTab('specs')}
                className="text-blue-600 underline hover:text-blue-700"
              >
                View Specs & Templates
              </button>
              <span className="text-gray-600">to create your print-ready file.</span>
            </div>

            {/* Delivery Speed Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Speed</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedDelivery('standard')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedDelivery === 'standard' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Standard</div>
                </button>
                <button 
                  onClick={() => setSelectedDelivery('same-day')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedDelivery === 'same-day' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Same Day Delivery (Mumbai)</div>
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Size</h3>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setSelectedSize('190 ml')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedSize === '190 ml' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">190 ml</div>
                  <div className="text-sm text-gray-600">₹325</div>
                </button>
                <button 
                  onClick={() => setSelectedSize('325 ml')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedSize === '325 ml' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">325 ml</div>
                  <div className="text-sm text-gray-600">₹425</div>
                </button>
                <button 
                  onClick={() => setSelectedSize('450 ml')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedSize === '450 ml' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">450 ml</div>
                  <div className="text-sm text-gray-600">₹525</div>
                </button>
              </div>
            </div>

            {/* Inside Color Selection */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Inside Color</h3>
              <div className="flex gap-2">
                {insideColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.hex ? 'border-gray-400 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Style</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedStyle('2-sided')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedStyle === '2-sided' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">2-sided</div>
                </button>
                <button 
                  onClick={() => setSelectedStyle('Wraparound')}
                  className={`border-2 rounded-lg p-3 text-center transition-colors ${
                    selectedStyle === 'Wraparound' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">Wraparound</div>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 flex gap-3">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {num}{num === 5 && ' · Recommended'}
                  </button>
                ))}
              </div>
              <a href="#" className="text-blue-600 underline text-sm mt-2 inline-block">See Bulk pack list</a>
            </div>

            {/* Upload Design Button - Only one button now */}
            <div className="space-y-3 pt-6">
              <button 
                onClick={onUploadDesign}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <span>Upload design</span>
                <span className="text-sm">Have a design? Upload and edit it</span>
              </button>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="text-center text-sm text-gray-600 pt-4">
              ✓ 100% satisfaction guaranteed
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 border-t">
          <div className="flex gap-8 border-b">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 font-semibold transition-colors ${
                activeTab === 'overview' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-2 font-semibold transition-colors ${
                activeTab === 'specs' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Specs & Templates
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-2 font-semibold transition-colors ${
                activeTab === 'faq' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              FAQ
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="py-8 grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Give your everyday routine an extra dose of charm with Custom Mugs.
                </h2>
                <div className="prose prose-gray">
                  <p>
                    Start off your mornings on the right note with high-quality personalized mugs. With our full-color printing, you can design your own coffee mug and add a special message, fun picture or both. Include a special photo and delight your loved one with a heart-warming gift on their birthday, holiday season or special occasions, like weddings and bachelorettes. Customizable mugs can also be great mementos to give to employees and customers at events and celebrations. Our high-quality, full-color photo printing technology will make sure your creation looks great time and again.
                  </p>
                  
                  <h3 className="font-bold mt-6">Same Day Delivery Guidelines</h3>
                  <ul className="space-y-2">
                    <li>• Same Day Delivery is available for select pin codes in Mumbai. To check eligibility, refer to the list above or use the delivery calculator.</li>
                    <li>• If your pin code isn't eligible, please select Standard Delivery to proceed with your order.</li>
                    <li>• Avoid mixing Same Day Delivery and Standard Delivery products in a single order. If combined, the delivery date will default to Standard, but eligible items will still arrive the same day.</li>
                    <li>• Need assistance? Our Customer Care team is here to help! - 02522-669393</li>
                  </ul>
                  
                  <h3 className="font-bold mt-6">Creative ways to use your custom mugs.</h3>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 h-[400px]">
                <Canvas
                  shadows
                  camera={{ position: [12, 6, 12], fov: 40 }}
                  style={{ background: '#f8fafc' }}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={1} />
                    <directionalLight
                      position={[10, 10, 10]}
                      intensity={1}
                      castShadow
                    />
                    <MugModel 
                      position={[0, 0, 0]} 
                      rotation={[0, Math.PI / 4, 0]}
                    />
                    <OrbitControls
                      enableZoom={true}
                      enablePan={false}
                      minDistance={8}
                      maxDistance={20}
                      autoRotate
                      autoRotateSpeed={1}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications & Templates</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Product Specifications</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Material: High-quality ceramic</li>
                    <li>• Sizes: 190ml, 325ml, 450ml</li>
                    <li>• Print Area: Full wrap or 2-sided</li>
                    <li>• Handle Colors: 8 color options</li>
                    <li>• Dishwasher Safe: Yes</li>
                    <li>• Microwave Safe: Yes</li>
                    <li>• Country of Origin: China</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">Design Templates</h3>
                  <p className="text-gray-700 mb-4">
                    Vistaprint offers Personalised Mugs design templates in assorted styles.
                  </p>
                  <button className="text-blue-600 underline hover:text-blue-700">
                    Download Templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">What is the minimum order quantity?</h3>
                  <p className="text-gray-700">The minimum order quantity is 1 mug.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">How long does delivery take?</h3>
                  <p className="text-gray-700">Standard delivery takes 5-7 business days. Same day delivery is available in select areas of Mumbai.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Can I upload my own design?</h3>
                  <p className="text-gray-700">Yes! Click the "Upload design" button to upload and customize your own design.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}