import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const VisionItem = ({ items }) => {
  return (
    <div className="vision-items">
      {items.map((item, index) => (
        <Draggable key={item._id} draggableId={item._id} index={index}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="vision-item">
              {item.type === "image" ? <img src={item.content} alt="Vision" /> : <p>{item.content}</p>}
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
};

export default VisionItem;
