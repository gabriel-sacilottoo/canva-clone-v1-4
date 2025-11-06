"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type AspectRatio = "4:3" | "16:9" | "1:1" | "9:16" | "3:2" | "2:3" | "21:9";

export interface ContentTransform {
  x: number;
  y: number;
  scale: number;
}

export interface ImageFrameState {
  isEditMode: boolean;
  contentTransform: ContentTransform;
  frameAspectRatio: AspectRatio;
  isDragging: boolean;
  isScaling: boolean;
}

export const ASPECT_RATIOS: Record<AspectRatio, number> = {
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "1:1": 1,
  "9:16": 9 / 16,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "21:9": 21 / 9,
};

export const useImageFrame = (initialAspectRatio: AspectRatio = "4:3") => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [contentTransform, setContentTransform] = useState<ContentTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [frameAspectRatio, setFrameAspectRatio] = useState<AspectRatio>(initialAspectRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialTransform = useRef<ContentTransform | null>(null);

  // Enter edit mode (double-click handler)
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  // Exit edit mode (ESC or click outside)
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setIsDragging(false);
    setIsScaling(false);
  }, []);

  // Start dragging content
  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    initialTransform.current = { ...contentTransform };
  }, [contentTransform]);

  // Update content position during drag
  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStartPos.current || !initialTransform.current) return;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    setContentTransform({
      ...initialTransform.current,
      x: initialTransform.current.x + deltaX,
      y: initialTransform.current.y + deltaY,
    });
  }, [isDragging]);

  // End dragging
  const endDrag = useCallback(() => {
    setIsDragging(false);
    dragStartPos.current = null;
    initialTransform.current = null;
  }, []);

  // Update content scale (zoom)
  const updateScale = useCallback((newScale: number, minScale: number = 1) => {
    // Ensure content never gets smaller than frame (minimum coverage)
    const clampedScale = Math.max(newScale, minScale);
    setContentTransform((prev) => ({
      ...prev,
      scale: clampedScale,
    }));
  }, []);

  // Start scaling
  const startScale = useCallback(() => {
    setIsScaling(true);
  }, []);

  // End scaling
  const endScale = useCallback(() => {
    setIsScaling(false);
  }, []);

  // Change aspect ratio
  const changeAspectRatio = useCallback((newRatio: AspectRatio) => {
    setFrameAspectRatio(newRatio);
  }, []);

  // Reset transform to default
  const resetTransform = useCallback(() => {
    setContentTransform({
      x: 0,
      y: 0,
      scale: 1,
    });
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditMode) {
        exitEditMode();
      }
    };

    if (isEditMode) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isEditMode, exitEditMode]);

  return {
    // State
    isEditMode,
    contentTransform,
    frameAspectRatio,
    isDragging,
    isScaling,

    // Actions
    enterEditMode,
    exitEditMode,
    startDrag,
    updateDrag,
    endDrag,
    updateScale,
    startScale,
    endScale,
    changeAspectRatio,
    resetTransform,

    // Utilities
    aspectRatioValue: ASPECT_RATIOS[frameAspectRatio],
  };
};
