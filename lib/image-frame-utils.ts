import * as fabric from "fabric";

export interface FrameConfig {
  aspectRatio: number;
  width: number;
  height: number;
}

export interface ContentTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

/**
 * Creates a frame configuration from an image object
 */
export function createFrameFromImage(
  image: fabric.Image,
  aspectRatio: number = 4 / 3
): FrameConfig {
  const imgWidth = image.width || 200;
  const imgHeight = image.height || 200;

  const currentRatio = imgWidth / imgHeight;

  let frameWidth = imgWidth;
  let frameHeight = imgHeight;

  if (currentRatio > aspectRatio) {
    // Image is wider, constrain by height
    frameWidth = imgHeight * aspectRatio;
  } else {
    // Image is taller, constrain by width
    frameHeight = imgWidth / aspectRatio;
  }

  return {
    aspectRatio,
    width: frameWidth,
    height: frameHeight,
  };
}

/**
 * Apply frame with clipPath to image
 */
export function applyFrameToImage(
  image: fabric.Image,
  frameConfig: FrameConfig,
  canvas?: fabric.Canvas
) {
  const clipPath = new fabric.Rect({
    width: frameConfig.width,
    height: frameConfig.height,
    originX: "center",
    originY: "center",
    absolutePositioned: false,
  });

  image.set({
    clipPath,
  });

  // Store frame data on the image for later reference
  (image as any)._frameConfig = frameConfig;
  (image as any)._contentTransform = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  };

  image.setCoords();
  canvas?.renderAll();
}

/**
 * Enable edit mode on image - allows content manipulation
 */
export function enterImageEditMode(
  image: fabric.Image,
  canvas: fabric.Canvas
) {
  // Store original state
  (image as any)._editMode = true;
  (image as any)._originalSelectable = image.selectable;
  (image as any)._originalEvented = image.evented;

  // Change cursor to indicate edit mode
  image.set({
    hoverCursor: "move",
  });

  // Add visual indicator - border highlight
  image.set({
    borderColor: "#3b82f6", // Blue border
    borderScaleFactor: 2,
  });

  canvas.renderAll();
}

/**
 * Exit edit mode
 */
export function exitImageEditMode(
  image: fabric.Image,
  canvas: fabric.Canvas
) {
  (image as any)._editMode = false;

  image.set({
    hoverCursor: "move",
    borderColor: "#0066ff",
    borderScaleFactor: 1,
  });

  canvas.renderAll();
}

/**
 * Check if image is in edit mode
 */
export function isImageInEditMode(image: fabric.Image): boolean {
  return !!(image as any)._editMode;
}

/**
 * Apply content transform (pan and zoom) within frame
 * This modifies the image's internal positioning and scale
 */
export function applyContentTransform(
  image: fabric.Image,
  transform: Partial<ContentTransform>,
  canvas?: fabric.Canvas
) {
  const currentTransform = (image as any)._contentTransform || {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  };

  const newTransform = {
    ...currentTransform,
    ...transform,
  };

  // Apply minimum scale constraint
  // Content must always cover the frame (no gaps)
  const frameConfig = (image as any)._frameConfig as FrameConfig;
  if (frameConfig) {
    const minScale = calculateMinimumScale(image, frameConfig);
    newTransform.scale = Math.max(newTransform.scale, minScale);
  }

  // Store the transform
  (image as any)._contentTransform = newTransform;

  // Apply the transform using Fabric.js properties
  // Note: This is a simplified version. For production, you might need
  // to use a Group with the image inside, or custom rendering
  const element = (image as any)._element || (image as any)._originalElement;
  if (element) {
    // Apply CSS transform to the image element
    // This is a workaround for content manipulation within clipPath
    const scaleX = image.scaleX || 1;
    const scaleY = image.scaleY || 1;

    image.set({
      scaleX: scaleX * newTransform.scale,
      scaleY: scaleY * newTransform.scale,
    });
  }

  canvas?.renderAll();
}

/**
 * Calculate minimum scale to ensure content covers frame
 */
export function calculateMinimumScale(
  image: fabric.Image,
  frameConfig: FrameConfig
): number {
  const imgWidth = image.width || 1;
  const imgHeight = image.height || 1;

  const scaleX = frameConfig.width / imgWidth;
  const scaleY = frameConfig.height / imgHeight;

  // Return the larger scale to ensure full coverage
  return Math.max(scaleX, scaleY);
}

/**
 * Setup double-click handler for entering edit mode
 */
