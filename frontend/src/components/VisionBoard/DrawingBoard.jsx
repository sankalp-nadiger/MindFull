import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text as KonvaText, Image, Line, Circle, Group, Transformer, Rect } from "react-konva";
import useImage from "use-image";
import SaveCanvasModal from "./SaveCanvasModal";
import { 
  Pen, Type, MousePointer, Share2, Image as ImageIcon, Plus, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, Palette, Upload, Bold, Italic, AlignLeft, Trash2, Move,
  Save, Download, Minimize2, Maximize2, CornerRightDown
} from 'lucide-react';

const URLImage = ({ element, onDragEnd, onSelect, isSelected, onResize, tool }) => {
  const [img] = useImage(element.src);
  const imageRef = useRef();
  const trRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current && tool === 'select') {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, tool]);

  const handleTransformEnd = () => {
    if (imageRef.current && onResize) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      const newWidth = Math.max(10, node.width() * scaleX);
      const newHeight = Math.max(10, node.height() * scaleY);
      
      // Reset scale to 1 after applying to width/height
      node.scaleX(1);
      node.scaleY(1);
      
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        rotation: node.rotation()
      });
    }
  };

  const handleImageClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
    // Only select if not dragging
    if (!isDragging) {
      onSelect(element.id);
    }
  };

  const handleDragStart = (e) => {
    if (tool !== 'select') return;
    
    const pos = e.target.position();
    setDragStartPos({ x: pos.x, y: pos.y });
    setIsDragging(false);
    onSelect(element.id);
  };

  const handleDragMove = (e) => {
    if (tool !== 'select' || !dragStartPos) return;
    
    const pos = e.target.position();
    const distance = Math.sqrt(
      Math.pow(pos.x - dragStartPos.x, 2) + Math.pow(pos.y - dragStartPos.y, 2)
    );
    
    // Only start dragging if moved more than 5 pixels
    if (distance > 5 && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = (e) => {
    if (tool !== 'select') return;
    
    // Always update position on drag end, regardless of isDragging state
    if (onResize) {
      const pos = e.target.position();
      onResize(element.id, {
        ...element,
        x: pos.x,
        y: pos.y
      });
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStartPos(null);
  };

  return (
    <Group>
      <Image
        ref={imageRef}
        image={img}
        x={element.x}
        y={element.y}
        width={element.width || (img ? img.width : 100)}
        height={element.height || (img ? img.height : 100)}
        rotation={element.rotation || 0}
        draggable={tool === 'select'}
        onClick={handleImageClick}
        onTap={handleImageClick}
        listening={true}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransform={handleTransformEnd}
        onTransformEnd={handleTransformEnd}
        // Remove dragBoundFunc to allow free dragging when in select mode
      />

      {isSelected && tool === 'select' && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          onTransform={handleTransformEnd}
          onTransformEnd={handleTransformEnd}
          enabledAnchors={[
            'top-left', 'top-right', 
            'bottom-left', 'bottom-right',
            'middle-left', 'middle-right',
            'top-center', 'bottom-center'
          ]}
          rotateEnabled={true}
          borderEnabled={true}
          borderStroke="#0066ff"
          borderStrokeWidth={2}
          anchorFill="#fff"
          anchorStroke="#0066ff"
          anchorSize={10}
          anchorStrokeWidth={2}
          anchorCornerRadius={2}
          keepRatio={false}
          centeredScaling={false}
          ignoreStroke={true}
          padding={5}
          rotateAnchorOffset={30}
          flipEnabled={false}
        />
      )}
    </Group>
  );
};

// Enhanced FlowLine component with fixed dragging and endpoint positioning
const FlowLineComponent = ({ line, isSelected, onSelect, onDragEnd, onUpdate, tool }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const lineRef = useRef();
  const groupRef = useRef();

  // Use line.points directly, no local state
  const points = line.points || [50, 50, 200, 50];

  const handleEndpointDrag = (index, e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
    
    const pos = e.target.position();
    const newPoints = [...points];
    newPoints[index * 2] = pos.x;
    newPoints[index * 2 + 1] = pos.y;
    
    if (onUpdate) {
      onUpdate(line.id, { ...line, points: newPoints });
    }
  };

  const handleLineClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
    if (!isDragging) {
      onSelect(line.id);
    }
  };

  const handleLineDragStart = (e) => {
    if (tool !== 'select') return;
    
    const pos = e.target.position();
    setDragStartPos({ x: pos.x, y: pos.y });
    setIsDragging(false);
    onSelect(line.id);
    
    // Prevent line from moving during drag start
    e.target.position({ x: 0, y: 0 });
  };

  const handleLineDragMove = (e) => {
    if (tool !== 'select' || !dragStartPos) return;
    
    const pos = e.target.position();
    const distance = Math.sqrt(
      Math.pow(pos.x - dragStartPos.x, 2) + Math.pow(pos.y - dragStartPos.y, 2)
    );
    
    // Only start dragging if moved more than 5 pixels
    if (distance > 5 && !isDragging) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      // Calculate delta from drag start
      const deltaX = pos.x - dragStartPos.x;
      const deltaY = pos.y - dragStartPos.y;
      
      // Update line points by adding delta
      const newPoints = [
        points[0] + deltaX,
        points[1] + deltaY,
        points[2] + deltaX,
        points[3] + deltaY
      ];
      
      if (onUpdate) {
        onUpdate(line.id, { ...line, points: newPoints });
      }
      
      // Update drag start position for next movement
      setDragStartPos({ x: pos.x, y: pos.y });
    }
    
    // Keep line at origin to prevent double movement
    e.target.position({ x: 0, y: 0 });
  };

  const handleLineDragEnd = (e) => {
    if (tool !== 'select') return;
    
    // Reset drag state
    setIsDragging(false);
    setDragStartPos(null);
    
    // Ensure line stays at origin
    e.target.position({ x: 0, y: 0 });
  };

  return (
    <Group ref={groupRef}>
      <Line
        ref={lineRef}
        points={points}
        stroke={line.color || "#000000"}
        strokeWidth={line.strokeWidth || 2}
        hitStrokeWidth={Math.max(20, (line.strokeWidth || 2) * 4)}
        draggable={tool === 'select' && isSelected}
        onClick={handleLineClick}
        onTap={handleLineClick}
        onDragStart={handleLineDragStart}
        onDragMove={handleLineDragMove}
        onDragEnd={handleLineDragEnd}
        listening={true}
        lineCap="round"
        lineJoin="round"
      />
      
      {isSelected && tool === 'select' && points.length >= 4 && (
        <>
          <Circle
            x={points[0]}
            y={points[1]}
            radius={8}
            fill="#fff"
            stroke={line.color || "#000000"}
            strokeWidth={2}
            draggable={true}
            onDragMove={(e) => handleEndpointDrag(0, e)}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            listening={true}
          />
          <Circle
            x={points[2]}
            y={points[3]}
            radius={8}
            fill="#fff"
            stroke={line.color || "#000000"}
            strokeWidth={2}
            draggable={true}
            onDragMove={(e) => handleEndpointDrag(1, e)}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            listening={true}
          />
        </>
      )}
    </Group>
  );
};


