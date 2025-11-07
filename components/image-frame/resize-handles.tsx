/**
 * Resize Handles Component
 * Displays corner-only resize handles for the image frame
 */

"use client";

import React from "react";
import type { ResizeHandle } from "@/types/image-frame";

interface ResizeHandlesProps {
  onResizeStart: (handle: ResizeHandle["position"]) => void;
  isActive?: boolean;
}

const CORNER_HANDLES: ResizeHandle[] = [
  { position: "top-left", cursor: "nwse-resize" },
  { position: "top-right", cursor: "nesw-resize" },
  { position: "bottom-left", cursor: "nesw-resize" },
  { position: "bottom-right", cursor: "nwse-resize" },
];

const getHandleStyle = (position: ResizeHandle["position"]) => {
  const baseStyle = "absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full hover:scale-125 transition-transform";

  const positionStyles: Record<ResizeHandle["position"], string> = {
    "top-left": "-top-1.5 -left-1.5",
    "top-right": "-top-1.5 -right-1.5",
    "bottom-left": "-bottom-1.5 -left-1.5",
    "bottom-right": "-bottom-1.5 -right-1.5",
  };

  return `${baseStyle} ${positionStyles[position]}`;
};

export function ResizeHandles({ onResizeStart, isActive = true }: ResizeHandlesProps) {
  if (!isActive) return null;

  return (
    <>
      {CORNER_HANDLES.map((handle) => (
        <div
          key={handle.position}
          className={getHandleStyle(handle.position)}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(handle.position);
          }}
          role="button"
          aria-label={`Resize from ${handle.position}`}
        />
      ))}
    </>
  );
}
