"use client";

import { ToolHeader } from "@/components/global/tool-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanvas } from "@/store/useCanvas";
import { AspectRatio, useImageFrame, ASPECT_RATIOS } from "@/hooks/use-image-frame";
import * as fabric from "fabric";
import { useEffect, useState, useCallback } from "react";
import { Crop, RotateCcw } from "lucide-react";
import {
  applyFrameToImage,
  createFrameFromImage,
  enableFrameMode,
  disableFrameMode,
  setupDoubleClickHandler,
  removeDoubleClickHandler,
  enterImageEditMode,
  exitImageEditMode,
  isImageInEditMode,
  setupContentPanning,
  removeContentPanning,
} from "@/lib/image-frame-utils";

const ImageCrop = () => {
  const { canvas } = useCanvas();
  const activeObj = canvas?.getActiveObject();
  const [isCropMode, setIsCropMode] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);

  const {
    frameAspectRatio,
    changeAspectRatio,
  } = useImageFrame("4:3");

  // Apply aspect ratio to selected image
  const applyAspectRatio = useCallback((ratio: AspectRatio) => {
    if (!activeObj || activeObj.type !== "image" || !canvas) return;

    const image = activeObj as fabric.Image;
    const aspectRatioValue = ASPECT_RATIOS[ratio];

    // Create frame configuration
    const frameConfig = createFrameFromImage(image, aspectRatioValue);

    // Apply frame to image
    applyFrameToImage(image, frameConfig, canvas);

    // Enable frame mode (corner-only handles)
    enableFrameMode(image);

    changeAspectRatio(ratio);
    setIsCropMode(true);
  }, [activeObj, canvas, changeAspectRatio]);

  // Enable crop mode - restrict handles to corners only
  const handleEnableCropMode = useCallback(() => {
    if (!activeObj || activeObj.type !== "image") return;

    const image = activeObj as fabric.Image;
    enableFrameMode(image);
    setIsCropMode(true);
    canvas?.renderAll();
  }, [activeObj, canvas]);

  // Disable crop mode - restore all controls
  const handleDisableCropMode = useCallback(() => {
    if (!activeObj || activeObj.type !== "image") return;

    const image = activeObj as fabric.Image;
    disableFrameMode(image);
    setIsCropMode(false);
    canvas?.renderAll();
  }, [activeObj, canvas]);

  // Handle entering edit mode
  const handleEnterEditMode = useCallback(() => {
    if (!activeObj || activeObj.type !== "image" || !canvas) return;

    const image = activeObj as fabric.Image;
    enterImageEditMode(image, canvas);
    setIsEditModeActive(true);
  }, [activeObj, canvas]);

  // Handle exiting edit mode
  const handleExitEditMode = useCallback(() => {
    if (!activeObj || activeObj.type !== "image" || !canvas) return;

    const image = activeObj as fabric.Image;
    exitImageEditMode(image, canvas);
    setIsEditModeActive(false);
  }, [activeObj, canvas]);

  // Setup double-click handler for edit mode
  useEffect(() => {
    if (!canvas || !activeObj || activeObj.type !== "image") return;

    const image = activeObj as fabric.Image;

    // Setup double-click to enter edit mode
    setupDoubleClickHandler(image, canvas, handleEnterEditMode);

    // Setup content panning
    setupContentPanning(image, canvas);

    return () => {
      // Cleanup handlers
      removeDoubleClickHandler(image);
      removeContentPanning(image, canvas);
    };
  }, [canvas, activeObj, handleEnterEditMode]);

  // Handle ESC key to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditModeActive) {
        handleExitEditMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditModeActive, handleExitEditMode]);

  // Reset image transform
  const handleReset = useCallback(() => {
    if (!activeObj || activeObj.type !== "image" || !canvas) return;

    const image = activeObj as fabric.Image;

    // Remove clipPath
    image.set({
      clipPath: undefined,
    });

    // Reset controls
    disableFrameMode(image);

    // Clear stored frame data
    delete (image as any)._frameConfig;
    delete (image as any)._contentTransform;

    setIsCropMode(false);
    setIsEditModeActive(false);
    canvas?.renderAll();
  }, [activeObj, canvas]);

  return (
    <div className="flex flex-col space-y-4">
      <ToolHeader
        title="Image Frame & Crop"
        description="Adjust aspect ratio and crop image"
      />

      {/* Aspect Ratio Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Aspect Ratio</label>
        <Select
          value={frameAspectRatio}
          onValueChange={(value) => applyAspectRatio(value as AspectRatio)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
            <SelectItem value="3:2">3:2 (Classic)</SelectItem>
            <SelectItem value="2:3">2:3 (Portrait Classic)</SelectItem>
            <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Crop Mode Toggle */}
      <div className="space-y-2">
        <Button
          variant={isCropMode ? "default" : "outline"}
          size="lg"
          className="w-full justify-start"
          onClick={isCropMode ? handleDisableCropMode : handleEnableCropMode}
        >
          <Crop className="mr-2 h-4 w-4" />
          {isCropMode ? "Exit Crop Mode" : "Enter Crop Mode"}
        </Button>
      </div>

      {/* Edit Mode Info */}
      {isEditModeActive && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Edit Mode Active</span>
            <br />
            Drag to reposition image inside frame
            <br />
            Press ESC or click outside to exit
          </p>
        </div>
      )}

      {/* Crop Mode Info */}
      {isCropMode && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Crop Mode Active</span>
            <br />
            Use corner handles to resize frame
            <br />
            Aspect ratio is locked
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Double-click</span> the image to reposition content inside the frame
        </p>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full justify-start"
        onClick={handleReset}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Crop
      </Button>
    </div>
  );
};

export default ImageCrop;
