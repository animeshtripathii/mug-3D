'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import Sidebar from './Sidebar';
import { FaUndo, FaRedo, FaCrop, FaMagic, FaSync, FaSlidersH, FaImage, FaPaintBrush, FaTextHeight } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import TextEditorModal from './text/TextEditorModal';
import TextLayer from './text/TextLayer';
import ImageToolbar from './ImageToolbar';
import TextToolbar from './TextToolbar';
import { getTextAnchorsForExport } from './text/TextLayer';
import GraphicsPanel from './graphics/GraphicsPanel';
import GraphicsTabs from './graphics/GraphicsTabs';
import GraphicsItem from './graphics/GraphicsItem';
import { Rect as KonvaRect, Circle as KonvaCircle, Star as KonvaStar, RegularPolygon } from 'react-konva';
import GraphicsToolbar from './graphics/GraphicsToolbar';

// Add ImageGraphic component before ImageEditor component
const ImageGraphic = React.memo(({ graphic, commonProps }) => {
  const [image] = useImage(graphic.url);
  return image ? (
    <KonvaImage
      {...commonProps}
      image={image}
      width={graphic.width}
      height={graphic.height}
    />
  ) : null;
});

const ImageEditor = forwardRef(({ onImageEdit }, ref) => {
  console.log('ImageEditor component rendering...');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedTool, setSelectedTool] = useState('select');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [hue, setHue] = useState(0);
  const [showAdjustDropdown, setShowAdjustDropdown] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [recentImages, setRecentImages] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [removeBgLoading, setRemoveBgLoading] = useState(false);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const trRef = useRef();
  const cropRectRef = useRef();
  const adjustDropdownRef = useRef(null);
  const [selected, setSelected] = useState(false);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [editingTextAttributes, setEditingTextAttributes] = useState(null);
  const [currentTextProps, setCurrentTextProps] = useState({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#000000',
    fontStyle: 'normal',
    align: 'left',
    opacity: 1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  });
  const [canvasColor, setCanvasColor] = useState('#ffffff'); // Default white
  const [isGraphicsPanelOpen, setIsGraphicsPanelOpen] = useState(false);
  const [graphicsSearch, setGraphicsSearch] = useState('');
  const [graphicsTab, setGraphicsTab] = useState('shapes');
  const [graphics, setGraphics] = useState([]);
  const [selectedGraphicId, setSelectedGraphicId] = useState(null);
  const graphicsLayerRef = useRef();
  const graphicsTrRef = useRef();
  const [graphicOpacity, setGraphicOpacity] = useState(100);
  const [graphicBorderWidth, setGraphicBorderWidth] = useState(0);
  const [imageLoading, setImageLoading] = useState(false); // Loading indicator

  // Add new state for stage dimensions
  const [stageDimensions, setStageDimensions] = useState({
    width: Math.max(700, window.innerWidth - 400),
    height: Math.max(600, window.innerHeight - 200)
  });

  // Load image using use-image hook
  const [loadedImage] = useImage(imageUrl);

  // Initial image attributes
  const [imgAttrs, setImgAttrs] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  });

  // Map UI values to Konva filter ranges
  const konvaBrightness = brightness / 100; // -1 to 1
  const konvaContrast = contrast; // -100 to 100
  const konvaSaturation = saturation / 100; // -1 to 1
  const konvaHue = hue; // -180 to 180
  const konvaLuminance = 0; // Optionally expose as a slider

  // Memoize filter string to avoid unnecessary recalculations
  const filterString = React.useMemo(() => {
    return `
      brightness(${(konvaBrightness === 0) ? 1 : (konvaBrightness + 100) / 100})
      contrast(${(konvaContrast === 0) ? 1 : (konvaContrast + 100) / 100})
      saturate(${(konvaSaturation === 0) ? 1 : (konvaSaturation + 100) / 100})
      hue-rotate(${konvaHue}deg)
    `;
  }, [konvaBrightness, konvaContrast, konvaSaturation, konvaHue]);

  // Memoize the debounced onImageEdit callback
  const debouncedOnImageEdit = React.useCallback(
    debounce((url) => {
      onImageEdit(url);
    }, 100),
    [onImageEdit]
  );

  // Update image state and initial attributes when a new image is loaded
  useEffect(() => {
    if (loadedImage) {
      setImage(loadedImage);
      // Calculate initial position and scale to fit image within a bounding box on the canvas
      const canvasWidth = baseWidth;
      const canvasHeight = baseHeight;
      const padding = 50; // Padding from canvas edges
      const fitWidth = canvasWidth - padding * 2;
      const fitHeight = canvasHeight - padding * 2;

      const imageAspectRatio = loadedImage.width / loadedImage.height;
      const fitAspectRatio = fitWidth / fitHeight;

      let initialScaleX = 1;
      let initialScaleY = 1;

      if (imageAspectRatio > fitAspectRatio) {
        // Image is wider than the fit area - scale to fit width
        initialScaleX = fitWidth / loadedImage.width;
        initialScaleY = initialScaleX; // Maintain aspect ratio
      } else {
        // Image is taller than the fit area - scale to fit height
        initialScaleY = fitHeight / loadedImage.height;
        initialScaleX = initialScaleY; // Maintain aspect ratio
      }
      
      // Ensure initial scale doesn't enlarge the image if it's smaller than fit area
      initialScaleX = Math.min(initialScaleX, 1);
      initialScaleY = Math.min(initialScaleY, 1);

      // Center the image on the canvas
      const scaledWidth = loadedImage.width * initialScaleX;
      const scaledHeight = loadedImage.height * initialScaleY;
      const centerX = (canvasWidth - scaledWidth) / 2;
      const centerY = (canvasHeight - scaledHeight) / 2;

      setImgAttrs({
        x: centerX,
        y: centerY,
        rotation: 0,
        scaleX: initialScaleX,
        scaleY: initialScaleY,
      });
      // Select the image automatically on load
      setSelected(true);
    } else {
      // Reset attributes when no image is loaded
      setImgAttrs({
        x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
      });
      setSelected(false);
      setImage(null); // Also clear the Konva image object
      setTexts([]); // Clear texts when image is removed
      setSelectedText(null); // Deselect any selected text
    }
  }, [loadedImage]);

  // Update image state when texts change or adjustments are applied
  useEffect(() => {
    if (!loadedImage || !onImageEdit || !stageRef.current) {
      onImageEdit(null);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    // Fill canvas with user-selected color
    ctx.save();
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply filters
    ctx.filter = filterString;
    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

    // Render text
    if (texts.length > 0) {
      texts.forEach(text => {
        if (text.editing) return;
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate(text.rotation * Math.PI / 180);
        ctx.scale(text.scaleX || 1, text.scaleY || 1);
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.fill;
        ctx.fillText(text.text, 0, text.fontSize * 0.8);
        ctx.restore();
      });
    }

    const combinedImageUrl = canvas.toDataURL('image/png', 0.8);
    onImageEdit(combinedImageUrl);
  }, [loadedImage, texts, filterString, onImageEdit, canvasColor]);

  // Close adjust dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking outside of it, but not if clicking the adjust button itself
      const adjustButton = document.querySelector('button[title="Adjust"]');
      if (adjustDropdownRef.current && !adjustDropdownRef.current.contains(event.target) && adjustButton && !adjustButton.contains(event.target)) {
        setShowAdjustDropdown(false);
      }
    };

    // Add event listener for clicks
    window.addEventListener('click', handleClickOutside);

    // Return cleanup function
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [showAdjustDropdown]); // Dependency on dropdown state

  // Helper to resize image to max dimension
  const resizeImage = (file, maxDim = 1024) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const resizedUrl = URL.createObjectURL(blob);
          resolve({ url: resizedUrl, revoke: [url, resizedUrl] });
        }, file.type || 'image/png');
      };
      img.src = url;
    });
  };

  // Handle image upload from sidebar
  const handleSidebarImageUpload = async (event) => {
    // Handle recent image click
    if (event.target.recent) {
      setImageUrl(event.target.recent);
      return;
    }
    // Handle file upload
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setImageLoading(true);
    // Resize image before using
    const { url: resizedUrl, revoke } = await resizeImage(file);
    setImageUrl(resizedUrl);
    setRecentImages(prev => [resizedUrl, ...prev.slice(0, 4)]);
    setImageLoading(false);
    // Cleanup object URLs after a short delay
    setTimeout(() => revoke.forEach(URL.revokeObjectURL), 10000);
  };

  // Add this helper to push both image and texts to history
  const pushToHistory = (imageUrlVal, textsVal) => {
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push({ imageUrl: imageUrlVal, texts: textsVal });
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const addToHistory = (action) => {
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(action);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const undo = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      const previousState = history[newStep];
      if (previousState) {
        setImageUrl(previousState.imageUrl);
        setTexts(previousState.texts || []);
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        setHue(0);
      }
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      const nextState = history[newStep];
      if (nextState) {
        setImageUrl(nextState.imageUrl);
        setTexts(nextState.texts || []);
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        setHue(0);
      }
    }
  };

  // Replace: open file dialog
  const handleReplace = () => {
    console.log('Replace button clicked!');
    // Create a new file input element if it doesn't exist
    let fileInput = document.getElementById('sidebar-image-upload');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'sidebar-image-upload';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    // Ensure previous listener is removed
    fileInput.removeEventListener('change', handleSidebarImageUpload);
    fileInput.addEventListener('change', handleSidebarImageUpload);

    fileInput.value = ''; // Reset the input
    fileInput.click(); // Trigger the click
  };

  // Update handleSliderChange to set the corresponding adjustment directly
  const handleSliderChange = React.useCallback((type, value) => {
    switch (type) {
      case 'brightness': setBrightness(value); break;
      case 'contrast': setContrast(value); break;
      case 'saturation': setSaturation(value); break;
      case 'hue': setHue(value); break;
      default: break;
    }
  }, []);

  // Crop: enable crop mode, crop rect overlays image
  const handleCrop = () => {
    if (!imageRef.current) return; // Ensure image node exists

    setSelectedTool('crop');
    setSelected(false);

    const imageNode = imageRef.current;
    // Get current visual bounding box of the image
    const boundingBox = imageNode.getClientRect();

    setCropRect({
      // Position crop rect relative to image's current position, with some padding
      x: boundingBox.x + 40,
      y: boundingBox.y + 40,
      // Initial crop rect size: 50% of the image's visual size, minimum 100px
      width: Math.max(100, boundingBox.width / 2),
      height: Math.max(100, boundingBox.height / 2),
    });
    setIsCropping(true);
  };

  // Apply crop (relative to image position/size)
  const applyCrop = () => {
    if (!cropRect || !image || !imageRef.current) return;

    const imageNode = imageRef.current;
    const imageSize = { width: image.width, height: image.height };
    const imageAttrs = imageNode.getAttrs();

    // Calculate crop area in original image coordinates
    // Get crop rect position and size relative to the image node's top-left corner in stage coordinates
    const cropRectInStage = {
        x: cropRect.x,
        y: cropRect.y,
        width: cropRect.width,
        height: cropRect.height,
    };

    // Apply inverse of image transformations to map crop rect back to original image coordinates
    // This is a simplified approach; a full inverse transform might be complex with rotation
    // Assuming for now that crop rect is always aligned to the canvas/stage axes.
    // If image was rotated, this would need to be adjusted.
     const originalImageCropX = (cropRectInStage.x - imageAttrs.x) / imageAttrs.scaleX;
     const originalImageCropY = (cropRectInStage.y - imageAttrs.y) / imageAttrs.scaleY;
     const originalImageCropWidth = cropRectInStage.width / imageAttrs.scaleX;
     const originalImageCropHeight = cropRectInStage.height / imageAttrs.scaleY;


    const canvas = document.createElement('canvas');
    canvas.width = cropRect.width; // Cropped image will have the visual size of the crop rect
    canvas.height = cropRect.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image, // Use the original image source
      originalImageCropX, // Source x in original image
      originalImageCropY, // Source y in original image
      originalImageCropWidth, // Source width in original image
      originalImageCropHeight, // Source height in original image
      0, // Destination x on new canvas
      0, // Destination y on new canvas
      cropRect.width, // Destination width on new canvas
      cropRect.height // Destination height on new canvas
    );

    const croppedUrl = canvas.toDataURL('image/png', 1.0); // Use png to preserve transparency if any

    // Create a new image element to get the dimensions of the cropped image
    const newImage = new window.Image();
    newImage.onload = () => {
         // Calculate new position to center the cropped image on the canvas
         const newX = (baseWidth - newImage.width) / 2;
         const newY = (baseHeight - newImage.height) / 2;

         setImageUrl(croppedUrl); // Update the source URL
         setImgAttrs({ // Reset attributes for the new image
           x: newX,
           y: newY,
           rotation: 0,
           scaleX: 1,
           scaleY: 1,
         });

         addToHistory({ type: 'crop', imageUrl: croppedUrl }); // Add to history
         setIsCropping(false); // Exit crop mode
         setCropRect(null); // Clear crop rectangle
         setSelectedTool('select'); // Switch back to select tool
         setSelected(true); // Select the newly cropped image
    };
    newImage.src = croppedUrl; // Set the source to trigger onload
  };

  // Remove BG: simple white background removal
  const handleRemoveBG = () => {
    if (!imageUrl || removeBgLoading) return;
    setRemoveBgLoading(true);
    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; // Needed for toDataURL with images from other origins
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Simple white background removal (threshold 240)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const newUrl = canvas.toDataURL('image/png', 1.0); // Use png to preserve transparency
      setImageUrl(newUrl);
      addToHistory({ type: 'remove-bg', imageUrl: newUrl });
      setRemoveBgLoading(false);
    };
    img.src = imageUrl;
  };

  // Crop rectangle drag/resize
  const handleCropRectChange = (e) => {
    const node = e.target;
    // Update cropRect state with new visual attributes
    setCropRect({
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    });
    // Reset scale on the node itself after getting the size
    node.scaleX(1);
    node.scaleY(1);
  };

  // Deselect image/text when clicking outside
  const handleStageMouseDown = (e) => {
    // clicked on empty area - remove selection
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage) {
      setSelected(false); // Deselect image
      setSelectedText(null); // Deselect text
    }
  };

  // Select image when clicked
  const handleImgClick = () => {
    setSelected(true);
    setSelectedText(null); // Deselect text if image is clicked
  };

  // Attach Transformer to image when selected
  useEffect(() => {
    // Use a timeout to allow state updates and rendering to complete
    // before attaching the transformer. This can help prevent issues
    // when rapidly selecting/deselecting or changing tools.
    const timeoutId = setTimeout(() => {
       if (selected && imageRef.current && trRef.current && selectedTool === 'select') {
          // Check if the tool is 'select' before attaching to image
          trRef.current.nodes([imageRef.current]);
          trRef.current.getLayer().batchDraw();
       } else if (trRef.current) {
          // Deselect when image is not selected or tool is not 'select'
          trRef.current.nodes([]);
          trRef.current.getLayer().batchDraw();
       }
    }, 0); // Use 0ms timeout for next tick

    return () => clearTimeout(timeoutId);
  }, [selected, imageRef.current, selectedTool]);

  // Expose a method to get the composited image (with text) as a data URL
  useImperativeHandle(ref, () => ({
    getCompositedImageDataUrl: (options = { mimeType: 'image/png', quality: 0.92 }) => {
      if (stageRef.current) {
        // Export the visible canvas (including text and image) with background color
        // We'll use a similar approach as in the useEffect above
        const stage = stageRef.current;
        const width = stage.width();
        const height = stage.height();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.save();
        ctx.fillStyle = canvasColor;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        // Draw the stage (Konva) content on top
        const stageDataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
        const tempImg = new window.Image();
        tempImg.src = stageDataUrl;
        return new Promise(resolve => {
          tempImg.onload = () => {
            ctx.drawImage(tempImg, 0, 0);
            resolve(canvas.toDataURL(options.mimeType, options.quality));
          };
        });
      }
      return Promise.resolve(null);
    }
  }));

  // Handle tool selection
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setShowAdjustDropdown(false);
    if (tool === 'graphics') {
      setIsGraphicsPanelOpen(true);
    } else {
      setIsGraphicsPanelOpen(false);
    }

    // Logic based on selected tool
    switch (tool) {
      case 'text':
        // Open modal for adding new text
        setEditingTextAttributes(null); // Clear attributes for new text
        setIsTextModalOpen(true);
        setSelected(false); // Deselect image when adding text
        setSelectedText(null); // Deselect text when adding new text
        break;
      case 'crop':
        if (imageUrl) {
          handleCrop(); // Initiate crop mode if image exists
          setSelected(false); // Deselect image in crop mode
          setSelectedText(null); // Deselect text in crop mode
        } else {
           // If no image, prevent switching to crop tool
           setSelectedTool('select');
        }
        break;
      case 'select':
        setIsCropping(false); // Exit crop mode if switching to select
        setCropRect(null); // Clear crop rectangle
        // Selection is handled by handleStageMouseDown and handleImgClick/handleTextSelect
        break;
      case 'erase':
        // Eraser logic will go here
         setSelected(false); // Deselect image in erase mode
         setSelectedText(null); // Deselect text in erase mode
        break;
      default:
        // For other tools, deselect both image and text
        setSelected(false);
        setSelectedText(null);
        setIsCropping(false);
        setCropRect(null);
        break;
    }

    // Close modal if open and switching to a non-text tool
    if (tool !== 'text' && isTextModalOpen) {
       setIsTextModalOpen(false);
       setEditingTextAttributes(null);
    }
  };

  // Handle text selection - Keep in ImageEditor to manage selectedText state
  // This function is passed to TextLayer
  const handleTextSelect = (id) => {
    setSelectedText(id);
    setSelected(false); // Deselect image when selecting text
  };

  // Handle text transform - Keep in ImageEditor to update texts state
  // This function is passed to TextLayer
  const handleTextTransform = (id, newAttributes) => {
    setTexts(texts.map(t => {
      if (t.id === id) {
        return { ...t, ...newAttributes };
      }
      return t;
    }));
  };

  // Handle text edit (double-click) - Modified to open modal
  // This function is passed to TextLayer
  const handleTextDblClick = (id) => {
    const text = texts.find(t => t.id === id);
    if (text) {
      setEditingTextAttributes(text); // Set attributes for editing
      setIsTextModalOpen(true);
      // Set editing flag on the specific text object
      setTexts(texts.map(t => t.id === id ? { ...t, editing: true } : t));
       console.log('Opened modal for text ID:', id, ', editing flag set to true.');
    }
  };

  // Handle saving text from modal
  const handleSaveText = (savedText) => {
    // Handle deletion through the modal
    if (savedText.deleted) {
      setTexts(texts.filter(t => t.id !== savedText.id));
      setIsTextModalOpen(false);
      setEditingTextAttributes(null);
      setSelectedText(null);
      return;
    }
    
    if (savedText.id) {
      // Update existing text
      setTexts(texts.map(t => t.id === savedText.id ? { ...t, ...savedText, editing: false } : t));
       console.log('Saved text ID:', savedText.id, ', editing flag set to false.');
    } else {
      // Add new text
      const newText = {
        id: Date.now(),
        ...savedText,
        x: 50, // Default position
        y: 50,
        rotation: 0, // Default rotation
        scaleX: 1,   // Default scale
        scaleY: 1,
        draggable: true,
        editing: false, // New text is not being edited after adding
      };
      setTexts([...texts, newText]);
       console.log('Added new text with ID:', newText.id);
    }
    setIsTextModalOpen(false);
    setEditingTextAttributes(null);
    setSelectedText(null); // Deselect text after saving
  };

  // Handle deleting text from modal or delete button
  const handleDeleteText = (id) => {
    setTexts(texts.filter(t => t.id !== id));
    setIsTextModalOpen(false);
    setEditingTextAttributes(null);
    setSelectedText(null); // Deselect if the deleted text was selected
     console.log('Deleted text ID:', id);
  };

  // Handle font family change for selected text
  const handleFontFamilyChange = (fontFamily) => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, fontFamily } : text
    ));
  };

  // Handle font size change for selected text
  const handleFontSizeChange = (fontSize) => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, fontSize } : text
    ));
  };

  // Handle increase font size for selected text
  const handleIncreaseFontSize = () => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, fontSize: text.fontSize + 2 } : text
    ));
  };

  // Handle decrease font size for selected text
  const handleDecreaseFontSize = () => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, fontSize: Math.max(8, text.fontSize - 2) } : text
    ));
  };

  // Handle text color change for selected text
  const handleTextColorChange = (fill) => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, fill } : text
    ));
  };

  // Handle text style toggles (bold, italic, underline)
  const handleTextStyleToggle = (styleType) => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        let newFontStyle = text.fontStyle || '';
        if (newFontStyle.includes(styleType)) {
          newFontStyle = newFontStyle.replace(styleType, '').trim();
        } else {
          newFontStyle = `${newFontStyle} ${styleType}`.trim();
        }
        return { ...text, fontStyle: newFontStyle };
      }
      return text;
    }));
  };

  // Handle text alignment change
  const handleTextAlignChange = (align) => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, align } : text
    ));
  };

  // Handle text list functionality: toggle bullet prefix
  const handleTextList = () => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        // If already a list, remove bullets; otherwise, add bullets
        const isList = text.text.startsWith('\u2022 ');
        return {
          ...text,
          text: isList
            ? text.text.replace(/^\u2022\s/, '')
            : `\u2022 ${text.text}`,
        };
      }
      return text;
    }));
  };

  // Placeholder for text spacing functionality
  const handleTextSpacing = () => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText
        ? { ...text, letterSpacing: (text.letterSpacing || 0) + 1 }
        : text
    ));
  };

  // Handle opacity change for selected text
  const handleTextOpacityChange = (opacity) => {
    if (!selectedText) return;
    const newTexts = texts.map(text =>
      text.id === selectedText ? { ...text, opacity } : text
    );
    setTexts(newTexts);
    pushToHistory(imageUrl, newTexts);
  };

  // Handle text rotation
  const handleTextRotate = (angle) => {
    if (!selectedText) return;
    setTexts(texts.map(text =>
      text.id === selectedText ? { ...text, rotation: (text.rotation + angle) % 360 } : text
    ));
  };

  // Handle text flip
  const handleTextFlip = (axis) => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        if (axis === 'horizontal') {
          return { ...text, scaleX: text.scaleX * -1 };
        } else if (axis === 'vertical') {
          return { ...text, scaleY: text.scaleY * -1 };
        }
      }
      return text;
    }));
  };

  // Handle duplicate text
  const handleTextDuplicate = () => {
    if (!selectedText) return;
    const textToDuplicate = texts.find(t => t.id === selectedText);
    if (textToDuplicate) {
      const newText = {
        ...textToDuplicate,
        id: Date.now(), // New unique ID
        x: textToDuplicate.x + 20, // Offset new text slightly
        y: textToDuplicate.y + 20,
      };
      setTexts([...texts, newText]);
      pushToHistory(imageUrl, [...texts, newText]);
    }
  };

  // Handle text lock functionality
  const handleTextLock = () => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        return { ...text, locked: !text.locked };
      }
      return text;
    }));
    pushToHistory(imageUrl, texts.map(text =>
      text.id === selectedText ? { ...text, locked: !text.locked } : text
    ));
  };

  // Placeholder for copy style functionality
  const handleTextCopyStyle = () => {
    if (!selectedText) return;
    console.log('Copy style functionality (placeholder)');
    // Implement actual copy style logic here
  };

  // Handle case change for selected text
  const handleCaseChange = (caseType) => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        let newTextContent = text.text;
        switch (caseType) {
          case 'uppercase':
            newTextContent = text.text.toUpperCase();
            break;
          case 'lowercase':
            newTextContent = text.text.toLowerCase();
            break;
          case 'mixedcase':
          default:
            // No change for mixedcase, assume original text is mixedcase
            break;
        }
        return { ...text, text: newTextContent };
      }
      return text;
    }));
  };

  // Handle curve change for selected text
  const handleCurveChange = (curveType) => {
    if (!selectedText) return;
    setTexts(texts.map(text => {
      if (text.id === selectedText) {
        return { ...text, curveType };
      }
      return text;
    }));
  };

  // Handle keyboard events for text deletion (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only delete if a text object is selected and not in text editing modal
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedText && !isTextModalOpen) {
         handleDeleteText(selectedText);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedText, isTextModalOpen, handleDeleteText]); // Depend on selectedText, modal state, and handler

  // Function to export text and anchor data for 3D mapping
  const exportTextFor3D = () => {
    return getTextAnchorsForExport(texts);
  };

  // Graphics items organized by category
  const GRAPHICS_ITEMS = {
    shapes: [
    {
      key: 'circle-solid',
      label: 'Circle (Solid)',
      thumbnail: <svg width="40" height="40"><circle cx="20" cy="20" r="16" fill="#333" /></svg>,
      type: 'shape',
      variant: 'solid',
      shape: 'circle',
    },
    {
      key: 'circle-outline',
      label: 'Circle (Outline)',
      thumbnail: <svg width="40" height="40"><circle cx="20" cy="20" r="16" fill="none" stroke="#333" strokeWidth="3" /></svg>,
      type: 'shape',
      variant: 'outline',
      shape: 'circle',
    },
    {
      key: 'square-solid',
      label: 'Square (Solid)',
      thumbnail: <svg width="40" height="40"><rect x="8" y="8" width="24" height="24" fill="#333" /></svg>,
      type: 'shape',
      variant: 'solid',
      shape: 'square',
    },
    {
      key: 'square-outline',
      label: 'Square (Outline)',
      thumbnail: <svg width="40" height="40"><rect x="8" y="8" width="24" height="24" fill="none" stroke="#333" strokeWidth="3" /></svg>,
      type: 'shape',
      variant: 'outline',
      shape: 'square',
    },
    {
      key: 'triangle-solid',
      label: 'Triangle (Solid)',
      thumbnail: <svg width="40" height="40"><polygon points="20,8 36,32 4,32" fill="#333" /></svg>,
      type: 'shape',
      variant: 'solid',
      shape: 'triangle',
    },
    {
      key: 'triangle-outline',
      label: 'Triangle (Outline)',
      thumbnail: <svg width="40" height="40"><polygon points="20,8 36,32 4,32" fill="none" stroke="#333" strokeWidth="3" /></svg>,
      type: 'shape',
      variant: 'outline',
      shape: 'triangle',
    },
    {
      key: 'star-solid',
      label: 'Star (Solid)',
      thumbnail: <svg width="40" height="40"><polygon points="20,6 24,16 35,16 26,23 29,34 20,27 11,34 14,23 5,16 16,16" fill="#333" /></svg>,
      type: 'shape',
      variant: 'solid',
      shape: 'star',
    },
    {
      key: 'star-outline',
      label: 'Star (Outline)',
      thumbnail: <svg width="40" height="40"><polygon points="20,6 24,16 35,16 26,23 29,34 20,27 11,34 14,23 5,16 16,16" fill="none" stroke="#333" strokeWidth="3" /></svg>,
      type: 'shape',
      variant: 'outline',
      shape: 'star',
    },
    {
      key: 'polygon-solid',
      label: 'Polygon (Solid)',
      thumbnail: <svg width="40" height="40"><polygon points="20,6 36,16 32,34 8,34 4,16" fill="#333" /></svg>,
      type: 'shape',
      variant: 'solid',
      shape: 'polygon',
    },
    {
      key: 'polygon-outline',
      label: 'Polygon (Outline)',
      thumbnail: <svg width="40" height="40"><polygon points="20,6 36,16 32,34 8,34 4,16" fill="none" stroke="#333" strokeWidth="3" /></svg>,
      type: 'shape',
      variant: 'outline',
      shape: 'polygon',
    },
    ],
    icons: [
    {
      key: 'icon-heart',
      label: 'Heart',
      thumbnail: <svg width="40" height="40"><path d="M20 34s-9-7.5-12-12.5C4 16 7 10 13 10c3 0 5 2 7 4 2-2 4-4 7-4 6 0 9 6 5 11.5C29 26.5 20 34 20 34z" fill="none" stroke="#e53e3e" strokeWidth="3" /></svg>,
      type: 'icon',
    },
    {
      key: 'icon-smile',
      label: 'Smile',
      thumbnail: <svg width="40" height="40"><circle cx="20" cy="20" r="16" fill="#fff" stroke="#333" strokeWidth="3" /><circle cx="14" cy="18" r="2" fill="#333" /><circle cx="26" cy="18" r="2" fill="#333" /><path d="M14 26c2 2 8 2 12 0" stroke="#333" strokeWidth="2" fill="none" /></svg>,
      type: 'icon',
    },
    {
      key: 'icon-lightning',
      label: 'Lightning',
      thumbnail: <svg width="40" height="40"><polygon points="20,6 28,22 22,22 26,34 12,18 18,18" fill="#fbbf24" stroke="#f59e42" strokeWidth="2" /></svg>,
      type: 'icon',
    },
    {
      key: 'icon-moon',
      label: 'Moon',
      thumbnail: <svg width="40" height="40"><path d="M28 20a8 8 0 1 1-8-8c0 4.418 3.582 8 8 8z" fill="#fbbf24" stroke="#333" strokeWidth="2" /></svg>,
      type: 'icon',
    },
    ],
    clipart: [
    {
      key: 'clipart-burst',
      label: 'Burst',
      thumbnail: <svg width="40" height="40"><circle cx="20" cy="20" r="10" fill="#f87171" /><circle cx="20" cy="20" r="6" fill="#fbbf24" /><circle cx="20" cy="20" r="2" fill="#34d399" /></svg>,
      type: 'clipart',
    },
    {
      key: 'clipart-rainbow',
      label: 'Rainbow',
      thumbnail: <svg width="40" height="40"><path d="M8 32a12 12 0 0 1 24 0" stroke="#a78bfa" strokeWidth="4" fill="none" /><path d="M12 32a8 8 0 0 1 16 0" stroke="#fbbf24" strokeWidth="4" fill="none" /><path d="M16 32a4 4 0 0 1 8 0" stroke="#34d399" strokeWidth="4" fill="none" /></svg>,
      type: 'clipart',
    },
    {
      key: 'clipart-bunting',
      label: 'Bunting',
      thumbnail: <svg width="40" height="40"><rect x="4" y="28" width="32" height="6" fill="#fbbf24" /><polygon points="8,34 12,28 16,34" fill="#f87171" /><polygon points="20,34 24,28 28,34" fill="#34d399" /></svg>,
      type: 'clipart',
    },
    {
      key: 'clipart-starburst',
      label: 'Starburst',
      thumbnail: <svg width="40" height="40"><polygon points="20,4 24,16 36,16 26,24 30,36 20,28 10,36 14,24 4,16 16,16" fill="#fbbf24" stroke="#f59e42" strokeWidth="2" /></svg>,
      type: 'clipart',
    },
    ],
  };

  // Filtering logic
  const getFilteredItems = (items, search) => {
    if (!search) return items;
    return items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
  };

  // Utility to create a new graphic object
  const createGraphic = (item) => {
    const id = Date.now() + Math.random();
    const centerX = 350;
    const centerY = 200;
    
    // Basic graphic object
    const baseGraphic = {
      id,
      x: centerX,
      y: centerY,
      fill: '#5C4AE4',
      stroke: 'transparent',
      strokeWidth: 2,
    };

    // For outline variants
    if (item.variant === 'outline') {
      baseGraphic.fill = 'transparent';
      baseGraphic.stroke = '#5C4AE4';
    }
    
    // Add shape-specific properties
    switch (item.shape) {
      case 'circle':
        return { ...baseGraphic, type: 'circle', radius: 40 };
      case 'square':
        return { ...baseGraphic, type: 'rect', width: 80, height: 80 };
      case 'triangle':
        return { ...baseGraphic, type: 'triangle', sides: 3, radius: 40 };
      case 'star':
        return { ...baseGraphic, type: 'star', numPoints: 5, innerRadius: 20, outerRadius: 40 };
      case 'polygon':
        return { ...baseGraphic, type: 'polygon', sides: 6, radius: 40 };
      default:
        // For icons and clipart, create an image-based graphic
        if (item.type === 'icon' || item.type === 'clipart') {
          const svgString = item.thumbnail.props.children.map(child => 
            child.type === 'path' ? 
              `<path d="${child.props.d}" fill="${child.props.fill || '#000'}" stroke="${child.props.stroke || 'none'}" stroke-width="${child.props.strokeWidth || 1}" />` :
              `<${child.type} ${Object.entries(child.props).map(([key, value]) => `${key}="${value}"`).join(' ')} />`
          ).join('');
          
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${svgString}</svg>`;
          const url = `data:image/svg+xml;base64,${btoa(svg)}`;
          
          return {
            ...baseGraphic,
            type: 'image',
            url,
            width: 80,
            height: 80,
          };
        }
        return baseGraphic;
    }
  };

  // Add graphic to canvas
  const handleAddGraphic = (item) => {
    const newGraphic = createGraphic(item);
    console.log('Adding new graphic:', newGraphic); // Debug log
    setGraphics(prev => [...prev, newGraphic]);
    setSelectedGraphicId(null);
    setIsGraphicsPanelOpen(false);
  };

  // Handle transform end
  const handleGraphicTransform = (id, node) => {
    if (!node) return;

    const newAttrs = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    // Add size-specific attributes based on the type
    const graphic = graphics.find(g => g.id === id);
    if (graphic) {
      switch (graphic.type) {
        case 'rect':
        case 'image':
          newAttrs.width = node.width() * node.scaleX();
          newAttrs.height = node.height() * node.scaleY();
          break;
        case 'circle':
        case 'triangle':
        case 'polygon':
          newAttrs.radius = node.width() * node.scaleX() / 2;
          break;
        case 'star':
          const scale = node.width() * node.scaleX() / (graphic.outerRadius * 2);
          newAttrs.innerRadius = graphic.innerRadius * scale;
          newAttrs.outerRadius = graphic.outerRadius * scale;
          break;
      }
    }

    setGraphics(graphics.map(g => 
      g.id === id 
        ? { ...g, ...newAttrs }
        : g
    ));
  };

  // Handle keyboard delete for graphics
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedGraphicId) {
        handleDeleteGraphic();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedGraphicId]);

  // Handle Transformer attachment for graphics
  useEffect(() => {
    if (!selectedGraphicId || !graphicsTrRef.current || !graphicsLayerRef.current) return;

    const node = graphicsLayerRef.current.findOne(`#graphic-${selectedGraphicId}`);
    
    if (node) {
      // Ensure the node is mounted and visible
      requestAnimationFrame(() => {
        if (graphicsTrRef.current) {
          graphicsTrRef.current.nodes([node]);
          graphicsTrRef.current.getLayer()?.batchDraw();
        }
      });
    }

    return () => {
      if (graphicsTrRef.current) {
        graphicsTrRef.current.nodes([]);
        graphicsTrRef.current.getLayer()?.batchDraw();
      }
    };
  }, [selectedGraphicId]);

  // Render SVG as image for icons/clipart
  const svgToImage = (svg, width = 40, height = 40) => {
    const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>${svg}</svg>`;
    const src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    const img = new window.Image();
    img.src = src;
    return img;
  };

  // Handle graphic opacity change
  const handleGraphicOpacityChange = (value) => {
    setGraphicOpacity(value);
    if (selectedGraphicId) {
      setGraphics(graphics.map(g =>
        g.id === selectedGraphicId
          ? { ...g, opacity: value / 100 }
          : g
      ));
    }
  };

  // Handle graphic border width change
  const handleGraphicBorderWidthChange = (value) => {
    setGraphicBorderWidth(value);
    if (selectedGraphicId) {
      setGraphics(graphics.map(g =>
        g.id === selectedGraphicId
          ? { ...g, strokeWidth: value }
          : g
      ));
    }
  };

  // Handle graphic duplication
  const handleGraphicDuplicate = () => {
    if (selectedGraphicId) {
      const graphic = graphics.find(g => g.id === selectedGraphicId);
      if (graphic) {
        const newGraphic = {
          ...graphic,
          id: Date.now(),
          x: graphic.x + 20,
          y: graphic.y + 20,
        };
        setGraphics([...graphics, newGraphic]);
      }
    }
  };

  // Handle graphic deletion
  const handleDeleteGraphic = () => {
    if (selectedGraphicId) {
      setGraphics(graphics.filter(g => g.id !== selectedGraphicId));
      setSelectedGraphicId(null);
    }
  };

  // Handle graphic lock/unlock
  const handleGraphicLock = () => {
    if (selectedGraphicId) {
      setGraphics(graphics.map(g =>
        g.id === selectedGraphicId
          ? { ...g, locked: !g.locked }
          : g
      ));
    }
  };

  // Handle graphic center/middle alignment
  const handleGraphicCenter = () => {
    if (selectedGraphicId && stageRef.current) {
      const stage = stageRef.current;
      const stageWidth = stage.width();
      setGraphics(graphics.map(g =>
        g.id === selectedGraphicId
          ? { ...g, x: stageWidth / 2 }
          : g
      ));
    }
  };

  const handleGraphicMiddle = () => {
    if (selectedGraphicId && stageRef.current) {
      const stage = stageRef.current;
      const stageHeight = stage.height();
      setGraphics(graphics.map(g =>
        g.id === selectedGraphicId
          ? { ...g, y: stageHeight / 2 }
          : g
      ));
    }
  };

  // Handle graphic layer arrangement
  const handleGraphicArrangeLayer = (direction) => {
    if (!selectedGraphicId) return;

    const newGraphics = [...graphics];
    const currentIndex = newGraphics.findIndex(g => g.id === selectedGraphicId);
    if (currentIndex === -1) return;

    const graphic = newGraphics[currentIndex];
    newGraphics.splice(currentIndex, 1);

    switch (direction) {
      case 'front':
        newGraphics.push(graphic);
        break;
      case 'forward':
        newGraphics.splice(Math.min(currentIndex + 1, newGraphics.length), 0, graphic);
        break;
      case 'backward':
        newGraphics.splice(Math.max(currentIndex - 1, 0), 0, graphic);
        break;
      case 'back':
        newGraphics.unshift(graphic);
        break;
    }

    setGraphics(newGraphics);
  };

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      setStageDimensions({
        width: Math.max(700, window.innerWidth - 400),
        height: Math.max(600, window.innerHeight - 200)
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply cache and batchDraw on filter change
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
      imageRef.current.getLayer()?.batchDraw();
    }
  }, [konvaBrightness, konvaContrast, konvaSaturation, konvaHue, image]);

  // Reset adjustments when a new image is uploaded
  useEffect(() => {
    if (imageUrl) {
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setHue(0);
    }
  }, [imageUrl]);

  // Restore the missing handleImgTransformEnd function
  const handleImgTransformEnd = (e) => {
    const node = e.target;
    setImgAttrs({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
  };

  // Add zoom state
  const [zoom, setZoom] = useState(1);
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

  // Handler for slider and dropdown
  const handleZoomChange = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    setZoom(Number(num));
    console.log('Zoom set to:', Number(num));
  };

  // Add state for stage position to keep canvas centered when zoomed
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Update stage position when zoom changes to keep canvas centered
  useEffect(() => {
    // Center the canvas in the container (baseWidth x baseHeight)
    const containerWidth = 900;
    const containerHeight = 300;
    const offsetX = (containerWidth - containerWidth * zoom) / 2;
    const offsetY = (containerHeight - containerHeight * zoom) / 2;
    setStagePos({ x: offsetX, y: offsetY });
  }, [zoom]);

  // Add zoom in/out handlers
  const handleZoomIn = () => {
    const currentIdx = zoomLevels.findIndex(z => z >= zoom - 0.001);
    if (currentIdx < zoomLevels.length - 1) setZoom(zoomLevels[currentIdx + 1]);
  };
  const handleZoomOut = () => {
    const currentIdx = zoomLevels.findIndex(z => z >= zoom - 0.001);
    if (currentIdx > 0) setZoom(zoomLevels[currentIdx - 1]);
  };

  // Base canvas size - matching typical mug printable area (3:1 aspect ratio)
  const baseWidth = 900;
  const baseHeight = 300;

  return (
    <div className="flex h-full">
      <Sidebar
        onImageUpload={handleSidebarImageUpload}
        recentImages={recentImages}
        onToolSelect={handleToolSelect}
      />
      
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Main Toolbar */}
        {selectedTool === 'text' ? (
          <TextToolbar
            selectedText={selectedText}
            currentTextProps={currentTextProps}
            handleFontFamilyChange={handleFontFamilyChange}
            handleFontSizeChange={handleFontSizeChange}
            handleIncreaseFontSize={handleIncreaseFontSize}
            handleDecreaseFontSize={handleDecreaseFontSize}
            handleTextColorChange={handleTextColorChange}
            handleTextStyleToggle={handleTextStyleToggle}
            handleTextAlignChange={handleTextAlignChange}
            handleTextList={handleTextList}
            handleTextSpacing={handleTextSpacing}
            handleTextOpacityChange={handleTextOpacityChange}
            handleTextRotate={handleTextRotate}
            handleTextFlip={handleTextFlip}
            handleTextDuplicate={handleTextDuplicate}
            handleTextLock={handleTextLock}
            handleTextCopyStyle={handleTextCopyStyle}
            handleDeleteText={handleDeleteText}
            handleCaseChange={handleCaseChange}
            handleCurveChange={handleCurveChange}
            undo={undo}
            redo={redo}
            currentStep={currentStep}
            history={history}
          />
        ) : selectedGraphicId ? (
          <GraphicsToolbar
            selectedGraphic={graphics.find(g => g.id === selectedGraphicId)}
            onDuplicate={handleGraphicDuplicate}
            onDelete={handleDeleteGraphic}
            onLock={handleGraphicLock}
            onOpacityChange={handleGraphicOpacityChange}
            onBorderWidthChange={handleGraphicBorderWidthChange}
            onCenter={handleGraphicCenter}
            onMiddle={handleGraphicMiddle}
            onArrangeLayer={handleGraphicArrangeLayer}
            opacity={graphicOpacity}
            borderWidth={graphicBorderWidth}
          />
        ) : (
          <ImageToolbar
            selectedTool={selectedTool}
            handleToolSelect={handleToolSelect}
            handleReplace={handleReplace}
            handleRemoveBG={handleRemoveBG}
            removeBgLoading={removeBgLoading}
            showAdjustDropdown={showAdjustDropdown}
            setShowAdjustDropdown={setShowAdjustDropdown}
            adjustDropdownRef={adjustDropdownRef}
            brightness={konvaBrightness}
            contrast={konvaContrast}
            saturation={konvaSaturation}
            hue={konvaHue}
            setBrightness={setBrightness}
            setContrast={setContrast}
            setSaturation={setSaturation}
            setHue={setHue}
            handleSliderChange={handleSliderChange}
            image={image}
            undo={undo}
            redo={redo}
            currentStep={currentStep}
            history={history}
            applyCrop={applyCrop}
            handleDeleteText={handleDeleteText}
            selectedText={selectedText}
          />
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Zoom Control - Bottom Left, aligned with sidebar */}
          <div className="fixed left-0 bottom-0 z-30 mb-6 ml-6 flex items-center gap-2 bg-white/90 rounded-lg shadow px-3 py-2 border border-gray-200"
               style={{ minWidth: 220 }}>
            <button
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-lg font-bold"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              type="button"
              disabled={zoom <= zoomLevels[0]}
            >−</button>
            <input
              type="range"
              min={zoomLevels[0]}
              max={zoomLevels[zoomLevels.length - 1]}
              step={0.01}
              value={zoom}
              onChange={e => handleZoomChange(e.target.value)}
              className="w-32"
            />
            <button
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-lg font-bold"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              type="button"
              disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
            >+</button>
            <select
              value={zoom}
              onChange={e => handleZoomChange(e.target.value)}
              className="text-sm px-2 py-1 rounded border border-gray-300 bg-white"
            >
              {zoomLevels.map(z => (
                <option key={z} value={z}>{Math.round(z * 100)}%</option>
              ))}
            </select>
            <span className="text-xs text-gray-500 ml-2">{Math.round(zoom * 100)}%</span>
          </div>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(203, 213, 225, 0.3)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
              }}
            />
          </div>
          
          {/* Canvas Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-auto border border-gray-200" style={{ width: baseWidth * zoom, height: baseHeight * zoom }}>
            {/* Canvas Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white to-transparent p-4 z-10 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Design Canvas</span>
                <span className="text-xs text-gray-500">{baseWidth * zoom} × {baseHeight * zoom} px</span>
              </div>
            </div>

            <Stage
              ref={stageRef}
              width={baseWidth * zoom}
              height={baseHeight * zoom}
              style={{ backgroundColor: canvasColor, display: 'block' }}
              scaleX={zoom}
              scaleY={zoom}
              x={stagePos.x}
              y={stagePos.y}
              onMouseDown={handleStageMouseDown}
            >
              {/* Background Layer */}
              <Layer>
                {imageUrl && (
                  <>
                    <KonvaImage
                      ref={imageRef}
                      image={image}
                      x={imgAttrs.x}
                      y={imgAttrs.y}
                      scaleX={imgAttrs.scaleX}
                      scaleY={imgAttrs.scaleY}
                      rotation={imgAttrs.rotation}
                      draggable={selectedTool === 'select' && !isCropping}
                      onClick={handleImgClick}
                      onDragEnd={handleImgTransformEnd}
                      onTransformEnd={handleImgTransformEnd}
                      filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]}
                      brightness={konvaBrightness}
                      contrast={konvaContrast}
                      saturation={konvaSaturation}
                      hue={konvaHue}
                      luminance={konvaLuminance}
                    />
                    {selected && !isCropping && (
                      <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                          if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                          }
                          return newBox;
                        }}
                      />
                    )}
                  </>
                )}
              </Layer>

              {/* Crop Layer */}
              {isCropping && (
                <Layer>
                  <Rect
                    ref={cropRectRef}
                    x={cropRect?.x || 50}
                    y={cropRect?.y || 50}
                    width={cropRect?.width || 200}
                    height={cropRect?.height || 200}
                    stroke="#fff"
                    strokeWidth={1}
                    dash={[4, 4]}
                    draggable
                    onDragEnd={handleCropRectChange}
                    onTransformEnd={handleCropRectChange}
                  />
                  <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 20 || newBox.height < 20) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              )}
              
              {/* Graphics Layer */}
              <Layer ref={graphicsLayerRef}>
                {graphics.map((graphic) => {
                  const commonProps = {
                    key: graphic.id,
                    id: `graphic-${graphic.id}`,
                    x: graphic.x,
                    y: graphic.y,
                    fill: graphic.fill,
                    stroke: graphic.stroke,
                    strokeWidth: graphic.strokeWidth,
                    draggable: true,
                    onClick: () => {
                      if (selectedGraphicId === graphic.id) {
                        setSelectedGraphicId(null);
                      } else {
                        setSelectedGraphicId(graphic.id);
                      }
                    },
                    onDragEnd: (e) => handleGraphicTransform(graphic.id, e.target),
                    onTransformEnd: (e) => handleGraphicTransform(graphic.id, e.target),
                  };

                  switch (graphic.type) {
                    case 'rect':
                      return <KonvaRect {...commonProps} width={graphic.width} height={graphic.height} />;
                    case 'circle':
                      return <KonvaCircle {...commonProps} radius={graphic.radius} />;
                    case 'triangle':
                    case 'polygon':
                      return <RegularPolygon {...commonProps} sides={graphic.sides} radius={graphic.radius} />;
                    case 'star':
                      return <KonvaStar {...commonProps} numPoints={graphic.numPoints} innerRadius={graphic.innerRadius} outerRadius={graphic.outerRadius} />;
                    case 'image':
                      return <ImageGraphic key={graphic.id} graphic={graphic} commonProps={commonProps} />;
                    default:
                      return null;
                  }
                })}
                
                {selectedGraphicId && (
                  <Transformer
                    ref={graphicsTrRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Layer>

              {/* Text Layer */}
              {texts && texts.length > 0 && (
                <TextLayer
                  texts={texts}
                  selectedText={selectedText}
                  onTextSelect={handleTextSelect}
                  onTextTransform={handleTextTransform}
                  onTextDblClick={handleTextDblClick}
                  stageRef={stageRef}
                />
              )}
            </Stage>

            {/* Canvas Background Color Picker */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">Canvas Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={canvasColor}
                    onChange={(e) => setCanvasColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">{canvasColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphics Panel */}
      <GraphicsPanel
        visible={isGraphicsPanelOpen}
        onClose={() => setIsGraphicsPanelOpen(false)}
        searchValue={graphicsSearch}
        onSearchChange={setGraphicsSearch}
      >
        <GraphicsTabs
          currentTab={graphicsTab}
          onTabChange={setGraphicsTab}
        >
          <div className="grid grid-cols-3 gap-2 p-4">
            {getFilteredItems(GRAPHICS_ITEMS[graphicsTab] || [], graphicsSearch).map((item) => (
              <GraphicsItem
                key={item.key}
                thumbnail={item.thumbnail}
                label={item.label}
                onAdd={() => handleAddGraphic(item)}
              />
            ))}
          </div>
        </GraphicsTabs>
      </GraphicsPanel>

      {/* Text Editor Modal */}
      <TextEditorModal
        isOpen={isTextModalOpen}
        onClose={() => {
          setIsTextModalOpen(false);
          setEditingTextAttributes(null);
          setSelectedText(null);
        }}
        onSave={handleSaveText}
        initialText={editingTextAttributes}
      />

      {/* Loading Indicator */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-lg font-semibold text-purple-700">Processing image...</span>
        </div>
      )}
    </div>
  );
});

export default ImageEditor;