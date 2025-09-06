import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text as KonvaText, Transformer, Group } from 'react-konva';
import useImage from "use-image";
import SaveCanvasModal from "./SaveCanvasModal";
import { 
  Pen, Type, MousePointer, Share2, Image as ImageIcon, Plus, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, Palette, Upload, Bold, Italic, AlignLeft, Trash2, Move,
  Save, Download, Minimize2, Maximize2, CornerRightDown
} from 'lucide-react';
import { X } from 'lucide-react'; 

const URLImage = ({ element, onDragEnd, onSelect, isSelected, onResize, tool }) => {
  const [img] = useImage(element.src);
  const imageRef = useRef();
  const trRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState(null);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current && tool === 'select') {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, tool]);

  const handleTransformStart = () => {
    setIsTransforming(true);
  };

  const handleTransformerInteraction = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
  };

  const handleTransform = () => {
    if (imageRef.current && onResize) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Update element with current scale for live preview
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: scaleX,
        scaleY: scaleY
      });
    }
  };

  const handleTransformEnd = () => {
    if (imageRef.current && onResize) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Calculate actual dimensions after scaling
      const originalWidth = element.originalWidth || element.width || (img ? img.width : 100);
      const originalHeight = element.originalHeight || element.height || (img ? img.height : 100);
      
      const newWidth = Math.max(10, originalWidth * scaleX);
      const newHeight = Math.max(10, originalHeight * scaleY);
      
      // Reset scale to 1 and update actual dimensions
      node.scaleX(1);
      node.scaleY(1);
      
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1
      });
    }
    setIsTransforming(false);
  };

  const handleMouseDown = (e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    onSelect(element.id);
    
    if (tool === 'select') {
      const pos = e.target.getStage().getPointerPosition();
      setMouseStartPos(pos);
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e) => {
    if (tool !== 'select' || !mouseStartPos || isTransforming) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const distance = Math.sqrt(
      Math.pow(pos.x - mouseStartPos.x, 2) + Math.pow(pos.y - mouseStartPos.y, 2)
    );
    
    if (distance > 5 && !isDragging) {
      setIsDragging(true);
      setDragStartPos({ x: element.x, y: element.y });
    }
    
    if (isDragging && dragStartPos) {
      const deltaX = pos.x - mouseStartPos.x;
      const deltaY = pos.y - mouseStartPos.y;
      
      const newX = dragStartPos.x + deltaX;
      const newY = dragStartPos.y + deltaY;
      
      if (imageRef.current) {
        imageRef.current.x(newX);
        imageRef.current.y(newY);
        imageRef.current.getLayer().batchDraw();
      }
    }
  };

  const handleMouseUp = (e) => {
    if (tool !== 'select') return;
    
    if (isDragging && onResize && imageRef.current) {
      const node = imageRef.current;
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y()
      });
    }
    
    setIsDragging(false);
    setMouseStartPos(null);
    setDragStartPos(null);
  };

  const handleClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    // Always select on click
    onSelect(element.id);
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    onSelect(element.id);
  };

  const handleDragStart = (e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    onSelect(element.id);
    setIsDragging(true);
    setDragStartPos({ x: element.x, y: element.y });
  };

  const handleDragMove = (e) => {
    if (tool !== 'select' || !isDragging) return;
    
    // Update position in real-time during Konva drag
    if (onResize && imageRef.current) {
      const node = imageRef.current;
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y()
      });
    }
  };

  const handleDragEnd = (e) => {
    if (tool !== 'select') return;
    
    setIsDragging(false);
    setDragStartPos(null);
    
    // Final position update
    if (onResize && imageRef.current) {
      const node = imageRef.current;
      onResize(element.id, {
        ...element,
        x: node.x(),
        y: node.y()
      });
    }
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
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        rotation={element.rotation || 0}
        draggable={tool === 'select'} // Enable Konva dragging
        onClick={handleClick}
        onTap={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        listening={true}
        onTransformStart={handleTransformStart}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      />

      {isSelected && tool === 'select' && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Prevent extreme distortion by maintaining minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            
            // Optional: maintain aspect ratio if needed
            // const aspectRatio = oldBox.width / oldBox.height;
            // if (Math.abs((newBox.width / newBox.height) - aspectRatio) > 0.1) {
            //   return oldBox;
            // }
            
            return newBox;
          }}
          onTransformStart={handleTransformStart}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          onMouseDown={handleTransformerInteraction}
          onTouchStart={handleTransformerInteraction}
          onClick={handleTransformerInteraction}
          onTap={handleTransformerInteraction}
          onContextMenu={handleTransformerInteraction}
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
          keepRatio={false} // Set to true if you want to maintain aspect ratio
          centeredScaling={false}
          ignoreStroke={true}
          padding={5}
          rotateAnchorOffset={30}
          flipEnabled={false}
          resizeEnabled={true}
        />
      )}
    </Group>
  );
};
// Enhanced FlowLine component with fixed dragging and endpoint positioning
const FlowLineComponent = ({ line, isSelected, onSelect, onDragEnd, onUpdate, tool }) => {
  const [draggingLine, setDraggingLine] = useState(false);
  const [draggingEndpoint, setDraggingEndpoint] = useState(null);
  const [startPoints, setStartPoints] = useState(null);
  const groupRef = useRef();
  const lineRef = useRef();

  const points = line.points || [50, 50, 200, 50];
  
  // Handle endpoint dragging
  const handleEndpointDragStart = (index) => {
    setDraggingEndpoint(index);
    setStartPoints([...points]);
    onSelect(line.id);
  };

  const handleEndpointDragMove = (index, e) => {
    if (tool !== 'select' || draggingEndpoint === null) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const newPoints = [...startPoints];
    
    // Update the specific endpoint position
    newPoints[index * 2] = pos.x;
    newPoints[index * 2 + 1] = pos.y;
    
    if (onUpdate) {
      onUpdate(line.id, { ...line, points: newPoints });
    }
  };

  const handleEndpointDragEnd = () => {
    setDraggingEndpoint(null);
    setStartPoints(null);
    if (onDragEnd) {
      onDragEnd(line.id, { ...line, points });
    }
  };

  // Handle line dragging
  const handleLineDragStart = (e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setStartPoints([...points]);
    setDraggingLine(true);
    onSelect(line.id);
  };

  const handleLineDragMove = (e) => {
    if (tool !== 'select' || !draggingLine || !startPoints) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    const deltaX = pos.x - startPoints[0];
    const deltaY = pos.y - startPoints[1];
    
    const newPoints = [
      startPoints[0] + deltaX,
      startPoints[1] + deltaY,
      startPoints[2] + deltaX,
      startPoints[3] + deltaY
    ];
    
    if (onUpdate) {
      onUpdate(line.id, { ...line, points: newPoints });
    }
  };

  const handleLineDragEnd = () => {
    setDraggingLine(false);
    setStartPoints(null);
    if (onDragEnd) {
      onDragEnd(line.id, { ...line, points });
    }
  };

  const handleClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    onSelect(line.id);
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    onSelect(line.id);
    
    // Context menu will be handled by the parent component
  };

  return (
    <Group ref={groupRef}>
      <Line
        ref={lineRef}
        points={points}
        stroke={line.color || "#000000"}
        strokeWidth={line.strokeWidth || 2}
        hitStrokeWidth={Math.max(20, (line.strokeWidth || 2) * 4)}
        draggable={tool === 'select'}
        onClick={handleClick}
        onTap={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleLineDragStart}
        onDragMove={handleLineDragMove}
        onDragEnd={handleLineDragEnd}
        listening={true}
        lineCap="round"
        lineJoin="round"
        tension={line.style === 'curved' ? 0.5 : 0}
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
            onDragStart={() => handleEndpointDragStart(0)}
            onDragMove={(e) => handleEndpointDragMove(0, e)}
            onDragEnd={handleEndpointDragEnd}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onContextMenu={handleContextMenu}
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
            onDragStart={() => handleEndpointDragStart(1)}
            onDragMove={(e) => handleEndpointDragMove(1, e)}
            onDragEnd={handleEndpointDragEnd}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              if (e.evt) e.evt.stopPropagation();
            }}
            onContextMenu={handleContextMenu}
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

