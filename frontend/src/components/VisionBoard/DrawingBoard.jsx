import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text as KonvaText, Transformer, Group, Image, Circle } from 'react-konva';
import useImage from "use-image";
import SaveCanvasModal from "./SaveCanvasModal";
import { 
  Pen, Type, MousePointer, Share2, Image as ImageIcon, Plus, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, Palette, Upload, Bold, Italic, AlignLeft, Trash2, Move,
  Save, Download, Minimize2, Maximize2, CornerRightDown
} from 'lucide-react';
import { X } from 'lucide-react'; 

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

const ContextMenu = ({ elementId, elements, position, onClose, onUpdateElement, onDelete }) => {
  // Safeguard against undefined elements
  const elementList = elements || [];
  const element = elementList.find(el => el.id === elementId);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.context-menu') === null) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  if (!element) return null;
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.context-menu') === null) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  if (!element) return null;

  return (
    <div 
      className="context-menu absolute bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[1000] animate-fadeIn"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        minWidth: '220px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="p-3 bg-white/70 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">
          {element.type === 'text' ? 'Text Options' : 
           element.type === 'flowLine' ? 'Line Options' : 
           `${element.type.charAt(0).toUpperCase()}${element.type.slice(1)} Settings`}
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="p-3 space-y-4">
        {(element.type === 'text' || element.type === 'flowLine') && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Color</label>
              <ColorPalette
  currentColor={element.color || '#000000'}
  onColorSelect={(color) => onUpdateElement(element.id, { color })}
/>
            </div>

            {element.type === 'text' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Size</label>
<input
  type="number"
  value={element.fontSize || 24}
  onChange={(e) => onUpdateElement(element.id, { 
    fontSize: parseInt(e.target.value) 
  })}
  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
  min="8"
  max="72"
/>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Font</label>
                  <select
                    value={element.fontFamily || 'Arial'}
                    onChange={(e) => onUpdateElement(element.id, { 
  fontFamily: e.target.value 
})}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
              </div>
            )}

            {element.type === 'flowLine' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-500">Width</label>
                  <span className="text-xs text-gray-500">{element.strokeWidth || 2}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={element.strokeWidth || 2}
                  onChange={(e) => onUpdateElement(element.id, {
  strokeWidth: parseInt(e.target.value)
})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </>
        )}

        <div className="pt-2">
          <button
            onClick={() => {
              onDelete(element.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Element
          </button>
        </div>
      </div>
    </div>
  );
};

// Fixed TextNode component with proper transform handling
const TextNode = ({ text, isSelected, onSelect, onChange, tool }) => {
  const textRef = useRef();
  const trRef = useRef();
  const groupRef = useRef();
  const [isTransforming, setIsTransforming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isSelected && tool === 'select' && textRef.current && trRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [isSelected, tool, text.id]);

  const handleSelect = (e) => {
    if (tool === 'select') {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.stopPropagation();
        e.evt.preventDefault();
      }
      onSelect(text.id);
    }
  };

  const handleDragStart = (e) => {
    if (tool === 'select') {
      if (!isSelected) onSelect(text.id);
      setIsDragging(true);
      e.target.setAttrs({
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0.2,
        shadowBlur: 5
      });
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (tool === 'select' && onChange) {
      e.target.to({
        duration: 0.2,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0
      });
      
      onChange(text.id, {
        x: e.target.x(),
        y: e.target.y()
      });
    }
  };

  const handleTransformEnd = () => {
    if (textRef.current && onChange) {
      const node = textRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Calculate new font size based on average scale
      const avgScale = (scaleX + scaleY) / 2;
      const newFontSize = Math.max(8, Math.round((text.fontSize || 24) * avgScale));
      
      // Get current position including group position
      const groupX = groupRef.current?.x() || 0;
      const groupY = groupRef.current?.y() || 0;
      
      // Reset scale and position
      node.scaleX(1);
      node.scaleY(1);
      node.x(0);
      node.y(0);
      
      // Update with new properties, preserving position
      onChange(text.id, {
        x: groupX,
        y: groupY,
        rotation: groupRef.current?.rotation() || 0,
        fontSize: newFontSize
      });
    }
    setIsTransforming(false);
  };
  
  return (
    <Group
      id={text.id}
      name={`text-${text.id}`}
      ref={groupRef}
      x={text.x}
      y={text.y}
      draggable={tool === 'select' && !isTransforming}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
      onTap={handleSelect}
      onMouseDown={handleSelect}
      rotation={text.rotation || 0}
    >
      <KonvaText
        ref={textRef}
        text={text.text || text.content}
        x={0}
        y={0}
        fontSize={text.fontSize || 24}
        fontFamily={text.fontFamily || 'Arial'}
        fill={text.color || text.fill || '#000000'}
        fontStyle={text.fontStyle || 'normal'}
        listening={true}
        perfectDrawEnabled={false}
        id={text.id}
        name={`text-${text.id}`}
      />
      {isSelected && tool === 'select' && (
        <Transformer
          ref={trRef}
          enabledAnchors={[
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) newBox.width = 20;
            if (newBox.height < 10) newBox.height = 10;
            return newBox;
          }}
          onTransformStart={() => setIsTransforming(true)}
          onTransformEnd={handleTransformEnd}
          rotateEnabled={true}
          anchorFill="#ffffff"
          anchorStroke="#0066ff"
          borderStroke="#0066ff"
          borderStrokeWidth={2}
          anchorSize={8}
          anchorStrokeWidth={2}
          anchorCornerRadius={2}
          padding={5}
          rotateAnchorOffset={20}
          keepRatio={false}
          centeredScaling={false}
          ignoreStroke={true}
        />
      )}
    </Group>
  );
};

// Fixed URLImage Component
const URLImage = ({ element, onSelect, isSelected, onUpdate, tool }) => {
  const [img] = useImage(element.src);
  const imageRef = useRef();
  const trRef = useRef();
  const groupRef = useRef();
  const [isTransforming, setIsTransforming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isSelected && tool === 'select' && imageRef.current && trRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [isSelected, tool, element.id]);

  const handleSelect = (e) => {
    if (tool === 'select') {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.stopPropagation();
        e.evt.preventDefault();
      }
      onSelect(element.id);
    }
  };

  const handleDragStart = (e) => {
    if (tool === 'select' && isSelected) {
      setIsDragging(true);
      e.target.setAttrs({
        shadowOffset: { x: 5, y: 5 },
        shadowOpacity: 0.2,
        shadowBlur: 5
      });
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (tool === 'select' && onUpdate) {
      e.target.to({
        duration: 0.2,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0
      });
      
      onUpdate(element.id, {
        x: e.target.x(),
        y: e.target.y()
      });
    }
  };

  const handleTransformEnd = () => {
    if (!imageRef.current || !onUpdate) return;

    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Calculate new dimensions
    const newWidth = Math.max(20, element.width * scaleX);
    const newHeight = Math.max(20, element.height * scaleY);

    // Get current position
    const groupX = groupRef.current?.x() || element.x;
    const groupY = groupRef.current?.y() || element.y;

    // Reset scale and position
    node.scaleX(1);
    node.scaleY(1);
    node.x(0);
    node.y(0);

    onUpdate(element.id, {
      x: groupX,
      y: groupY,
      width: newWidth,
      height: newHeight,
      rotation: groupRef.current?.rotation() || 0
    });

    setIsTransforming(false);
  };

  return (
    <Group
      id={element.id}
      name={`image-${element.id}`}
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation || 0}
      draggable={tool === 'select' && isSelected && !isTransforming}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleSelect}
      onTap={handleSelect}
      onMouseDown={handleSelect}
    >
      <Image
        ref={imageRef}
        image={img}
        x={0}
        y={0}
        width={element.width}
        height={element.height}
        listening={true}
        perfectDrawEnabled={false}
        id={element.id}
        name={`image-${element.id}`}
      />
      
      {isSelected && tool === 'select' && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
          enabledAnchors={[
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
          ]}
          anchorFill="#ffffff"
          anchorStroke="#0066ff"
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#0066ff"
          borderStrokeWidth={2}
          padding={5}
          rotateAnchorOffset={20}
          onTransformStart={() => setIsTransforming(true)}
          onTransformEnd={handleTransformEnd}
          ignoreStroke={true}
          keepRatio={false}
          centeredScaling={false}
        />
      )}
    </Group>
  );
};