const ColorPalette = ({ onColorSelect, currentColor }) => {
  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
    "#008000", "#800000", "#008080", "#FFC0CB", "#A52A2A"
  ];

  return (
    <div className="grid grid-cols-5 gap-2 p-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110 ${
            currentColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
          }`}
          style={{ 
            backgroundColor: color,
            border: color === '#FFFFFF' ? '1px solid #E5E7EB' : 'none'
          }}
        />
      ))}
      <input
        type="color"
        value={currentColor}
        onChange={(e) => onColorSelect(e.target.value)}
        className="w-6 h-6 cursor-pointer"
        title="Custom Color"
      />
    </div>
  );
};

const ContextMenu = ({ selectedElement, position, onClose, onUpdateElement, onDelete }) => {
  if (!selectedElement) return null;

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        minWidth: '200px'
      }}
    >
      <div className="p-2 text-sm font-medium text-gray-700 border-b border-gray-200">
        {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Options
      </div>
      
      {(selectedElement.type === 'text' || selectedElement.type === 'flowLine') && (
        <div className="p-2 space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Color</label>
            <ColorPalette
              currentColor={selectedElement.color || '#000000'}
              onColorSelect={(color) => onUpdateElement({ ...selectedElement, color })}
            />
          </div>
          
          {selectedElement.type === 'text' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Font Size</label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 24}
                  onChange={(e) => onUpdateElement({ 
                    ...selectedElement, 
                    fontSize: parseInt(e.target.value) 
                  })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="8"
                  max="72"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Font Family</label>
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => onUpdateElement({ 
                    ...selectedElement, 
                    fontFamily: e.target.value 
                  })}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </>
          )}
          
          {selectedElement.type === 'flowLine' && (
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Line Width</label>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedElement.strokeWidth || 2}
                onChange={(e) => onUpdateElement({
                  ...selectedElement,
                  strokeWidth: parseInt(e.target.value)
                })}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      <div className="p-2 space-y-2">
        <button
          onClick={() => onDelete(selectedElement.id)}
          className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

// 2. Updated TextNode component with better transform handling
const TextNode = ({ text, isSelected, onSelect, onChange, tool }) => {
  const textRef = useRef();
  const trRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current && tool === 'select') {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, tool]);

  const handleTransform = () => {
    if (textRef.current && onChange) {
      const node = textRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();

      // Calculate new font size based on average scale
      const newFontSize = Math.max(8, Math.round((text.fontSize || 24) * Math.max(scaleX, scaleY)));

      // Update the element with new properties
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y(),
        rotation: rotation,
        fontSize: newFontSize
      });

      // Reset scale to 1 after applying to fontSize
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  const handleClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
    // Only select if not dragging
    if (!isDragging) {
      onSelect(text.id);
    }
  };

  const handleDragStart = (e) => {
    if (tool !== 'select') return;
    
    const pos = e.target.position();
    setDragStartPos({ x: pos.x, y: pos.y });
    setIsDragging(false);
    onSelect(text.id);
  };

  const handleDragMove = (e) => {
    if (tool !== 'select' || !dragStartPos) return;
    
    const pos = e.target.position();
    const distance = Math.sqrt(
      Math.pow(pos.x - dragStartPos.x, 2) + Math.pow(pos.y - dragStartPos.y, 2)
    );
    
    // Only start dragging if moved more than 5 pixels
    if (distance > 5 && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = (e) => {
    if (tool !== 'select') return;
    
    // Always update position on drag end, regardless of isDragging state
    if (onChange) {
      const pos = e.target.position();
      onChange(text.id, {
        ...text,
        x: pos.x,
        y: pos.y
      });
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStartPos(null);
  };

  return (
    <Group>
      <KonvaText
        ref={textRef}
        text={text.text || text.content}
        x={text.x}
        y={text.y}
        fontSize={text.fontSize || 24}
        fontFamily={text.fontFamily || 'Arial'}
        fill={text.color || text.fill || '#000000'}
        draggable={tool === 'select'}
        rotation={text.rotation || 0}
        fontStyle={text.fontStyle || 'normal'}
        onClick={handleClick}
        onTap={handleClick}
        listening={true}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        onTransformEnd={handleTransform}
        // Remove dragBoundFunc to allow free dragging when in select mode
      />
      {isSelected && tool === 'select' && (
        <Transformer
          ref={trRef}
          enabledAnchors={[
            'top-left', 'top-right',
            'bottom-left', 'bottom-right',
            'middle-left', 'middle-right',
            'top-center', 'bottom-center'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10) newBox.width = 10;
            if (newBox.height < 5) newBox.height = 5;
            return newBox;
          }}
          onTransform={handleTransform}
          onTransformEnd={handleTransform}
          rotateEnabled={true}
          keepRatio={false}
          anchorFill="#ffffff"
          anchorStroke="#0066ff"
          borderStroke="#0066ff"
          borderStrokeWidth={2}
          borderDash={[]}
          anchorSize={8}
          anchorStrokeWidth={2}
          anchorCornerRadius={2}
          centeredScaling={false}
          ignoreStroke={false}
          padding={2}
          rotateAnchorOffset={20}
          flipEnabled={false}
        />
      )}
    </Group>
  );
};

const DrawingBoard = ({ onSave }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tool, setTool] = useState("select");
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);
  const [lines, setLines] = useState([]);  
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [text, setText] = useState({ 
    content: "", 
    fontSize: 24, // Changed from 16 to 24
    fontFamily: 'Arial',
    color: '#000000',
    isBold: false,
    isItalic: false
});
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 48,
    height: window.innerHeight - 160
  });
  const [canvasBackground, setCanvasBackground] = useState("#FFFFFF");
  const containerRef = useRef();
  const stageRef = useRef();
  const fileInputRef = useRef();
  const isDrawing = useRef(false);
  const [scale, setScale] = useState(1);
const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
const [penPoints, setPenPoints] = useState([]);
const [flowLine, setFlowLine] = useState(null);
const [contextMenu, setContextMenu] = useState({ show: false, position: { x: 0, y: 0 }, element: null });
const [isToolboxMinimized, setIsToolboxMinimized] = useState(false);
const [lineStyle, setLineStyle] = useState('straight');
const [isPlacingElement, setIsPlacingElement] = useState(false);
const [elementToPlace, setElementToPlace] = useState(null);
const [isErasing, setIsErasing] = useState(false);
  // Handle canvas resize with fixed width
useEffect(() => {
  const handleResize = () => {
    const container = containerRef.current;
    if (container) {
      setDimensions({
        width: window.innerWidth - 48, // Fixed width with padding
        height: window.innerHeight - 160 // Fixed height with padding for toolbar
      });
      
      // Only update stage dimensions if stageRef exists
      if (stageRef.current) {
        const containerRect = container.getBoundingClientRect();
        stageRef.current.width(containerRect.width);
        stageRef.current.height(containerRect.height);
      }
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  useEffect(() => {
  if (isPlacingElement) {
    document.body.style.cursor = 'crosshair';
  } else if (tool === 'eraser') {
    document.body.style.cursor = 'crosshair';
  } else if (tool === 'pen') {
    document.body.style.cursor = 'crosshair';
  } else {
    document.body.style.cursor = 'default';
  }
  return () => {
    document.body.style.cursor = 'default';
  };
}, [isPlacingElement, tool]);

  // Cursor effect for different tools
  useEffect(() => {
    let cursorStyle = 'default';
    
    if (isPlacingElement) {
      cursorStyle = 'crosshair';
    } else if (tool === 'eraser') {
      cursorStyle = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=) 12 12, auto';
    } else if (tool === 'pen') {
      cursorStyle = 'crosshair';
    } else if (tool === 'select') {
      cursorStyle = 'pointer';
    }
    
    document.body.style.cursor = cursorStyle;
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isPlacingElement, tool]);

  const handleZoom = (direction) => {
    const newScale = direction === 'in' ? scale * 1.2 : scale / 1.2;
    setScale(Math.min(Math.max(0.1, newScale), 3)); // Limit scale between 0.1 and 3
  };

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        // Scale down large images to a reasonable size
        const maxWidth = 300;
        const maxHeight = 300;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Calculate center position relative to the current viewport
        const centerX = (dimensions.width / 2 / scale) - (width / 2) - (stagePos.x / scale);
        const centerY = (dimensions.height / 2 / scale) - (height / 2) - (stagePos.y / scale);
        
        const imageElement = {
          id: Date.now().toString(),
          type: 'image',
          src: event.target.result,
          x: centerX,
          y: centerY,
          width: width,
          height: height,
          originalWidth: img.width,
          originalHeight: img.height,
          rotation: 0
        };
        setElements(prevElements => [...prevElements, imageElement]);
        setSelectedId(imageElement.id);
        // Force tool to select for immediate interaction
        setTool('select');
      };
    };
    reader.readAsDataURL(file);
  }
};

  // Render element handlers
 const handleElementUpdate = (id, newProps) => {
  setElements(prevElements => 
    prevElements.map((el) => 
      el.id === id ? { ...el, ...newProps } : el
    )
  );
};

 const handleElementSelect = (id) => {
  setSelectedId(id);
  setContextMenu({ ...contextMenu, show: false });
};
  const handleElementDelete = (id) => {
    updateElementsWithHistory(elements.filter(el => el.id !== id));
    setContextMenu({ ...contextMenu, show: false });
    setSelectedId(null);
  };

  // Mouse event handlers
const handleMouseDown = (e) => {
  // Hide context menu on any click
  setContextMenu({ ...contextMenu, show: false });
  
  const stage = e.target.getStage();
  if (!stage) return;
  
  const pos = stage.getPointerPosition();
  if (!pos) return;

  // Check what was clicked
  const clickedElement = e.target;
  const clickedOnBackground = clickedElement === stage || 
                            (clickedElement.getClassName() === 'Rect' && clickedElement.attrs?.id === 'background');
  
  const actualPos = {
    x: (pos.x - stagePos.x) / scale,
    y: (pos.y - stagePos.y) / scale
  };

  // If we clicked on an element (not background), let the element handle its own selection
  if (!clickedOnBackground) {
    // Check if we clicked on a shape that should be selectable
    const parent = clickedElement.getParent();
    
    // For images, text, and other shapes, the element itself handles selection
    if (clickedElement.getClassName() === 'Image' || 
        clickedElement.getClassName() === 'Text' || 
        clickedElement.getClassName() === 'Line' ||
        clickedElement.getClassName() === 'Circle') {
      // The element's own click handler will handle selection
      return;
    }
  }

  // Clicked on background - handle based on current tool
  if (tool === 'select') {
    setSelectedId(null);
    return;
  }

  // Handle other tool actions on background
  switch (tool) {
    case 'pen':
      isDrawing.current = true;
      setPenPoints([
        ...penPoints,
        { points: [actualPos.x, actualPos.y], color: penColor, width: penWidth }
      ]);
      break;

    case 'eraser':
      setIsErasing(true);
      handleEraser(e);
      break;

    case 'text':
      if (text.content.trim()) {
        const newText = {
          id: Date.now().toString(),
          type: 'text',
          x: actualPos.x,
          y: actualPos.y,
          text: text.content,
          content: text.content,
          fontSize: text.fontSize,
          fontFamily: text.fontFamily,
          fill: text.color,
          color: text.color,
          fontStyle: `${text.isBold ? 'bold' : ''} ${text.isItalic ? 'italic' : ''}`.trim() || 'normal',
          draggable: true
        };
        setElements(prevElements => [...prevElements, newText]);
        setSelectedId(newText.id);
        setText({ ...text, content: '' });
        setTool('select');
      }
      break;

    case 'flowLine':
      isDrawing.current = true;
      const newLine = {
        id: Date.now().toString(),
        type: 'flowLine',
        points: [actualPos.x, actualPos.y, actualPos.x + 100, actualPos.y],
        color: penColor,
        strokeWidth: penWidth
      };
      setFlowLine(newLine);
      break;
  }
};

 const handleMouseUp = () => {
  if (tool === 'pen' && isDrawing.current && penPoints.length > 0) {
    const lastLine = penPoints[penPoints.length - 1];
    if (lastLine && lastLine.points.length > 2) {
      const newElement = {
        id: Date.now().toString(),
        type: 'drawing',
        points: lastLine.points,
        color: lastLine.color,
        strokeWidth: lastLine.width
      };
      setElements(prev => [...prev, newElement]);
      setPenPoints([]); // Clear pen points after adding to elements
    }
  }
  
  if (tool === 'flowLine' && flowLine && isDrawing.current) {
    const [x1, y1, x2, y2] = flowLine.points;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    if (distance > 5) {
      setElements(prevElements => [...prevElements, { ...flowLine }]);
      setSelectedId(flowLine.id);
    }
    setFlowLine(null);
  }
  
  isDrawing.current = false;
  setIsErasing(false);
};



 const handleMouseMove = (e) => {
  const stage = e.target.getStage();
  if (!stage) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  const actualPos = {
    x: (pos.x - stagePos.x) / scale,
    y: (pos.y - stagePos.y) / scale
  };

  if (tool === 'pen' && isDrawing.current && penPoints.length > 0) {
    const lastLine = penPoints[penPoints.length - 1];
    if (lastLine) {
      const newPoints = [...lastLine.points, actualPos.x, actualPos.y];
      setPenPoints(prevPoints => [
        ...prevPoints.slice(0, -1),
        { ...lastLine, points: newPoints }
      ]);
    }
  } else if (tool === 'flowLine' && flowLine && isDrawing.current) {
    setFlowLine({
      ...flowLine,
      points: [flowLine.points[0], flowLine.points[1], actualPos.x, actualPos.y]
    });
  } else if (tool === 'eraser' && isErasing) {
    handleEraser(e);
  }
};


  const handleLineStyleChange = (style) => {
    setLineStyle(style);
  };

  const handleAddText = () => {
    setElementToPlace({
      type: 'text',
      content: text.content,
      fontSize: text.fontSize,
      fontFamily: text.fontFamily,
      color: text.color,
      isBold: text.isBold,
      isItalic: text.isItalic
    });
    setIsPlacingElement(true);
  };

  const handleAddFlowLine = () => {
    setElementToPlace({
      type: 'flowLine',
      color: penColor,
      strokeWidth: penWidth,
      style: lineStyle
    });
    setIsPlacingElement(true);
  };

  const handleCanvasClick = (e) => {
    if (!isPlacingElement || !elementToPlace) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scale = stage.scaleX();

    if (elementToPlace.type === 'text') {
      const newText = {
        id: Date.now().toString(),
        type: 'text',
        content: elementToPlace.content,
        x: pos.x / scale,
        y: pos.y / scale,
        fontSize: elementToPlace.fontSize,
        fontFamily: elementToPlace.fontFamily,
        color: elementToPlace.color,
        isBold: elementToPlace.isBold,
        isItalic: elementToPlace.isItalic
      };
      setElements([...elements, newText]);
    } else if (elementToPlace.type === 'flowLine') {
      const newLine = {
        id: Date.now().toString(),
        type: 'flowLine',
        points: [pos.x / scale, pos.y / scale, (pos.x / scale) + 100, pos.y / scale],
        color: elementToPlace.color,
        strokeWidth: elementToPlace.strokeWidth,
        style: elementToPlace.style
      };
      setElements([...elements, newLine]);
    }

    setIsPlacingElement(false);
    setElementToPlace(null);
    document.body.style.cursor = 'default';
  };

  const downloadCanvas = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL();
      const link = document.createElement('a');
      link.download = 'vision-board.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleSaveBoard = (boardData) => {
  // Get canvas data
  const canvasData = {
    elements: elements,
    canvasBackground: canvasBackground,
    dimensions: dimensions,
    scale: scale,
    timestamp: new Date().toISOString(),
    ...boardData
  };
  
  // Call the onSave prop if provided
  if (onSave) {
    onSave(canvasData);
  }
  
  // You can also save to localStorage or send to server here
  localStorage.setItem('visionBoard', JSON.stringify(canvasData));
  
  console.log('Board saved:', canvasData);
  setShowSaveModal(false);
};
  const ActionButtons = () => (
  <div className="absolute top-4 right-4 z-40 flex gap-2">
    <button
      onClick={() => setShowSaveModal(true)}
      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 shadow-lg"
    >
      <Save className="w-4 h-4" />
      Save Board
    </button>
    <button
      onClick={downloadCanvas}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-lg"
    >
      <Download className="w-4 h-4" />
      Download PNG
    </button>
  </div>
);

  const ToolBar = () => (
    <div className={`absolute top-4 left-4 z-40 transition-all duration-300 ${
      isToolboxMinimized ? 'w-12' : tool === 'text' ? 'w-[400px]' : 'w-[300px]'
    }`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          {!isToolboxMinimized && <h3 className="text-lg font-semibold text-gray-800">Tools</h3>}
          <button
            onClick={() => setIsToolboxMinimized(!isToolboxMinimized)}
            className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            {isToolboxMinimized ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {!isToolboxMinimized && (
          <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-4">
              {/* Canvas Controls */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleUndo}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  disabled={elements.length === 0}
                  title="Undo (Ctrl+Z)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5"/>
                    <path d="M4 9h11c4 0 7 3 7 7v0c0 4-3 7-7 7H8"/>
                  </svg>
                </button>
                <button
                  onClick={handleRedo}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  disabled={redoStack.length === 0}
                  title="Redo (Ctrl+Y)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14l5-5-5-5"/>
                    <path d="M20 9H9C5 9 2 12 2 16v0c0 4 3 7 7 7h8"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
  onClick={() => {
    setElements([]);
    setSelectedId(null);
    setPenPoints([]);
    setUndoStack([]);
    setRedoStack([]);
  }}
  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
  title="Clear Board"
>
  <Trash2 className="w-4 h-4" />
</button>
              </div>

              {/* Canvas Background */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Canvas Background
                </label>
                <div className="flex items-center gap-2">
                  <ColorPalette
                    currentColor={canvasBackground}
                    onColorSelect={setCanvasBackground}
                  />
                </div>
              </div>

              {/* Tool Selection */}
             <div className="grid grid-cols-2 gap-2">
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'select' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('select')}
  >
    <MousePointer className="w-4 h-4" />
    <span>Select</span>
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'pen' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('pen')}
  >
    <Pen className="w-4 h-4" />
    <span>Pen</span>
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'text' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('text')}
  >
    <Type className="w-4 h-4" />
    <span>Text</span>
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'eraser' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('eraser')}
  >
    <Trash2 className="w-4 h-4" />
    <span>Eraser</span>
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'flowLine' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('flowLine')}
  >
    <CornerRightDown className="w-4 h-4" />
    <span>Flow Line</span>
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      tool === 'image' 
        ? 'bg-indigo-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => setTool('image')}
  >
    <ImageIcon className="w-4 h-4" />
    <span>Image</span>
  </button>
</div>

              {/* Tool-specific options */}
              {tool === 'text' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
  <input
    type="text"
    placeholder="Enter text..."
    value={text.content}
    onChange={(e) => setText({ ...text, content: e.target.value })}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && text.content.trim()) {
        e.preventDefault();
        // Auto-place text in center when Enter is pressed
        const centerX = (dimensions.width / 2 / scale) - 50;
        const centerY = (dimensions.height / 2 / scale) - 10;
        
        const newText = {
          id: Date.now().toString(),
          type: 'text',
          x: centerX,
          y: centerY,
          text: text.content,
          content: text.content,
          fontSize: text.fontSize,
          fontFamily: text.fontFamily,
          fill: text.color,
          color: text.color,
          fontStyle: `${text.isBold ? 'bold' : ''} ${text.isItalic ? 'italic' : ''}`.trim() || 'normal',
          draggable: true
        };
        setElements(prevElements => [...prevElements, newText]);
        setSelectedId(newText.id);
        setText({ ...text, content: '' });
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    autoFocus={tool === 'text'}
  />
  <p className="text-xs text-gray-500 mt-1">
    Press Enter to add text to center, or click canvas after typing
  </p>
</div>
                    <select
                      value={text.fontFamily}
                      onChange={(e) => setText({ ...text, fontFamily: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                    <input
                      type="number"
                      value={text.fontSize}
                      onChange={(e) => setText({ ...text, fontSize: parseInt(e.target.value) })}
                      className="px-3 py-2 border rounded-lg"
                      min="8"
                      max="72"
                      placeholder="Font size"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ColorPalette
                      currentColor={text.color}
                      onColorSelect={(color) => setText({ ...text, color })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded ${text.isBold ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setText({ ...text, isBold: !text.isBold })}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded ${text.isItalic ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setText({ ...text, isItalic: !text.isItalic })}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                  </div>
                 <p className="text-sm text-gray-600">Click on canvas to place text</p>
                </div>
              )}

              {tool === 'image' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </button>
                </div>
              )}

              {tool === 'flowLine' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Click on canvas to set start point, then drag to create line</p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Line Color</label>
                    <ColorPalette
                      currentColor={penColor}
                      onColorSelect={setPenColor}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Width: {penWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={penWidth}
                      onChange={(e) => setPenWidth(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['straight', 'curved'].map((style) => (
                      <button
                        key={style}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          lineStyle === style 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => handleLineStyleChange(style)}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                 
                </div>
              )}

{tool === 'eraser' && (
  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
    <p className="text-sm text-gray-600">Click and drag to erase drawings</p>
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Eraser Size: {penWidth * 3}px</label>
      <input
        type="range"
        min="1"
        max="10"
        value={penWidth}
        onChange={(e) => setPenWidth(parseInt(e.target.value))}
        className="w-full"
      />
    </div>
  </div>
)}
              {tool === 'pen' && (
                <div className="space-y-4 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pen Color</label>
                    <ColorPalette
                      currentColor={penColor}
                      onColorSelect={setPenColor}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Width: {penWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={penWidth}
                      onChange={(e) => setPenWidth(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced eraser functionality
  const handleEraser = (e) => {
  if (tool !== 'eraser') return;
  
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  
  if (!pos) return;
  
  const actualPos = {
    x: (pos.x - stagePos.x) / scale,
    y: (pos.y - stagePos.y) / scale
  };
  
  const eraserRadius = penWidth * 3;

  // Erase from elements array (drawings)
  setElements(prevElements => {
    return prevElements.filter(element => {
      if (element.type === 'drawing') {
        const points = element.points;
        let shouldKeep = true;
        
        for (let i = 0; i < points.length; i += 2) {
          const dx = points[i] - actualPos.x;
          const dy = points[i + 1] - actualPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < eraserRadius) {
            shouldKeep = false;
            break;
          }
        }
        return shouldKeep;
      }
      return true; // Keep non-drawing elements
    });
  });

  // Erase from pen points (current drawing)
  setPenPoints(prevPoints => {
    return prevPoints.map(line => {
      const newPoints = [];
      const points = [...line.points];

      for (let i = 0; i < points.length; i += 2) {
        const dx = points[i] - actualPos.x;
        const dy = points[i + 1] - actualPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= eraserRadius) {
          newPoints.push(points[i], points[i + 1]);
        }
      }

      return {
        ...line,
        points: newPoints
      };
    }).filter(line => line.points.length > 0);
  });
};

  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      } else if (e.key === 'Delete' && selectedId) {
        handleElementDelete(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedId]);

  const handleUndo = () => {
    if (elements.length === 0) return;
    const lastElement = elements[elements.length - 1];
    setRedoStack(prev => [...prev, lastElement]);
    setElements(prev => prev.slice(0, -1));
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const elementToRedo = redoStack[redoStack.length - 1];
    setElements(prev => [...prev, elementToRedo]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Update elements with history tracking
  const updateElementsWithHistory = (newElements) => {
    setUndoStack(prev => [...prev, elements]);
    setElements(newElements);
    setRedoStack([]);
  };

  return (
    <div className="relative">
      <div className="relative" ref={containerRef}>
    <Stage
  ref={stageRef}
  width={dimensions.width}
  height={dimensions.height}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  scaleX={scale}
  scaleY={scale}
  x={stagePos.x}
  y={stagePos.y}
  listening={true}
  onContextMenu={(e) => {
    e.evt.preventDefault();
    if (selectedId) {
      const selectedElement = elements.find(el => el.id === selectedId);
      if (selectedElement) {
        const pos = e.target.getStage().getPointerPosition();
        setContextMenu({
          show: true,
          position: { x: pos.x, y: pos.y },
          element: selectedElement
        });
      }
    }
  }}
>
        <Layer>
      {/* Fixed Background Rectangle */}
  <Rect
  id="background"
  x={-stagePos.x / scale}
  y={-stagePos.y / scale}
  width={dimensions.width / scale}
  height={dimensions.height / scale}
  fill={canvasBackground}
  listening={true} // Changed to true to capture background clicks
/>
 
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="white" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
            </pattern>
          </defs>

    {elements.map((element) => {
  switch (element.type) {
    case 'text':
      return (
        <TextNode
          key={element.id}
          text={element}
          isSelected={selectedId === element.id}
          onSelect={handleElementSelect}
          onChange={handleElementUpdate}
          tool={tool}
        />
      );
    case 'image':
      return (
        <URLImage
          key={element.id}
          element={element}
          isSelected={selectedId === element.id}
          onSelect={handleElementSelect}
          onDragEnd={handleElementUpdate}
          onResize={handleElementUpdate}
          tool={tool}
        />
      );
    case 'flowLine':
      return (
        <FlowLineComponent
          key={element.id}
          line={element}
          isSelected={selectedId === element.id}
          onSelect={handleElementSelect}
          onDragEnd={handleElementUpdate}
          onUpdate={handleElementUpdate}
          tool={tool}
        />
      );
    case 'drawing':
      return (
        <Line
          key={element.id}
          points={element.points}
          stroke={element.color}
          strokeWidth={element.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={Math.max(20, element.strokeWidth * 4)}
          onClick={(e) => {
            // Prevent event bubbling
            e.cancelBubble = true;
            if (e.evt) {
              e.evt.stopPropagation();
            }
            // Always select when clicked, regardless of tool
            handleElementSelect(element.id);
          }}
          onTap={(e) => {
            // Prevent event bubbling
            e.cancelBubble = true;
            if (e.evt) {
              e.evt.stopPropagation();
            }
            // Always select when clicked, regardless of tool
            handleElementSelect(element.id);
          }}
          listening={true}
        />
      );
    default:
      return null;
  }
})}


          {/* Draw pen lines */}
          {penPoints.map((line, index) => (
            <Line
              key={`pen-line-${index}`}
              points={line.points.flat()}
              stroke={line.color}
              strokeWidth={line.width}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
            />
          ))}

          {/* Draw flow line preview */}
          {tool === 'flowLine' && flowLine && (
            <Line
              points={flowLine.points}
              stroke={penColor}
              strokeWidth={penWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              dash={[10, 5]}
              globalCompositeOperation="source-over"
            />
          )}
        </Layer>
      </Stage>
      </div>
      {/* Context menu */}
      {contextMenu.show && (
        <ContextMenu
          selectedElement={contextMenu.element}
          position={contextMenu.position}
          onClose={() => setContextMenu({ ...contextMenu, show: false })}
          onUpdateElement={handleElementUpdate}
          onDelete={handleElementDelete}
        />
      )}

      {/* Action buttons */}
      <ActionButtons />      {/* Save canvas modal */}
      {showSaveModal && (
        <SaveCanvasModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={() => {
            setShowSaveModal(false);
            if (onSave) {
              const dataURL = stageRef.current.toDataURL();
              onSave(dataURL);
            }
          }}
          imageUri={stageRef.current ? stageRef.current.toDataURL() : null}
        />
      )}

      {/* Tool bar */}
      <ToolBar />
    </div>
  );
};

export default DrawingBoard;