// 2. Updated TextNode component with better transform handling
const TextNode = ({ text, isSelected, onSelect, onChange, tool }) => {
  const textRef = useRef();
  const trRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState(null);
  
  const handleTransformerMouseDown = (e) => {
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
  };

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current && tool === 'select') {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, tool]);

  const handleTransformStart = () => {
    setIsTransforming(true);
  };

  const handleTransform = () => {
    if (textRef.current && onChange) {
      const node = textRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();

      // Calculate new font size based on average scale
      const avgScale = (scaleX + scaleY) / 2;
      const newFontSize = Math.max(8, Math.round((text.fontSize || 24) * avgScale));

      // Update the element with new properties for live preview
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y(),
        rotation: rotation,
        fontSize: newFontSize
      });
    }
  };

  const handleTransformEnd = () => {
    if (textRef.current && onChange) {
      const node = textRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();

      // Calculate new font size based on average scale
      const avgScale = (scaleX + scaleY) / 2;
      const newFontSize = Math.max(8, Math.round((text.fontSize || 24) * avgScale));

      // Reset scale to 1 after applying to fontSize
      node.scaleX(1);
      node.scaleY(1);

      // Update the element with final properties
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y(),
        rotation: rotation,
        fontSize: newFontSize
      });
    }
    setIsTransforming(false);
  };

  const handleMouseDown = (e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
 
    onSelect(text.id);

    if (tool === 'select') {
      const pos = e.target.getStage().getPointerPosition();
      setMouseStartPos(pos);
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e) => {
    if (tool !== 'select' || !mouseStartPos || isTransforming) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const distance = Math.sqrt(
      Math.pow(pos.x - mouseStartPos.x, 2) + Math.pow(pos.y - mouseStartPos.y, 2)
    );

    if (distance > 5 && !isDragging) {
      setIsDragging(true);
      setDragStartPos({ x: text.x, y: text.y });
    }

    if (isDragging && dragStartPos) {
      const deltaX = pos.x - mouseStartPos.x;
      const deltaY = pos.y - mouseStartPos.y;
      
      const newX = dragStartPos.x + deltaX;
      const newY = dragStartPos.y + deltaY;

      if (textRef.current) {
        textRef.current.x(newX);
        textRef.current.y(newY);
        textRef.current.getLayer().batchDraw();
      }
    }
  };

  const handleMouseUp = (e) => {
    if (tool !== 'select') return;
    
    // If we were dragging, update the final position
    if (isDragging && onChange && textRef.current) {
      const node = textRef.current;
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y()
      });
    }
    
    // Reset states
    setIsDragging(false);
    setMouseStartPos(null);
    setDragStartPos(null);
  };

  const handleClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    // Always select on click, regardless of current selection state
    onSelect(text.id);
  };

  const handleDragStart = (e) => {
    if (tool !== 'select') return;
    
    e.cancelBubble = true;
    if (e.evt) e.evt.stopPropagation();
    
    onSelect(text.id);
    setIsDragging(true);
    setDragStartPos({ x: text.x, y: text.y });
  };

  const handleDragMove = (e) => {
    if (tool !== 'select' || !isDragging) return;
    
    // Dragging is handled by Konva internally when draggable=true
    // We just need to update the position in our state
    if (onChange && textRef.current) {
      const node = textRef.current;
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y()
      });
    }
  };

  const handleDragEnd = (e) => {
    if (tool !== 'select') return;
    
    setIsDragging(false);
    setDragStartPos(null);
    
    // Final position update
    if (onChange && textRef.current) {
      const node = textRef.current;
      onChange(text.id, {
        ...text,
        x: node.x(),
        y: node.y()
      });
    }
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
        draggable={tool === 'select'} // Enable dragging when select tool is active
        rotation={text.rotation || 0}
        fontStyle={text.fontStyle || 'normal'}
        onClick={handleClick}
        onTap={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        listening={true}
        onTransformStart={handleTransformStart}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
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
            // Minimum size constraints
            if (newBox.width < 10) newBox.width = 10;
            if (newBox.height < 5) newBox.height = 5;
            return newBox;
          }}
          onTransformStart={handleTransformStart}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          onMouseDown={handleTransformerMouseDown}
          onTouchStart={handleTransformerMouseDown}
          onClick={handleTransformerMouseDown}
          onTap={handleTransformerMouseDown}
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
          resizeEnabled={true}
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
    setUndoStack(prev => [...prev, elements]);
    setElements(prev => [...prev, element]);
    setRedoStack([]);
    setSelectedId(element.id);
  };
  // Add this function inside DrawingBoard
