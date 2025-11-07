/**
 * ImageFrame Component
 * Main component implementing the Frame-Content structure with crop functionality
 */

"use client";

import React, { useRef, useEffect, useState } from "react";
import { useImageFrameStore } from "@/store/use-image-frame-store";
import { ResizeHandles } from "./resize-handles";
import type { ResizeHandle } from "@/types/image-frame";

interface ImageFrameProps {
  src: string;
  alt?: string;
  onLoad?: (dimensions: { width: number; height: number }) => void;
}

export function ImageFrame({ src, alt = "Image", onLoad }: ImageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    config,
    isResizing,
    activeHandle,
    isEditMode,
    startResize,
    updateResize,
    endResize,
    toggleEditMode,
    updateContentPosition,
    initializeFrame,
  } = useImageFrameStore();

  // Initialize frame when image loads
  useEffect(() => {
    const image = imageRef.current;
    const container = containerRef.current;

    if (image && container && isImageLoaded) {
      const imageDimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      const containerDimensions = {
        width: container.clientWidth,
        height: container.clientHeight,
      };

      initializeFrame(imageDimensions, containerDimensions);
      onLoad?.(imageDimensions);
    }
  }, [isImageLoaded, initializeFrame, onLoad]);

  // Handle resize mouse move
  useEffect(() => {
    if (!isResizing || !activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = {
        x: e.movementX,
        y: e.movementY,
      };
      updateResize(delta);
    };

    const handleMouseUp = () => {
      endResize();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, activeHandle, updateResize, endResize]);

  // Handle content dragging in edit mode
  useEffect(() => {
    if (!isDragging || !isEditMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newOffset = {
        x: config.contentOffset.x + e.movementX,
        y: config.contentOffset.y + e.movementY,
      };
      updateContentPosition(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isEditMode, config.contentOffset, updateContentPosition]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleResizeStart = (handle: ResizeHandle["position"]) => {
    startResize(handle);
  };

  const handleFrameMouseDown = (e: React.MouseEvent) => {
    if (isEditMode && e.target === e.currentTarget) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleFrameDoubleClick = () => {
    toggleEditMode();
  };

  if (!isImageLoaded) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          className="hidden"
        />
        <div className="text-gray-400 text-sm">Loading image...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 flex items-center justify-center"
    >
      {/* Hidden image for dimension reference */}
      <img ref={imageRef} src={src} alt={alt} className="hidden" />

      {/* Frame Container */}
      <div
        ref={frameRef}
        className="absolute"
        style={{
          left: config.position.x,
          top: config.position.y,
          width: config.frame.width,
          height: config.frame.height,
        }}
      >
        {/* Frame with border and overflow hidden */}
        <div
          className={`relative w-full h-full overflow-hidden rounded-sm ${
            isEditMode
              ? "ring-4 ring-green-500 ring-opacity-75"
              : "ring-2 ring-blue-500 ring-opacity-50"
          } ${isEditMode ? "cursor-move" : "cursor-default"}`}
          onMouseDown={handleFrameMouseDown}
          onDoubleClick={handleFrameDoubleClick}
        >
          {/* Content (Image) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: config.contentOffset.x,
              top: config.contentOffset.y,
              width: config.content.width * config.contentScale,
              height: config.content.height * config.contentScale,
            }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Edit mode overlay */}
          {isEditMode && (
            <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none flex items-center justify-center">
              <div className="bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-lg text-sm font-medium text-gray-700">
                Drag to reposition • Double-click to exit
              </div>
            </div>
          )}
        </div>

        {/* Resize Handles (corner only) */}
        <ResizeHandles
          onResizeStart={handleResizeStart}
          isActive={!isEditMode && !isResizing}
        />
      </div>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-sm text-xs text-gray-600">
        <div className="flex flex-col gap-1">
          <div>
            <span className="font-semibold">Frame:</span> {Math.round(config.frame.width)} x{" "}
            {Math.round(config.frame.height)}
          </div>
          <div>
            <span className="font-semibold">Aspect Ratio:</span> {config.aspectRatio}
          </div>
          <div>
            <span className="font-semibold">Mode:</span> {isEditMode ? "Edit (Pan)" : "Frame"}
          </div>
        </div>
      </div>
    </div>
  );
}
