import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text, Image, Line, Circle, Group, Transformer, Rect } from "react-konva";
import useImage from "use-image";
import SaveCanvasModal from "./SaveCanvasModal";

// Component to render an image element using its URL with resizing capability
const URLImage = ({ element, onDragEnd, onSelect, isSelected, onResize }) => {
  const [img] = useImage(element.src);
  const imageRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    if (imageRef.current) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply new dimensions
      node.scaleX(1);
      node.scaleY(1);
      
      // Update the element with new size
      onResize(element.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY)
      });
    }
  };

  return (
    <>
      <Image
        ref={imageRef}
        image={img}
        x={element.x}
        y={element.y}
        width={element.width || (img ? img.width : 100)}
        height={element.height || (img ? img.height : 100)}
        draggable
        onClick={() => onSelect(element.id)}
        onTap={() => onSelect(element.id)}
        onDragEnd={(e) => onDragEnd(e, element.id)}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size validation
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};

// Enhanced FlowLine component with improved draggable behavior
const FlowLine = ({ element, onDragEnd, onSelect, isSelected }) => {
  const { id, points, color = "blue", strokeWidth = 2 } = element;
  const [linePoints, setLinePoints] = useState(points);
  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const lineRef = useRef();

  // Handle dragging of the entire line (Canva-like behavior)
  const handleLineDragStart = (e) => {
    if (isDraggingPoint) return;
    
    const pos = e.target.getStage().getPointerPosition();
    setStartPos({ x: pos.x, y: pos.y });
    setIsDraggingLine(true);
    
    // Change cursor to indicate dragging
    document.body.style.cursor = "grabbing";
  };

  const handleLineDragMove = (e) => {
    if (!isDraggingLine || isDraggingPoint) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const dx = pos.x - startPos.x;
    const dy = pos.y - startPos.y;
    
    // Move all points
    const newPoints = [...linePoints];
    for (let i = 0; i < newPoints.length; i += 2) {
      newPoints[i] += dx;
      newPoints[i + 1] += dy;
    }
    
    setLinePoints(newPoints);
    setStartPos({ x: pos.x, y: pos.y });
  };

  const handleLineDragEnd = () => {
    if (isDraggingLine) {
      setIsDraggingLine(false);
      if (onDragEnd) {
        onDragEnd(null, id, linePoints);
      }
      
      // Reset cursor
      document.body.style.cursor = "default";
    }
  };

  // Enhanced endpoint dragging
  const handleEndpointDragStart = (index) => {
    setIsDraggingPoint(true);
    setDragPointIndex(index);
  };

  const handleEndpointDragMove = (e, index) => {
    if (!isDraggingPoint || dragPointIndex !== index) return;
    
    const pos = e.target.position();
    let newPoints = [...linePoints];
    
    // Update the specific endpoint position
    if (index === 0) {
      newPoints[0] = pos.x;
      newPoints[1] = pos.y;
    } else {
      newPoints[2] = pos.x;
      newPoints[3] = pos.y;
    }
    
    setLinePoints(newPoints);
  };

  const handleEndpointDragEnd = (e, index) => {
    if (isDraggingPoint && dragPointIndex === index) {
      setIsDraggingPoint(false);
      setDragPointIndex(null);
      
      if (onDragEnd) {
        onDragEnd(e, id, linePoints);
      }
    }
  };

  // Line hover effects
  const handleLineHover = () => {
    if (!isDraggingPoint) {
      document.body.style.cursor = "grab";
    }
  };

  const handleLineHoverExit = () => {
    if (!isDraggingLine && !isDraggingPoint) {
      document.body.style.cursor = "default";
    }
  };

  return (
    <Group
      onClick={() => onSelect(id)}
      onTap={() => onSelect(id)}
    >
      <Line
        ref={lineRef}
        points={linePoints}
        stroke={color}
        strokeWidth={strokeWidth}
        hitStrokeWidth={20} // Wider hit area for easier selection
        onMouseEnter={handleLineHover}
        onMouseLeave={handleLineHoverExit}
        onMouseDown={handleLineDragStart}
        onMouseMove={handleLineDragMove}
        onMouseUp={handleLineDragEnd}
        onTouchStart={handleLineDragStart}
        onTouchMove={handleLineDragMove}
        onTouchEnd={handleLineDragEnd}
      />
      <Circle
        x={linePoints[0]}
        y={linePoints[1]}
        radius={6}
        fill={isSelected ? "green" : "red"}
        draggable
        onDragStart={() => handleEndpointDragStart(0)}
        onDragMove={(e) => handleEndpointDragMove(e, 0)}
        onDragEnd={(e) => handleEndpointDragEnd(e, 0)}
      />
      <Circle
        x={linePoints[2]}
        y={linePoints[3]}
        radius={6}
        fill={isSelected ? "green" : "red"}
        draggable
        onDragStart={() => handleEndpointDragStart(1)}
        onDragMove={(e) => handleEndpointDragMove(e, 1)}
        onDragEnd={(e) => handleEndpointDragEnd(e, 1)}
      />
    </Group>
  );
};