const updateElementWithHistory = (action, element, newProps = null) => {
  setUndoStack(prev => [...prev, { action, element }]);
  
  if (action === 'create') {
    setElements(prev => [...prev, element]);
    setSelectedId(element.id);
  } 
  else if (action === 'update') {
    setElements(prev => 
      prev.map(el => el.id === element.id ? { ...el, ...newProps } : el)
    );
  }
  
  setRedoStack([]);
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
       addElementWithHistory(imageElement);
        setSelectedId(imageElement.id);
        // Force tool to select for immediate interaction
        setTool('select');
      };
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

 const handleElementSelect = (id) => {
  setSelectedId(id);
  setContextMenu({ ...contextMenu, show: false });
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

    // Update text creation to use history
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
    // Use addElementWithHistory instead of setElements
    addElementWithHistory(newText);
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
    strokeWidth: penWidth,
    style: lineStyle  // Add this line
  };
  setFlowLine(newLine);
  break;
  }
};

const handleMouseUp = () => {
  // In handleMouseUp for pen tool
if (tool === 'pen' && isDrawing.current && penPoints.length > 0) {
  const lastLine = penPoints[penPoints.length - 1];
  if (lastLine && lastLine.points.length >= 4) {
    const newElement = {
      id: Date.now().toString(),
      type: 'drawing',  // Make sure this matches the type we check for eraser
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

        {/* Rest of toolbar content */}
        {!isToolboxMinimized && (
          <div className={`${
  tool === 'text' 
    ? 'overflow-visible' 
    : 'overflow-y-auto custom-scrollbar max-h-[calc(100vh-8rem)]'
}`}>
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
                  onClick={() => setTool('select')}
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
                  onClick={() => setTool('pen')}
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
                  onClick={() => setTool('text')}
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
                  onClick={() => setTool('eraser')}
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
                  onClick={() => setTool('flowLine')}
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
                            addElementWithHistory(newText);
                            setSelectedId(newText.id);
                            setText({ ...text, content: '' });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-text"
                        autoFocus={tool === 'text'}
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
                    <input
                      type="number"
                      value={text.fontSize}
                      onChange={(e) => setText({ ...text, fontSize: parseInt(e.target.value) })}
                      className="px-3 py-2 border rounded-lg cursor-text"
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
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['straight', 'curved'].map((style) => (
                      <button
                        key={style}
                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
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
    setElements(prev => prev.filter(el => el.id !== lastAction.element.id));
    setSelectedId(null);
  } 
  else if (lastAction.action === 'update') {
    // Restore previous version of element
    setElements(prev => 
      prev.map(el => el.id === lastAction.element.id ? lastAction.element : el)
    );
    setSelectedId(lastAction.element.id);
  } 
  else if (lastAction.action === 'delete') {
    // Restore deleted element
    setElements(prev => [...prev, lastAction.element]);
    setSelectedId(lastAction.element.id);
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
    setElements(prev => [...prev, nextAction.element]);
    setSelectedId(nextAction.element.id);
  } 
  else if (nextAction.action === 'update') {
    // Re-apply update
    setElements(prev => 
      prev.map(el => el.id === nextAction.updatedElement.id ? nextAction.updatedElement : el)
    );
    setSelectedId(nextAction.updatedElement.id);
  } 
  else if (nextAction.action === 'delete') {
    // Re-delete element
    setElements(prev => prev.filter(el => el.id !== nextAction.element.id));
    setSelectedId(null);
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
    
    // Calculate available space
    const rightSpace = viewportWidth - (containerRect.left + pos.x);
    const bottomSpace = viewportHeight - (containerRect.top + pos.y);
    
    // Adjust position if needed
    let adjustedX = pos.x + containerRect.left;
    let adjustedY = pos.y + containerRect.top;
    
    // Ensure menu stays within viewport
    if (rightSpace < 250) adjustedX -= 250;
    if (bottomSpace < 300) adjustedY -= 300;
    
    // Corrected state update
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
          e.cancelBubble = true;
          if (e.evt) e.evt.stopPropagation();
          handleElementSelect(element.id);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          if (e.evt) e.evt.stopPropagation();
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