// Fixed FlowLineComponent with proper drag and resize behavior
const FlowLineComponent = ({ line, isSelected, onSelect, onUpdate, tool }) => {
  const [draggingEndpoint, setDraggingEndpoint] = useState(null);
  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const groupRef = useRef();
  const lineRef = useRef();

  const points = line.points || [50, 50, 200, 50];

  useEffect(() => {
    if (isSelected && groupRef.current) {
      groupRef.current.moveToTop();
      
      const layer = groupRef.current.getLayer();
      if (layer) {
        const startCircle = layer.findOne(`#${line.id}-start`);
        const endCircle = layer.findOne(`#${line.id}-end`);
        if (startCircle) startCircle.moveToTop();
        if (endCircle) endCircle.moveToTop();
        layer.batchDraw();
      }
    }
  }, [isSelected, line.id]);

  const handleLineSelect = (e) => {
    if (tool === 'select') {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.stopPropagation();
        e.evt.preventDefault();
      }
      onSelect(line.id);
    }
  };

  const handleLineDragStart = (e) => {
    if (tool === 'select' && !draggingEndpoint) {
      if (!isSelected) onSelect(line.id);
      setIsDraggingLine(true);
      e.target.setAttrs({
        shadowOffset: { x: 3, y: 3 },
        shadowOpacity: 0.2,
        shadowBlur: 5
      });
    }
  };

  const handleLineDragEnd = (e) => {
    setIsDraggingLine(false);
    if (tool === 'select' && onUpdate && lineRef.current) {
      const node = lineRef.current;
      const deltaX = node.x();
      const deltaY = node.y();
      
      if (deltaX !== 0 || deltaY !== 0) {
        const newPoints = points.map((point, index) => {
          if (index % 2 === 0) return point + deltaX;
          return point + deltaY;
        });
        
        node.x(0);
        node.y(0);
        node.shadowOffset({ x: 0, y: 0 });
        node.shadowOpacity(0);
        
        onUpdate(line.id, { points: newPoints });
      }
    }
  };

  const handleEndpointDragStart = (endpointIndex, e) => {
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    setDraggingEndpoint(endpointIndex);
    e.target.setAttrs({
      scaleX: 1.2,
      scaleY: 1.2
    });
  };

  const handleEndpointDragMove = (endpointIndex, e) => {
    if (!onUpdate) return;
    
    const newPoints = [...points];
    newPoints[endpointIndex * 2] = e.target.x();
    newPoints[endpointIndex * 2 + 1] = e.target.y();
    
    onUpdate(line.id, { points: newPoints });
  };

  const handleEndpointDragEnd = (endpointIndex, e) => {
    setDraggingEndpoint(null);
    e.target.to({
      duration: 0.2,
      scaleX: 1,
      scaleY: 1
    });
  };

  return (
    <Group id={line.id} name={`flowline-${line.id}`} ref={groupRef}>
      <Line
        ref={lineRef}
        points={points}
        stroke={line.color || "#000000"}
        strokeWidth={line.strokeWidth || 2}
        tension={line.style === 'curved' ? 0.5 : 0}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={Math.max(8, (line.strokeWidth || 2) * 2)}
        draggable={tool === 'select' && !draggingEndpoint}
        listening={true}
        onClick={handleLineSelect}
        onTap={handleLineSelect}
        onMouseDown={handleLineSelect}
        onDragStart={handleLineDragStart}
        onDragEnd={handleLineDragEnd}
        onMouseEnter={() => {
          if (tool === 'select' && !draggingEndpoint && !isDraggingLine) {
            document.body.style.cursor = isSelected ? 'move' : 'pointer';
          }
        }}
        onMouseLeave={() => {
          if (tool === 'select' && !isDraggingLine) {
            document.body.style.cursor = 'default';
          }
        }}
        perfectDrawEnabled={false}
        id={line.id}
        name={`flowline-${line.id}`}
      />
      
      {isSelected && tool === 'select' && (
        <>
          <Circle
            x={points[0]}
            y={points[1]}
            radius={8}
            fill="#ffffff"
            stroke="#0066ff"
            strokeWidth={2}
            draggable={true}
            listening={true}
            onDragStart={(e) => handleEndpointDragStart(0, e)}
            onDragMove={(e) => handleEndpointDragMove(0, e)}
            onDragEnd={(e) => handleEndpointDragEnd(0, e)}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onMouseEnter={() => {
              document.body.style.cursor = 'crosshair';
            }}
            onMouseLeave={() => {
              document.body.style.cursor = 'default';
            }}
            perfectDrawEnabled={false}
            id={`${line.id}-start`}
            name={`flowline-endpoint-${line.id}-start`}
          />
          
          <Circle
            x={points[2]}
            y={points[3]}
            radius={8}
            fill="#ffffff"
            stroke="#0066ff"
            strokeWidth={2}
            draggable={true}
            listening={true}
            onDragStart={(e) => handleEndpointDragStart(1, e)}
            onDragMove={(e) => handleEndpointDragMove(1, e)}
            onDragEnd={(e) => handleEndpointDragEnd(1, e)}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onMouseEnter={() => {
              document.body.style.cursor = 'crosshair';
            }}
            onMouseLeave={() => {
              document.body.style.cursor = 'default';
            }}
            perfectDrawEnabled={false}
            id={`${line.id}-end`}
            name={`flowline-endpoint-${line.id}-end`}
          />
        </>
      )}
    </Group>
  );
};

