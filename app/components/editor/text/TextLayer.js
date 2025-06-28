import React, { useRef, useEffect } from 'react';
import { Layer, Text, Group, Transformer, Rect } from 'react-konva';

const CURVE_MAP = {
  fullCurveUp: { curvature: -0.04 },
  slightCurveUp: { curvature: -0.01 },
  straight: { curvature: 0 },
  slightCurveDown: { curvature: 0.01 },
  fullCurveDown: { curvature: 0.04 },
};

// Utility to calculate 8 evenly distributed anchor points for a text element
function getTextAnchors(textObj) {
  const { fontSize, text, scaleX = 1, scaleY = 1, rotation = 0, x = 0, y = 0 } = textObj;
  const width = (text.length || 1) * (fontSize / 1.7) * scaleX;
  const height = fontSize * scaleY;
  // 8 points: 4 corners, 4 edge midpoints (clockwise from top-left)
  const points = [
    { x: 0, y: 0 }, // top-left
    { x: width / 2, y: 0 }, // top-center
    { x: width, y: 0 }, // top-right
    { x: width, y: height / 2 }, // right-center
    { x: width, y: height }, // bottom-right
    { x: width / 2, y: height }, // bottom-center
    { x: 0, y: height }, // bottom-left
    { x: 0, y: height / 2 }, // left-center
  ];
  // Apply rotation and translation
  const rad = (rotation * Math.PI) / 180;
  return points.map(pt => {
    const rx = pt.x * Math.cos(rad) - pt.y * Math.sin(rad);
    const ry = pt.x * Math.sin(rad) + pt.y * Math.cos(rad);
    return { x: rx + x, y: ry + y };
  });
}

const TextLayer = ({ texts = [], selectedText, onTextSelect, onTextTransform, onTextDblClick, stageRef }) => {
  const trRef = useRef();
  const layerRef = useRef();

  // Attach Transformer to selected text group
  useEffect(() => {
    // Wait for the layer to be ready
    if (!layerRef.current) return;

    // Clear existing transformer
    if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }

    // If no text is selected, we're done
    if (!selectedText || !stageRef?.current) return;

    // Find the selected node
    const stage = stageRef.current;
    const selectedNode = stage.findOne(`#text-group-${selectedText}`);

    // Only attach transformer if we found the node and it's visible
    if (selectedNode && selectedNode.isVisible()) {
      requestAnimationFrame(() => {
        if (trRef.current) {
          trRef.current.nodes([selectedNode]);
          trRef.current.getLayer()?.batchDraw();
        }
      });
    }

    return () => {
      if (trRef.current) {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }
    };
  }, [selectedText, stageRef, texts]);

  // Handle text transform end (for both drag and transform)
  const handleTransformEnd = (e, text) => {
    if (!e.target) return;
    
    const node = e.target;
    onTextTransform(text.id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
  };

  // Attach anchors to each text object for API/export (not rendered)
  const textsWithAnchors = texts.map(t => ({ ...t, anchors: getTextAnchors(t) }));

  return (
    <Layer ref={layerRef}>
      {textsWithAnchors.map((text) => (
        !text.editing && (
          <Group
            key={text.id}
            id={`text-group-${text.id}`}
            x={text.x}
            y={text.y}
            rotation={text.rotation}
            scaleX={text.scaleX}
            scaleY={text.scaleY}
            draggable={!text.locked}
            onClick={() => onTextSelect(text.id)}
            onDblClick={() => { if (!text.locked) onTextDblClick(text.id); }}
            onDragEnd={(e) => !text.locked && handleTransformEnd(e, text)}
            onTransformEnd={(e) => !text.locked && handleTransformEnd(e, text)}
          >
            {/* Curve text rendering */}
            {text.curveType && CURVE_MAP[text.curveType]?.curvature !== 0 ? (
              Array.from(text.text).map((char, i) => {
                const curvature = CURVE_MAP[text.curveType].curvature;
                const x = i * (text.fontSize / 1.7);
                const y = Math.pow(i - text.text.length / 2, 2) * curvature * text.fontSize;
                return (
                  <Text
                    key={i}
                    text={char}
                    fontSize={text.fontSize}
                    fontFamily={text.fontFamily}
                    fill={text.fill}
                    align={text.align || 'left'}
                    letterSpacing={text.letterSpacing || 0}
                    fontStyle={text.fontStyle?.includes('bold') && text.fontStyle?.includes('italic') ? 'bold italic' : text.fontStyle?.includes('bold') ? 'bold' : text.fontStyle?.includes('italic') ? 'italic' : 'normal'}
                    x={x}
                    y={y}
                    opacity={text.opacity}
                  />
                );
              })
            ) : (
              <Text
                text={text.text}
                fontSize={text.fontSize}
                fontFamily={text.fontFamily}
                fill={text.fill}
                align={text.align || 'left'}
                letterSpacing={text.letterSpacing || 0}
                fontStyle={text.fontStyle?.includes('bold') && text.fontStyle?.includes('italic') ? 'bold italic' : text.fontStyle?.includes('bold') ? 'bold' : text.fontStyle?.includes('italic') ? 'italic' : 'normal'}
                x={0}
                y={0}
                opacity={text.opacity}
              />
            )}
            {text.fontStyle?.includes('underline') && (
              <Rect
                x={0}
                y={text.fontSize}
                width={text.text.length * (text.fontSize / 2)}
                height={2}
                fill={text.fill}
              />
            )}
            {text.locked && (
              <Text
                text="🔒"
                fontSize={text.fontSize * 0.8}
                x={0}
                y={-text.fontSize * 1.2}
                fill="#d97706"
                listening={false}
              />
            )}
          </Group>
        )
      ))}
      {selectedText && !texts.find(t => t.id === selectedText)?.editing && (
        <Transformer
          ref={trRef}
          resizeEnabled={true}
          rotateEnabled={true}
          boundBoxFunc={(oldBox, newBox) => {
            // Prevent scaling to zero
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Layer>
  );
};

// Export utility for API/3D mapping
export function getTextAnchorsForExport(texts) {
  return texts.map(t => ({ id: t.id, anchors: getTextAnchors(t) }));
}

export default TextLayer;