export function setupDoubleClickHandler(
  image: fabric.Image,
  canvas: fabric.Canvas,
  onEnterEditMode?: () => void
) {
  let clickCount = 0;
  let clickTimer: NodeJS.Timeout | null = null;

  const handleClick = () => {
    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 300); // 300ms window for double-click
    } else if (clickCount === 2) {
      // Double-click detected
      if (clickTimer) clearTimeout(clickTimer);
      clickCount = 0;

      enterImageEditMode(image, canvas);
      onEnterEditMode?.();
    }
  };

  image.on("mousedown", handleClick);

  // Store the handler for cleanup
  (image as any)._doubleClickHandler = handleClick;
}

/**
 * Remove double-click handler
 */
export function removeDoubleClickHandler(image: fabric.Image) {
  const handler = (image as any)._doubleClickHandler;
  if (handler) {
    image.off("mousedown", handler);
    delete (image as any)._doubleClickHandler;
  }
}

/**
 * Setup content panning within frame
 */
export function setupContentPanning(
  image: fabric.Image,
  canvas: fabric.Canvas
) {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  const handleMouseDown = (e: fabric.TPointerEventInfo) => {
    if (!isImageInEditMode(image)) return;

    isDragging = true;
    const pointer = canvas.getPointer(e.e);
    lastX = pointer.x;
    lastY = pointer.y;
  };

  const handleMouseMove = (e: fabric.TPointerEventInfo) => {
    if (!isDragging || !isImageInEditMode(image)) return;

    const pointer = canvas.getPointer(e.e);
    const deltaX = pointer.x - lastX;
    const deltaY = pointer.y - lastY;

    // Update content position
    const currentTransform = (image as any)._contentTransform || {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };

    applyContentTransform(
      image,
      {
        offsetX: currentTransform.offsetX + deltaX,
        offsetY: currentTransform.offsetY + deltaY,
      },
      canvas
    );

    lastX = pointer.x;
    lastY = pointer.y;
  };

  const handleMouseUp = () => {
    isDragging = false;
  };

  image.on("mousedown", handleMouseDown);
  canvas.on("mouse:move", handleMouseMove);
  canvas.on("mouse:up", handleMouseUp);

  // Store handlers for cleanup
  (image as any)._panHandlers = {
    mouseDown: handleMouseDown,
    mouseMove: handleMouseMove,
    mouseUp: handleMouseUp,
  };
}

/**
 * Remove content panning handlers
 */
export function removeContentPanning(
  image: fabric.Image,
  canvas: fabric.Canvas
) {
  const handlers = (image as any)._panHandlers;
  if (handlers) {
    image.off("mousedown", handlers.mouseDown);
    canvas.off("mouse:move", handlers.mouseMove);
    canvas.off("mouse:up", handlers.mouseUp);
    delete (image as any)._panHandlers;
  }
}

/**
 * Create overlay effect for content outside frame
 * This uses a semi-transparent rect as an overlay
 */
export function createFrameOverlay(
  image: fabric.Image,
  frameConfig: FrameConfig
): fabric.Rect {
  const overlay = new fabric.Rect({
    width: frameConfig.width,
    height: frameConfig.height,
    fill: "rgba(0, 0, 0, 0.3)",
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
    opacity: 0,
  });

  // Position overlay at same location as image
  overlay.set({
    left: image.left,
    top: image.top,
  });

  return overlay;
}

/**
 * Show overlay (during edit mode)
 */
export function showFrameOverlay(overlay: fabric.Rect, canvas: fabric.Canvas) {
  overlay.set({ opacity: 1 });
  canvas.renderAll();
}

/**
 * Hide overlay
 */
export function hideFrameOverlay(overlay: fabric.Rect, canvas: fabric.Canvas) {
  overlay.set({ opacity: 0 });
  canvas.renderAll();
}

/**
 * Configure image controls for frame mode (corner-only resize)
 */
export function enableFrameMode(image: fabric.Image) {
  image.setControlsVisibility({
    mt: false, // middle-top
    mb: false, // middle-bottom
    ml: false, // middle-left
    mr: false, // middle-right
    mtr: false, // rotation control (optional, can keep if needed)
  });

  // Lock aspect ratio
  image.set({
    lockScalingFlip: true,
    lockUniScaling: false,
  });
}

/**
 * Restore normal controls
 */
export function disableFrameMode(image: fabric.Image) {
  image.setControlsVisibility({
    mt: true,
    mb: true,
    ml: true,
    mr: true,
    mtr: true,
  });

  image.set({
    lockScalingFlip: false,
    lockUniScaling: false,
  });
}