const DrawingBoard = ({ onSave, initialAIItems = [] }) => {
  const [elements, setElements] = useState([]);
    // Add AI items to board on mount if provided
    useEffect(() => {
      if (initialAIItems && initialAIItems.length > 0) {
        const newElements = initialAIItems.map((item, idx) => {
          if (item.type === 'image') {
            return {
              id: `ai-image-${Date.now()}-${idx}`,
              type: 'image',
              src: item.content,
              x: 100 + idx * 40,
              y: 100 + idx * 40,
              width: 200,
              height: 200,
              rotation: 0
            };
          } else if (item.type === 'quote') {
            return {
              id: `ai-quote-${Date.now()}-${idx}`,
              type: 'text',
              text: item.content,
              x: 120 + idx * 40,
              y: 320 + idx * 40,
              fontSize: 28,
              fontFamily: 'Georgia',
              color: '#4F46E5',
              fontStyle: 'italic',
              rotation: 0
            };
          }
          return null;
        }).filter(Boolean);
        setElements((prev) => [...prev, ...newElements]);
      }
      // eslint-disable-next-line
    }, [initialAIItems]);
  const [selectedId, setSelectedId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tool, setTool] = useState("select");
  const [previousTool, setPreviousTool] = useState("select");
  const [penColor, setPenColor] = useState("#000000");
  
  // Enhanced tool setter that preserves selection
  const handleToolChange = (newTool) => {
    setPreviousTool(tool);
    setTool(newTool);
    // Don't clear selection when switching to select tool
    if (newTool !== 'select') {
      setSelectedId(null);
    }
  };
  const initialToolbarPosRef = useRef({ x: 40, y: 40 });
const initialMousePosRef = useRef({ x: 0, y: 0 });
  const [penWidth, setPenWidth] = useState(2);
  const [lines, setLines] = useState([]);  
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [toolbarPos, setToolbarPos] = useState({ x: 40, y: 40 });
const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [text, setText] = useState({ 
    content: "", 
    fontSize: 24, // Changed from 16 to 24
    fontFamily: 'Arial',
    color: '#000000',
    isBold: false,
    isItalic: false
});
  const [dimensions, setDimensions] = useState({
  width: window.innerWidth,
  height: window.innerHeight
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
// Replace the existing contextMenu state
const [contextMenu, setContextMenu] = useState({
  show: false,
  position: { x: 0, y: 0 },
  elementId: null  // Changed from 'element' to 'elementId'
});
const [isToolboxMinimized, setIsToolboxMinimized] = useState(false);
const [lineStyle, setLineStyle] = useState('straight');
const [isPlacingElement, setIsPlacingElement] = useState(false);
const [elementToPlace, setElementToPlace] = useState(null);
const [isErasing, setIsErasing] = useState(false);
const addElementWithHistory = (element) => {
  console.log('Adding element with history:', element.id);
  setUndoStack(prev => [...prev, { action: 'create', element: element }]); // Changed from null to element
  setElements(prev => [...prev, element]);
  setRedoStack([]);
  
  // Ensure element is selected immediately
  setSelectedId(element.id);
  
  // Force multiple selection attempts with different timings
  setTimeout(() => {
    setSelectedId(element.id);
    const stage = stageRef.current;
    if (stage) {
      const node = stage.findOne(`#${element.id}`);
      console.debug('addElementWithHistory: stage.findOne ->', element.id, node);
      if (node) {
        node.moveToTop();
        stage.batchDraw();
      } else {
        // also try name-based lookup
        const byName = stage.findOne(`[name="text-${element.id}"]`) || stage.findOne(`[name="image-${element.id}"]`) || stage.findOne(`[name="flowline-${element.id}"]`);
        console.debug('addElementWithHistory: fallback name lookup ->', byName);
      }
    }
  }, 0);
  
  setTimeout(() => {
    setSelectedId(element.id);
  }, 100);
  
  setTimeout(() => {
    setSelectedId(element.id);
  }, 200);
};

  const updateElementWithHistory = (action, element, newProps = null) => {
  if (action === 'update' && element) {
    setUndoStack(prev => [...prev, {
      action: 'update',
      element: {...element},  // Original element before update
      updatedElement: {...element, ...newProps}  // Element after update
    }]);
    
    // Clear redo stack
    setRedoStack([]);
    
    // Update the element
    setElements(prev => 
      prev.map(el => el.id === element.id ? {...el, ...newProps} : el)
    );
  } else if (action === 'delete' && element) {
    setUndoStack(prev => [...prev, {
      action: 'delete',
      element: {...element}
    }]);
    setElements(prev => prev.filter(el => el.id !== element.id));
    setSelectedId(null);
    setRedoStack([]);
  }
};
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

useEffect(() => {
  const handleMouseMove = (e) => {
    if (isDraggingToolbar) {
      setToolbarPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingToolbar(false);
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDraggingToolbar, dragStart]);
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
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const maxWidth = 300;
        const maxHeight = 300;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        const centerX = (dimensions.width / 2 / scale) - (width / 2) - (stagePos.x / scale);
        const centerY = (dimensions.height / 2 / scale) - (height / 2) - (stagePos.y / scale);
        
        const imageElement = {
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        
        addElementWithHistory(imageElement);
        
        // Force selection and tool change
        setSelectedId(imageElement.id);
        setTool('select');
        
        // Multiple selection attempts for reliability
        setTimeout(() => setSelectedId(imageElement.id), 50);
        setTimeout(() => setSelectedId(imageElement.id), 100);
        setTimeout(() => setSelectedId(imageElement.id), 200);
      };
      
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  }
};
useEffect(() => {
  const handleMouseMove = (e) => {
    if (isDraggingToolbar) {
      const dx = e.clientX - initialMousePosRef.current.x;
      const dy = e.clientY - initialMousePosRef.current.y;
      
      setToolbarPos({
        x: initialToolbarPosRef.current.x + dx,
        y: initialToolbarPosRef.current.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingToolbar(false);
  };

  if (isDraggingToolbar) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDraggingToolbar]);

  // Replace the existing handleElementUpdate with this
const handleElementUpdate = (id, newProps) => {
  const element = elements.find(el => el.id === id);
  if (element) {
    // Save to undo stack
    setUndoStack(prev => [...prev, {
      action: 'update',
      element: {...element},  // Original element before update
      updatedElement: {...element, ...newProps}  // Element after update
    }]);
    
    // Clear redo stack
    setRedoStack([]);
    
    // Update the element
    setElements(prev => 
      prev.map(el => el.id === id ? {...el, ...newProps} : el)
    );
  }
};

// Update handleElementDelete
const handleElementDelete = (id) => {
  const elementToDelete = elements.find(el => el.id === id);
  
  if (elementToDelete) {
    updateElementWithHistory('delete', elementToDelete);
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  }
  
  setContextMenu({ ...contextMenu, show: false });
};

  // Mouse event handlers
const handleMouseDown = (e) => {
  const stage = e.target.getStage();
  if (!stage) return;
  
  const pos = stage.getPointerPosition();
  if (!pos) return;

  // Detect right-clicks so we don't deselect when user is opening context menu
  const isRightClick = !!(e.evt && (e.evt.button === 2 || e.evt.which === 3));
  if (!isRightClick) {
    setContextMenu({ show: false, position: { x: 0, y: 0 }, elementId: null });
  }

  const clickedElement = e.target;
  console.debug('handleMouseDown: clicked target', clickedElement && clickedElement.getClassName && clickedElement.getClassName(), clickedElement && clickedElement.attrs);
  
  // Check if we clicked on any element
  let clickedElementId = null;
  
  // Method 1: Check if element has direct ID that matches our elements
  const directId = clickedElement.attrs?.id;
  if (directId && elements.find(el => el.id === directId)) {
    clickedElementId = directId;
  }
  console.debug('handleMouseDown: directId ->', directId, 'clickedElementId ->', clickedElementId);
  
  // Method 2: Check if element name contains an element ID (robustly)
  if (!clickedElementId) {
    const elementName = clickedElement.attrs?.name || '';
    if (elementName) {
      // Try to match any element whose id appears in the node's name.
      // This handles ids with additional hyphens or prefixes reliably.
      const found = elements.find(el => {
        if (!el || !el.id) return false;
        // exact match
        if (elementName === el.id) return true;
        // cases like "text-<id>" or "drawing-<id>" -> endsWith handles that
        if (elementName.endsWith(`-${el.id}`)) return true;
        // fallback: anywhere in the name
        return elementName.includes(el.id);
      });

      if (found) clickedElementId = found.id;
      console.debug('handleMouseDown: name-match ->', elementName, 'found ->', clickedElementId);
    }
  }
  
  // Method 3: Check parent elements for IDs (for nested elements like transformer anchors)
  if (!clickedElementId) {
    let parent = clickedElement.parent;
    while (parent && parent !== stage) {
      const parentId = parent.attrs?.id;
      if (parentId && elements.find(el => el.id === parentId)) {
        clickedElementId = parentId;
        break;
      }
      parent = parent.parent;
    }
    console.debug('handleMouseDown: parent-match ->', clickedElementId);
  }

  // Method 4: Fallback — check all intersections at the pointer position
  // This handles cases where the clicked node is an anchor/transformer or not yet directly mapped
  if (!clickedElementId) {
    try {
      const intersections = stage.getAllIntersections(pos) || [];
      console.debug('handleMouseDown: intersections count ->', intersections.length);
      for (let shape of intersections) {
        if (!shape) continue;

        // direct id on the shape
        const sid = shape.attrs?.id;
        if (sid && elements.find(el => el.id === sid)) {
          clickedElementId = sid;
          console.debug('handleMouseDown: intersection matched id ->', sid);
          break;
        }

        // name-based matching (handles patterns like "text-<id>" etc.)
        const sname = shape.attrs?.name || '';
        if (sname) {
          const found = elements.find(el => {
            if (!el || !el.id) return false;
            if (sname === el.id) return true;
            if (sname.endsWith(`-${el.id}`)) return true;
            return sname.includes(el.id);
          });
          if (found) {
            clickedElementId = found.id;
            console.debug('handleMouseDown: intersection name matched ->', found.id, sname);
            break;
          }
        }

        // traverse parents of the intersection shape
        let p = shape.parent;
        while (p && p !== stage) {
          const pid = p.attrs?.id;
          if (pid && elements.find(el => el.id === pid)) {
            clickedElementId = pid;
            break;
          }
          p = p.parent;
        }
        if (clickedElementId) console.debug('handleMouseDown: intersection parent matched ->', clickedElementId);
        if (clickedElementId) break;
      }
    } catch (err) {
      // safe fallback — ignore intersection errors
      console.warn('Intersection lookup failed', err);
    }
  }
  if (!clickedElementId) console.debug('handleMouseDown: no element found at pointer');

  // If we found an element, handle selection
  if (clickedElementId && tool === 'select') {
    handleElementSelect(clickedElementId);
    e.evt?.preventDefault();
    return;
  }
  
  // Check if clicked on background (ONLY if we didn't find any element)
  const clickedOnBackground = 
    clickedElement === stage || 
    (clickedElement.getClassName() === 'Rect' && clickedElement.attrs?.id === 'background') ||
    // Also check if it's the first layer (background layer)
    (stage.children.length > 0 && clickedElement === stage.children[0]);

  // But ONLY if we haven't already identified an element
  if (tool === 'select' && clickedOnBackground && !clickedElementId) {
    setSelectedId(null);
    return;
  }
  
  // Don't proceed with other tools if not clicking on background
  if (!clickedOnBackground) return;

  const actualPos = {
    x: (pos.x - stagePos.x) / scale,
    y: (pos.y - stagePos.y) / scale
  };

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
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        addElementWithHistory(newText);
        // Keep text tool active for multiple additions
      }
      break;

    case 'flowLine':
      isDrawing.current = true;
      const newLine = {
        id: `flowline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'flowLine',
        points: [actualPos.x, actualPos.y, actualPos.x + 100, actualPos.y],
        color: penColor,
        strokeWidth: penWidth,
        style: lineStyle
      };
      setFlowLine(newLine);
      break;
  }
};

const handleElementSelect = (id) => {
  // If clicking on already selected element, keep it selected
  if (selectedId === id) {
    const stage = stageRef.current;
    if (stage) {
      const selectedNode = stage.findOne(`#${id}`);
      if (selectedNode) {
        selectedNode.moveToTop();
        
        // Move flowline endpoints to top
        if (selectedNode.attrs.name && selectedNode.attrs.name.startsWith('flowline-')) {
          const startEndpoint = stage.findOne(`#${id}-start`);
          const endEndpoint = stage.findOne(`#${id}-end`);
          if (startEndpoint) startEndpoint.moveToTop();
          if (endEndpoint) endEndpoint.moveToTop();
        }
        
        stage.batchDraw();
      }
    }
    return;
  }
  
  // Select new element
  setSelectedId(id);
  setTool('select');
  setContextMenu({ show: false, position: { x: 0, y: 0 }, elementId: null });
  
  // Force selection with multiple attempts
  setTimeout(() => setSelectedId(id), 50);
  setTimeout(() => setSelectedId(id), 100);
  setTimeout(() => setSelectedId(id), 200);
};

const handleMouseUp = () => {
  // In handleMouseUp for pen tool
if (tool === 'pen' && isDrawing.current && penPoints.length > 0) {
  const lastLine = penPoints[penPoints.length - 1];
  if (lastLine && lastLine.points.length >= 4) {
    const newElement = {
  id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Use consistent ID format
  type: 'drawing',
      points: lastLine.points,
      color: lastLine.color,
      strokeWidth: lastLine.width
    };
    addElementWithHistory(newElement);
    setPenPoints([]);
  }
}
  
  // In handleMouseUp, fix flow line creation
if (tool === 'flowLine' && flowLine && isDrawing.current) {
  const [x1, y1, x2, y2] = flowLine.points;
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  if (distance > 5) {
    addElementWithHistory({ ...flowLine });
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
  
const ActionButtons = () => (
  <div className="absolute top-4 right-4 z-40 flex gap-2">
    <button
      onClick={() => setShowSaveModal(true)}
      className="px-4 py-2 bg-white/90 backdrop-blur-md text-indigo-600 rounded-lg hover:bg-white transition-all flex items-center gap-1.5 shadow-md border border-indigo-100 text-sm font-medium"
    >
      <Save className="w-3.5 h-3.5" />
      Save
    </button>
    <button
      onClick={downloadCanvas}
      className="px-4 py-2 bg-white/90 backdrop-blur-md text-green-600 rounded-lg hover:bg-white transition-all flex items-center gap-1.5 shadow-md border border-green-100 text-sm font-medium"
    >
      <Download className="w-3.5 h-3.5" />
      Export
    </button>
  </div>
);

const ToolBar = () => {
  // Add ref for the scrollable container
  const scrollContainerRef = useRef(null);
  
  const handleToolbarMouseDown = (e) => {
    // Skip if clicking on interactive elements
    const interactiveElements = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (
      interactiveElements.includes(e.target.tagName) ||
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('select') ||
      e.target.closest('textarea')
    ) {
      return;
    }
    
    // Store initial positions
    initialMousePosRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
    initialToolbarPosRef.current = { ...toolbarPos };
    
    setIsDraggingToolbar(true);
  };

  // Custom hook to preserve scroll position
  const usePreserveScroll = () => {
    const scrollPosition = useRef(0);
    
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (container) {
        // Restore scroll position after render
        container.scrollTop = scrollPosition.current;
      }
    });
    
    const preserveScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        scrollPosition.current = container.scrollTop;
      }
    };
    
    return preserveScroll;
  };

  const preserveScroll = usePreserveScroll();

  // Enhanced pen width handler that preserves scroll
  const handlePenWidthChange = (e) => {
    preserveScroll(); // Save current scroll position
    setPenWidth(parseInt(e.target.value));
  };

  const TextInputWithEnterHandler = ({ text, setText, addElementWithHistory, dimensions, scale, stagePos, setSelectedId, setTool }) => {
    const inputRef = useRef(null);
    
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [text.content]);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && text.content.trim()) {
        e.preventDefault();
        e.stopPropagation();
        
        const centerX = (dimensions.width / 2 / scale) - 50 - (stagePos.x / scale);
        const centerY = (dimensions.height / 2 / scale) - 10 - (stagePos.y / scale);
        
        const newText = {
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        
        addElementWithHistory(newText);
        setText({ ...text, content: '' });
        
        // Force selection and tool change with multiple attempts
        setSelectedId(newText.id);
        setTool('select');
        
        setTimeout(() => setSelectedId(newText.id), 50);
        setTimeout(() => setSelectedId(newText.id), 100);
        setTimeout(() => setSelectedId(newText.id), 200);
      }
    };

    const handleChange = (e) => {
      e.stopPropagation();
      setText({ ...text, content: e.target.value });
    };

    return (
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter text..."
        value={text.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-text"
      />
    );
  };

  return (
    <div 
      className={`absolute z-40 transition-all duration-300 ${
        isToolboxMinimized ? 'w-12' : tool === 'text' ? 'w-[400px]' : 'w-[300px]'
      }`}
      style={{
        left: `${toolbarPos.x}px`,
        top: `${toolbarPos.y}px`,
        cursor: isDraggingToolbar ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleToolbarMouseDown}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
        {/* Toolbar Header */}
        <div 
          className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 select-none"
        >
          {!isToolboxMinimized && <h3 className="text-lg font-semibold text-gray-800">Tools</h3>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsToolboxMinimized(!isToolboxMinimized);
            }}
            className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            {isToolboxMinimized ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Rest of toolbar content with ref for scroll preservation */}
        {!isToolboxMinimized && (
          <div 
            ref={scrollContainerRef}
            className={`${
              tool === 'text' 
                ? 'overflow-visible' 
                : 'overflow-y-auto custom-scrollbar max-h-[calc(100vh-8rem)]'
            }`}
          >
            <div className="p-4 space-y-4">
              {/* Canvas Controls */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleUndo}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  disabled={elements.length === 0}
                  title="Undo (Ctrl+Z)"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-black" 
                  >
                    <path d="M9 14L4 9l5-5"/>
                    <path d="M4 9h11c4 0 7 3 7 7v0c0 4-3 7-7 7H8"/>
                  </svg>
                </button>
                <button
                  onClick={handleRedo}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  disabled={redoStack.length === 0}
                  title="Redo (Ctrl+Y)"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-black" 
                  >
                    <path d="M15 14l5-5-5-5"/>
                    <path d="M20 9H9C5 9 2 12 2 16v0c0 4 3 7 7 7h8"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
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
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'select' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('select')}
                >
                  <MousePointer className="w-4 h-4" />
                  <span>Select</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'pen' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('pen')}
                >
                  <Pen className="w-4 h-4" />
                  <span>Pen</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'text' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('text')}
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'eraser' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('eraser')}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eraser</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'flowLine' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('flowLine')}
                >
                  <CornerRightDown className="w-4 h-4" />
                  <span>Flow Line</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    tool === 'image' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleToolChange('image')}
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
                      <TextInputWithEnterHandler
                        text={text}
                        setText={setText}
                        addElementWithHistory={addElementWithHistory}
                        dimensions={dimensions}
                        scale={scale}
                        stagePos={stagePos}
                        setSelectedId={setSelectedId}
                        setTool={setTool}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Press Enter to add text to center, or click canvas after typing
                      </p>
                    </div>
                    <select
                      value={text.fontFamily}
                      onChange={(e) => setText({ ...text, fontFamily: e.target.value })}
                      className="px-3 py-2 border rounded-lg cursor-pointer"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                    <div className="col-span-1">
                      <label className="text-xs text-gray-600 mb-1 block">Font Size</label>
                      <input
                        type="number"
                        value={text.fontSize}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (!isNaN(value) && value >= 0)) {
                            setText(prev => ({ ...prev, fontSize: value === '' ? '' : parseInt(value) || 8 }));
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 8) {
                            setText(prev => ({ ...prev, fontSize: 8 }));
                          } else if (value > 200) {
                            setText(prev => ({ ...prev, fontSize: 200 }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onFocus={(e) => {
                          e.target.select();
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        min="8"
                        max="200"
                        step="1"
                        placeholder="24"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ColorPalette
                      currentColor={text.color}
                      onColorSelect={(color) => setText({ ...text, color })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded cursor-pointer ${text.isBold ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setText({ ...text, isBold: !text.isBold })}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded cursor-pointer ${text.isItalic ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
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
                    className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2 cursor-pointer"
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
                      onColorSelect={(color) => {
                        preserveScroll();
                        setPenColor(color);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Width: {penWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={penWidth}
                      onChange={handlePenWidthChange}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 rounded-lg text-sm bg-indigo-500 text-white">
                      Straight
                    </div>
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
                      onChange={handlePenWidthChange}
                      className="w-full cursor-pointer"
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
                      onColorSelect={(color) => {
                        preserveScroll();
                        setPenColor(color);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Width: {penWidth}px</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={penWidth}
                      onChange={handlePenWidthChange}
                      className="w-full cursor-pointer"
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
};

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

  // Create a copy of elements before modification for history
  const prevElements = [...elements];
  
  // Erase from elements array (finished drawings)
  setElements(prevElements => {
    return prevElements.filter(element => {
      if (element.type === 'drawing') {
        const points = element.points;
        for (let i = 0; i < points.length - 2; i += 2) {
          // Check line segment between points
          const start = { x: points[i], y: points[i+1] };
          const end = { x: points[i+2], y: points[i+3] };
          
          // Calculate distance from point to line segment
          const distance = pointToLineDistance(actualPos, start, end);
          if (distance < eraserRadius) {
            return false;
          }
        }
      }
      return true;
    });
  });


  const pointToLineDistance = (point, lineStart, lineEnd) => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};
  
  // Erase from pen points (currently being drawn)
  setPenPoints(prevPoints => {
    const newPoints = prevPoints.map(line => {
      const points = [...line.points];
      const newPoints = [];

      // Filter out points that are within eraser radius
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
    }).filter(line => line.points.length >= 4); // Keep lines with at least 2 points (4 coordinates)
    
    // If any points were removed, save to undo stack
    if (JSON.stringify(newPoints) !== JSON.stringify(prevPoints)) {
      setUndoStack(prev => [...prev, {
        action: 'erasePenPoints',
        penPoints: prevPoints,
        newPenPoints: newPoints
      }]);
      setRedoStack([]);
    }
    
    return newPoints;
  });
};

// Update the keyboard handler
useEffect(() => {
  const handleKeyboard = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } 
    else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
             ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
      e.preventDefault();
      handleRedo();
    } 
    else if (e.key === 'Delete' && selectedId) {
      handleElementDelete(selectedId);
    }
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, [selectedId, elements, undoStack, redoStack]);

 // Update handleUndo
const handleUndo = () => {
  if (undoStack.length === 0) return;
  
  const lastAction = undoStack[undoStack.length - 1];
  
  setRedoStack(prev => [...prev, lastAction]);
  
  if (lastAction.action === 'create') {
    // Remove created element
    if (lastAction.element) {
      setElements(prev => prev.filter(el => el.id !== lastAction.element.id));
      setSelectedId(null);
    }
  } 
  else if (lastAction.action === 'update') {
    // Restore previous version of element
    if (lastAction.element) {
      setElements(prev => 
        prev.map(el => el.id === lastAction.element.id ? lastAction.element : el)
      );
      setSelectedId(lastAction.element.id);
    }
  } 
  else if (lastAction.action === 'delete') {
    // Restore deleted element
    if (lastAction.element) {
      setElements(prev => [...prev, lastAction.element]);
      setSelectedId(lastAction.element.id);
    }
  }
  else if (lastAction.action === 'erase') {
    // Restore erased elements
    setElements(lastAction.elements);
  }
  else if (lastAction.action === 'erasePenPoints') {
    // Restore pen points
    setPenPoints(lastAction.penPoints);
  }
  
  setUndoStack(prev => prev.slice(0, -1));
};

const handleRedo = () => {
  if (redoStack.length === 0) return;
  
  const nextAction = redoStack[redoStack.length - 1];
  
  setUndoStack(prev => [...prev, nextAction]);
  
  if (nextAction.action === 'create') {
    // Re-create element
    if (nextAction.element) {
      setElements(prev => [...prev, nextAction.element]);
      setSelectedId(nextAction.element.id);
    }
  } 
  else if (nextAction.action === 'update') {
    // Re-apply update
    if (nextAction.updatedElement) {
      setElements(prev => 
        prev.map(el => el.id === nextAction.updatedElement.id ? nextAction.updatedElement : el)
      );
      setSelectedId(nextAction.updatedElement.id);
    }
  } 
  else if (nextAction.action === 'delete') {
    // Re-delete element
    if (nextAction.element) {
      setElements(prev => prev.filter(el => el.id !== nextAction.element.id));
      setSelectedId(null);
    }
  }
  else if (nextAction.action === 'erase') {
    // Re-apply eraser action
    setElements(nextAction.newElements);
  }
  else if (nextAction.action === 'erasePenPoints') {
    // Re-apply pen points erasure
    setPenPoints(nextAction.newPenPoints);
  }
  
  setRedoStack(prev => prev.slice(0, -1));
};

  // Update elements with history tracking
  const updateElementsWithHistory = (newElements) => {
    setUndoStack(prev => [...prev, elements]);
    setElements(newElements);
    setRedoStack([]);
  };

  return (
    <div className="relative ">
      <div ref={containerRef}>
{contextMenu.show && (
  <ContextMenu
    elementId={contextMenu.elementId}
    elements={elements}
    position={contextMenu.position}
onClose={() => setContextMenu({
  show: false, 
  position: { x: 0, y: 0 }, 
  elementId: null 
})}
    onUpdateElement={handleElementUpdate}
    onDelete={handleElementDelete}
  />
)}
    <Stage
  ref={stageRef}
  width={dimensions.width}
  height={Math.max(dimensions.height, window.innerHeight)}
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
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  
  if (selectedId) {
    const containerRect = stage.container().getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine quadrant relative to the stage container using pointer position
    const localX = pos.x; // position inside stage container
    const localY = pos.y;
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Menu dimensions (approximate) and padding
    const MENU_WIDTH = 220;
    const MENU_HEIGHT = 300;
    const PADDING = 10;

    // Start with the click position in client coordinates
    let adjustedX = containerRect.left + localX;
    let adjustedY = containerRect.top + localY;

    // Place menu based on quadrant of the click
    if (localX < centerX && localY < centerY) {
      // top-left => show menu at bottom-right of item
      adjustedX = containerRect.left + localX + PADDING;
      adjustedY = containerRect.top + localY + PADDING;
    } else if (localX >= centerX && localY < centerY) {
      // top-right => show menu at bottom-left
      adjustedX = containerRect.left + localX - MENU_WIDTH - PADDING;
      adjustedY = containerRect.top + localY + PADDING;
    } else if (localX < centerX && localY >= centerY) {
      // bottom-left => show menu at top-right
      adjustedX = containerRect.left + localX + PADDING;
      adjustedY = containerRect.top + localY - MENU_HEIGHT - PADDING;
    } else {
      // bottom-right => show menu at top-left
      adjustedX = containerRect.left + localX - MENU_WIDTH - PADDING;
      adjustedY = containerRect.top + localY - MENU_HEIGHT - PADDING;
    }

    // Clamp within viewport
    adjustedX = Math.max(8, Math.min(adjustedX, viewportWidth - MENU_WIDTH - 8));
    adjustedY = Math.max(8, Math.min(adjustedY, viewportHeight - MENU_HEIGHT - 8));

    setContextMenu({
      show: true,
      position: { x: adjustedX, y: adjustedY },
      elementId: selectedId
    });
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
  height={Math.max(dimensions.height, window.innerHeight) / scale} // Updated to match Stage height
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
          onUpdate={handleElementUpdate}  // ← CHANGED from onDragEnd and onResize
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
          onUpdate={handleElementUpdate}  // ← CHANGED from onDragEnd
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
            if (tool === 'select') {
              e.cancelBubble = true;
              if (e.evt) {
                e.evt.stopPropagation();
                e.evt.preventDefault();
              }
              handleElementSelect(element.id);
            }
          }}
          onTap={(e) => {
            if (tool === 'select') {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
              handleElementSelect(element.id);
            }
          }}
          onMouseDown={(e) => {
            if (tool === 'select') {
              e.cancelBubble = true;
              if (e.evt) {
                e.evt.stopPropagation();
                e.evt.preventDefault();
              }
              handleElementSelect(element.id);
            }
          }}
          listening={true}
          id={element.id}
          name={`drawing-${element.id}`}
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
    points={line.points.flat()}  // Make sure this is correctly formatted
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
    tension={lineStyle === 'curved' ? 0.5 : 0} // Add tension for preview
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