// Helper function to determine if a color is dark
const isDarkColor = (hexColor) => {
  // Remove the # if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark (luminance is less than 0.5)
  return luminance < 0.5;
};

// Function to get contrast color (black for light backgrounds, white for dark)
const getContrastColor = (bgColor) => {
  return isDarkColor(bgColor) ? "#FFFFFF" : "#000000";
};

const VisionBoardDraw = () => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
const [canvasImageUri, setCanvasImageUri] = useState(null);
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const textEditorDivRef = useRef(null);
  
  // Board background color state
  const [boardColor, setBoardColor] = useState("#FFFFFF");
  
  // Text styling options - now dependent on board color
  const [textStyle, setTextStyle] = useState({
    fontSize: 20,
    fill: "#000000", // Will be updated based on board color
    fontStyle: "normal", // normal, bold, italic
    fontFamily: "Arial" // Added font family option
  });
  
  // Line styling options - now dependent on board color
  const [lineStyle, setLineStyle] = useState({
    color: "#000000", // Will be updated based on board color
    strokeWidth: 2
  });

  // In-place text editor position state
  const [textEditorPos, setTextEditorPos] = useState({ x: 0, y: 0 });

  // Update default colors when board color changes
  useEffect(() => {
    const contrastColor = getContrastColor(boardColor);
    
    // Update text style with appropriate contrast color
    setTextStyle(prev => ({
      ...prev,
      fill: contrastColor
    }));
    
    // Update line style with appropriate contrast color
    setLineStyle(prev => ({
      ...prev,
      color: contrastColor
    }));
    
    // Update existing elements if needed for better contrast
    setElements(prevElements => 
      prevElements.map(el => {
        // For text elements without explicitly set color, update to contrast color
        if (el.type === "text" && !el.hasOwnProperty("fill")) {
          return { ...el, fill: contrastColor };
        }
        // For line elements without explicitly set color, update to contrast color
        if (el.type === "line" && !el.hasOwnProperty("color")) {
          return { ...el, color: contrastColor };
        }
        return el;
      })
    );
  }, [boardColor]);

  // Add a new text element
  const addText = () => {
    const newText = {
      id: `text-${elements.length}`,
      type: "text",
      text: "Double-click to edit",
      x: 50,
      y: 50,
      draggable: true,
      ...textStyle
    };
    setElements([...elements, newText]);
  };

  // Trigger file input for image upload
  const addImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selection and add image element
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newImage = {
          id: `image-${elements.length}`,
          type: "image",
          src: reader.result,
          x: 100,
          y: 100,
          draggable: true
        };
        setElements([...elements, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a flow/connection line element with default endpoints
  const addFlowLine = () => {
    const newLine = {
      id: `line-${elements.length}`,
      type: "line",
      points: [60, 60, 200, 200],
      color: lineStyle.color,
      strokeWidth: lineStyle.strokeWidth
    };
    setElements([...elements, newLine]);
  };

  // Remove the last added element (simple undo)
  const undoLastElement = () => {
    setElements((prev) => prev.slice(0, -1));
  };

  // Delete the selected element
  const deleteSelected = () => {
    if (selectedId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Update position for draggable text or image elements
  const handleDragEnd = (e, id) => {
    const { x, y } = e.target.position();
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  // Update flow line endpoints after dragging
  const handleLineDragEnd = (e, id, newPoints) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, points: newPoints } : el))
    );
  };

  // Update image size after resizing
  const handleImageResize = (id, newAttrs) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

  // Position the text editor next to the text being edited
  const positionTextEditor = (textElement) => {
    if (!stageRef.current) return { x: 0, y: 0 };
    
    // Get the stage container's position
    const stageBox = stageRef.current.container().getBoundingClientRect();
    
    // Calculate position with fixed offsets from the text element
    // Use the actual text position within the stage plus the stage's position on the page
    const x = stageBox.left + textElement.x;
    
    // Position slightly below the text (10px offset)
    const y = stageBox.top + textElement.y + 30;
    
    return { x, y };
  };

  // Start editing text on double-click
  const handleTextDoubleClick = (id, currentText) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    setSelectedTextId(id);
    setEditingTextValue(currentText);
    
    // Position the text editor next to the text element
    const pos = positionTextEditor(element);
    setTextEditorPos(pos);
    
    // Focus the input once it's rendered
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 10);
  };

  const handleTextChange = (e) => {
    setEditingTextValue(e.target.value);
  };

  // Save edited text
  const handleTextBlur = (e) => {
    // Check if the related target is within the text editor div
    // This prevents the editor from closing when clicking on style controls
    if (e && textEditorDivRef.current && textEditorDivRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (selectedTextId) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedTextId ? { ...el, text: editingTextValue } : el
        )
      );
      setSelectedTextId(null);
      setEditingTextValue("");
    }
  };

  // Save text on Enter key press
  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleTextSubmit();
    }
  };

  // Explicitly save text without relying on blur
  const handleTextSubmit = () => {
    if (selectedTextId) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedTextId ? { ...el, text: editingTextValue } : el
        )
      );
      setSelectedTextId(null);
      setEditingTextValue("");
    }
  };

  // Handle element selection
  const handleSelect = (id) => {
    const newSelectedId = id === selectedId ? null : id;
    setSelectedId(newSelectedId);
  };

  // Clear selection when clicking on empty canvas
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // Update text styling
  const updateTextStyle = (property, value) => {
    setTextStyle((prev) => ({ ...prev, [property]: value }));
    
    // If a text element is selected, apply the style to it
    if (selectedTextId) {
      setElements((prev) =>
        prev.map((el) => (el.id === selectedTextId ? { ...el, [property]: value } : el))
      );
    } else if (selectedId && selectedId.startsWith('text-')) {
      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, [property]: value } : el))
      );
    }
  };

  // Update line styling
  const updateLineStyle = (property, value) => {
    setLineStyle((prev) => ({ ...prev, [property]: value }));
    
    // If a line element is selected, apply the style to it
    if (selectedId && selectedId.startsWith('line-')) {
      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, [property]: value } : el))
      );
    }
  };

  // Handle board color change
  const handleBoardColorChange = (e) => {
    setBoardColor(e.target.value);
  };

  // Render an HTML input near the text for editing
  const renderTextEditor = () => {
    if (!selectedTextId) return null;
    
    const element = elements.find((el) => el.id === selectedTextId);
    if (!element) return null;
    
    // Get the styles for the editor
    const fontStyle = element.fontStyle || textStyle.fontStyle;
    const isBold = fontStyle === "bold" || fontStyle.includes("bold");
    const isItalic = fontStyle === "italic" || fontStyle.includes("italic");
    
    return (
      <div
        ref={textEditorDivRef}
        className="text-editor-overlay"
        // Within renderTextEditor function, update the outer div's style:
style={{
  position: "absolute",
  top: textEditorPos.y,
  left: textEditorPos.x,
  zIndex: 1000,
  backgroundColor: "white",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  width: "auto", // Let it size to content
  minWidth: "240px" // Ensure minimum width
}}
        // Stop propagation to prevent unwanted focus loss
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 w-full">
          <input
            ref={textInputRef}
            type="text"
            value={editingTextValue}
            onChange={handleTextChange}
            onBlur={(e) => e.stopPropagation()}
            onKeyDown={handleTextKeyDown}
            style={{
              fontSize: `${element.fontSize || textStyle.fontSize}px`,
              color: element.fill || textStyle.fill,
              fontWeight: isBold ? "bold" : "normal",
              fontStyle: isItalic ? "italic" : "normal",
              fontFamily: element.fontFamily || textStyle.fontFamily,
              padding: "4px",
              width: "100%",
              border: "1px solid #ddd"
            }}
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              {/* Font Size Control */}
              <select
                value={element.fontSize || textStyle.fontSize}
                onChange={(e) => updateTextStyle("fontSize", Number(e.target.value))}
                className="border rounded px-1 py-0.5 text-sm"
                // Stop the blur event from propagating when clicking on the select
                onMouseDown={(e) => e.stopPropagation()}
              >
                {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              
              {/* Font Family Selection */}
              <select
                value={element.fontFamily || textStyle.fontFamily}
                onChange={(e) => updateTextStyle("fontFamily", e.target.value)}
                className="border rounded px-1 py-0.5 text-sm"
                // Stop the blur event from propagating
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              {/* Bold Button */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent focus loss
                  e.stopPropagation();
                  
                  const currentStyle = element.fontStyle || textStyle.fontStyle;
                  let newStyle = currentStyle;
                  
                  if (currentStyle.includes("bold")) {
                    newStyle = currentStyle.replace("bold", "").trim();
                    if (newStyle === "") newStyle = "normal";
                  } else if (currentStyle === "italic") {
                    newStyle = "italic bold";
                  } else {
                    newStyle = "bold";
                  }
                  
                  updateTextStyle("fontStyle", newStyle);
                }}
                className={`px-2 py-1 border rounded ${isBold ? 'bg-blue-200' : 'bg-gray-100'}`}
              >
                B
              </button>
              
              {/* Italic Button */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent focus loss
                  e.stopPropagation();
                  
                  const currentStyle = element.fontStyle || textStyle.fontStyle;
                  let newStyle = currentStyle;
                  
                  if (currentStyle.includes("italic")) {
                    newStyle = currentStyle.replace("italic", "").trim();
                    if (newStyle === "") newStyle = "normal";
                  } else if (currentStyle === "bold") {
                    newStyle = "bold italic";
                  } else {
                    newStyle = "italic";
                  }
                  
                  updateTextStyle("fontStyle", newStyle);
                }}
                className={`px-2 py-1 border rounded ${isItalic ? 'bg-blue-200' : 'bg-gray-100'}`}
                style={{ fontStyle: "italic" }}
              >
                I
              </button>
              
              {/* Color Picker - given more space and using onMouseDown instead of onChange */}
<input
  type="color"
  value={element.fill || textStyle.fill}
  className="w-6 h-6 border rounded cursor-pointer"
  onMouseDown={(e) => e.stopPropagation()}
  onChange={(e) => {
    e.stopPropagation();
    updateTextStyle("fill", e.target.value);
  }}
/>
            </div>
          </div>
          
          <div className="flex justify-between mt-3">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTextSubmit();
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Apply
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setElements((prev) => prev.filter((el) => el.id !== selectedTextId));
                setSelectedTextId(null);
                setEditingTextValue("");
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get element type from ID
  const getElementTypeFromId = (id) => {
    if (!id) return null;
    if (id.startsWith('text-')) return 'text';
    if (id.startsWith('image-')) return 'image';
    if (id.startsWith('line-')) return 'line';
    return null;
  };

  // Render floating controls for selected element
  const renderFloatingControls = () => {
    if (!selectedId || selectedTextId) return null;
    
    const element = elements.find(el => el.id === selectedId);
    if (!element) return null;
    
    const elementType = getElementTypeFromId(selectedId);
    if (!elementType) return null;
    
    // Calculate position
    let controlPosition = { x: 0, y: 0 };
    
    if (elementType === 'text') {
      controlPosition = {
        x: element.x + 10,
        y: element.y - 40
      };
    } else if (elementType === 'image') {
      controlPosition = {
        x: element.x + (element.width || 100) / 2,
        y: element.y - 40
      };
    } else if (elementType === 'line') {
      // For line, position controls near the middle of the line
      const points = element.points;
      const middleX = (points[0] + points[2]) / 2;
      const middleY = (points[1] + points[3]) / 2;
      controlPosition = {
        x: middleX,
        y: middleY - 40
      };
    }
    
    // Get stage position
    const stageBox = stageRef.current.container().getBoundingClientRect();
    const absoluteX = stageBox.left + controlPosition.x;
    const absoluteY = stageBox.top + controlPosition.y;
    
    return (
      <div
        className="floating-controls"
        style={{
          position: "absolute",
          top: absoluteY,
          left: absoluteX,
          zIndex: 1000,
          display: "flex",
          gap: "5px"
        }}
      >
        {elementType === 'text' && (
          <button
            onClick={() => handleTextDoubleClick(selectedId, element.text)}
            className="px-2 py-1 bg-blue-500 text-white rounded-lg text-sm"
          >
            Edit
          </button>
        )}
        
        <button
          onClick={deleteSelected}
          className="px-2 py-1 bg-red-500 text-white rounded-lg text-sm"
        >
          Delete
        </button>
        
        {elementType === 'line' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.color || lineStyle.color}
              onChange={(e) => updateLineStyle("color", e.target.value)}
              className="w-8 h-8 border rounded"
            />
            <select
              value={element.strokeWidth || lineStyle.strokeWidth}
              onChange={(e) => updateLineStyle("strokeWidth", Number(e.target.value))}
              className="border rounded px-1 py-0.5 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Save the current canvas as an image
  const downloadCanvas = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "vision-board.png";
    link.href = uri;
    link.click();
  };

  const saveCanvas = () => {
    const uri = stageRef.current.toDataURL();
    setCanvasImageUri(uri);
    setShowSaveModal(true);
  };
  
  // Add this function to handle the actual saving
  const handleSaveWithMetadata = async (metadata) => {
    const blob = await (await fetch(canvasImageUri)).blob();
    const formData = new FormData();
    
    // Get user ID from session storage
    const userId = JSON.parse(sessionStorage.getItem("user"))?._id;
    if (!userId) {
      throw new Error("User not logged in");
    }
    
    // Append all data to form
    formData.append("file", blob, "vision-board.png");
    formData.append("title", metadata.title);
    formData.append("content", metadata.content);
    formData.append("category", metadata.category);
    formData.append("userId", userId);
    
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/visionBoard/add`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error saving canvas: ${errorText}`);
    }
    
    console.log("Canvas saved successfully!");
    // You could add a success notification here
  };
  
  // Predefined background color options
  const backgroundColorOptions = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#F0F0F0" },
    { name: "Black", value: "#000000" },
    { name: "Dark Blue", value: "#1A365D" },
    { name: "Navy", value: "#0F172A" },
    { name: "Dark Purple", value: "#2E1065" },
    { name: "Forest Green", value: "#064E3B" },
    { name: "Crimson", value: "#7F1D1D" },
    { name: "Pastel Blue", value: "#DBEAFE" },
    { name: "Pastel Green", value: "#DCFCE7" },
    { name: "Pastel Pink", value: "#FCE7F3" },
    { name: "Cream", value: "#FFFBEB" }
  ];
  
  // Handle clicks outside the text editor more carefully
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        textEditorDivRef.current && 
        !textEditorDivRef.current.contains(event.target) && 
        selectedTextId && 
        !event.target.closest(".konvajs-content")
      ) {
        // Only close if clicking outside both the editor and the canvas
        handleTextSubmit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTextId]);

  return (
    <div className="p-5 relative">
      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={addText} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Text
        </button>
        <button onClick={addImage} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Add Image
        </button>
        <button onClick={addFlowLine} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Add Flow Line
        </button>
        <button onClick={undoLastElement} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Undo
        </button>
        <button onClick={downloadCanvas} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
          Download Board
        </button>
        <button onClick={saveCanvas} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
          Save Board
        </button>
        {selectedId && (
          <button onClick={deleteSelected} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete Selected
          </button>
        )}
      </div>
<div className="mb-4">
  <label htmlFor="boardColor" className="block text-sm font-medium mb-1">
    Board Background:
  </label>
  <div className="flex flex-wrap gap-2">
    {backgroundColorOptions.map((color) => (
      <div 
        key={color.value}
        className={`w-8 h-8 rounded-full cursor-pointer border ${
          boardColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'
        }`}
        style={{ backgroundColor: color.value }}
        onClick={() => setBoardColor(color.value)}
        title={color.name}
      />
    ))}
    <input
      type="color"
      id="boardColor"
      value={boardColor}
      onChange={handleBoardColorChange}
      className="w-8 h-8 cursor-pointer"
      title="Custom color"
    />
  </div>
</div>

      <div className="relative mb-5">
      <Stage
  width={800}
  height={600}
  ref={stageRef}
  onMouseDown={checkDeselect}
  onTouchStart={checkDeselect}
  style={{ 
    border: "1px solid #ddd", 
    borderRadius: "8px",
    backgroundColor: boardColor 
  }}
>
          <Layer>
          <Rect width={800} height={600} fill={boardColor} />
            {elements.map((el) => {
              if (el.type === "text") {
                return (
                  <Text
                    key={el.id}
                    text={el.text}
                    x={el.x}
                    y={el.y}
                    draggable
                    onClick={() => handleSelect(el.id)}
                    onTap={() => handleSelect(el.id)}
                    onDragEnd={(e) => handleDragEnd(e, el.id)}
                    fontSize={el.fontSize || textStyle.fontSize}
                    fill={el.fill || textStyle.fill}
                    fontStyle={el.fontStyle || textStyle.fontStyle}
                    fontFamily={el.fontFamily || textStyle.fontFamily}
                    stroke={el.id === selectedId ? "#0096FF" : ""}
                    strokeWidth={el.id === selectedId ? 1 : 0}
                    onDblClick={() => handleTextDoubleClick(el.id, el.text)}
                  />
                );
              } else if (el.type === "image") {
                return (
                  <URLImage 
                    key={el.id} 
                    element={el} 
                    onDragEnd={handleDragEnd}
                    onSelect={handleSelect}
                    isSelected={el.id === selectedId}
                    onResize={handleImageResize}
                  />
                );
              } else if (el.type === "line") {
                return (
                  <FlowLine 
                    key={el.id} 
                    element={el} 
                    onDragEnd={handleLineDragEnd}
                    onSelect={handleSelect}
                    isSelected={el.id === selectedId}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
        {renderTextEditor()}
        {renderFloatingControls()}
      </div>
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {showSaveModal && (
  <SaveCanvasModal
    isOpen={showSaveModal}
    onClose={() => setShowSaveModal(false)}
    onSave={handleSaveWithMetadata}
    imageUri={canvasImageUri}
  />
)}
    </div>
  );
};

export default VisionBoardDraw;