import * as fabric from "fabric";

export interface ImageFrameOptions {
  frameWidth?: number;
  frameHeight?: number;
  aspectRatio?: number;
  showOverlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
}

/**
 * Custom Fabric.js class for Image Frame with content manipulation
 * Extends fabric.Image to add frame and overlay capabilities
 */
export class ImageFrame extends fabric.Image {
  frameWidth: number;
  frameHeight: number;
  aspectRatio: number;
  showOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  isEditMode: boolean;
  contentOffsetX: number;
  contentOffsetY: number;
  contentScale: number;

  constructor(element: fabric.ImageSource, options?: ImageFrameOptions) {
    super(element, options as any);

    this.frameWidth = options?.frameWidth || this.width || 200;
    this.frameHeight = options?.frameHeight || this.height || 200;
    this.aspectRatio = options?.aspectRatio || 4 / 3;
    this.showOverlay = options?.showOverlay || false;
    this.overlayColor = options?.overlayColor || "rgba(0, 0, 0, 0.3)";
    this.overlayOpacity = options?.overlayOpacity || 0.3;

    this.isEditMode = false;
    this.contentOffsetX = 0;
    this.contentOffsetY = 0;
    this.contentScale = 1;

    // Setup frame clipPath
    this.setupFrameClipPath();

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup clipPath for frame masking
   */
  setupFrameClipPath() {
    const clipPath = new fabric.Rect({
      width: this.frameWidth,
      height: this.frameHeight,
      originX: "center",
      originY: "center",
      absolutePositioned: false,
    });

    this.set({ clipPath });
  }

  /**
   * Setup event handlers for double-click and edit mode
   */
  setupEventHandlers() {
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout | null = null;

    this.on("mousedown", () => {
      clickCount++;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        // Double-click detected
        if (clickTimer) clearTimeout(clickTimer);
        clickCount = 0;
        this.enterEditMode();
      }
    });
  }

  /**
   * Enter edit mode - enables content manipulation
   */
  enterEditMode() {
    this.isEditMode = true;
    this.showOverlay = true;

    // Change border color to indicate edit mode
    this.set({
      borderColor: "#3b82f6", // Blue
      borderScaleFactor: 2,
    });

    this.canvas?.requestRenderAll();
  }

  /**
   * Exit edit mode
   */
  exitEditMode() {
    this.isEditMode = false;
    this.showOverlay = false;

    this.set({
      borderColor: "#0066ff",
      borderScaleFactor: 1,
    });

    this.canvas?.requestRenderAll();
  }

  /**
   * Update frame dimensions based on aspect ratio
   */
  updateFrame(aspectRatio: number) {
    this.aspectRatio = aspectRatio;

    const imgWidth = this.width || 200;
    const imgHeight = this.height || 200;
    const currentRatio = imgWidth / imgHeight;

    if (currentRatio > aspectRatio) {
      this.frameWidth = imgHeight * aspectRatio;
      this.frameHeight = imgHeight;
    } else {
      this.frameWidth = imgWidth;
      this.frameHeight = imgWidth / aspectRatio;
    }

    this.setupFrameClipPath();
    this.canvas?.requestRenderAll();
  }

  /**
   * Update content transform (pan and zoom)
   */
  updateContentTransform(offsetX?: number, offsetY?: number, scale?: number) {
    if (offsetX !== undefined) this.contentOffsetX = offsetX;
    if (offsetY !== undefined) this.contentOffsetY = offsetY;
    if (scale !== undefined) {
      // Calculate minimum scale to ensure coverage
      const minScale = this.calculateMinimumScale();
      this.contentScale = Math.max(scale, minScale);
    }

    this.canvas?.requestRenderAll();
  }

  /**
   * Calculate minimum scale to ensure content covers frame
   */
  calculateMinimumScale(): number {
    const imgWidth = this.width || 1;
    const imgHeight = this.height || 1;

    const scaleX = this.frameWidth / imgWidth;
    const scaleY = this.frameHeight / imgHeight;

    return Math.max(scaleX, scaleY);
  }

  /**
   * Override render method to add overlay effect
   */
  override render(ctx: CanvasRenderingContext2D) {
    // Render the image normally
    super.render(ctx);

    // If in edit mode, render the overlay
    if (this.showOverlay && this.isEditMode) {
      this.renderOverlay(ctx);
    }
  }

  /**
   * Render translucent overlay for content outside frame
   */
  renderOverlay(ctx: CanvasRenderingContext2D) {
    if (!this.width || !this.height) return;

    ctx.save();

    // Calculate the frame bounds in canvas coordinates
    const frameLeft = -this.frameWidth / 2;
    const frameTop = -this.frameHeight / 2;

    // Create a clipping path for the frame area
    ctx.beginPath();
    ctx.rect(frameLeft, frameTop, this.frameWidth, this.frameHeight);

    // Invert the clip - everything outside the frame
    ctx.globalCompositeOperation = "source-over";

    // Draw semi-transparent overlay over the entire image
    ctx.fillStyle = this.overlayColor;
    ctx.fillRect(
      -this.width! / 2,
      -this.height! / 2,
      this.width!,
      this.height!
    );

    // Clear the frame area to show content at full opacity
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(frameLeft, frameTop, this.frameWidth, this.frameHeight);

    ctx.restore();
  }

  /**
   * Reset content transform to default
   */
  resetContentTransform() {
    this.contentOffsetX = 0;
    this.contentOffsetY = 0;
    this.contentScale = 1;
    this.canvas?.requestRenderAll();
  }

  /**
   * Get frame configuration
   */
  getFrameConfig() {
    return {
      width: this.frameWidth,
      height: this.frameHeight,
      aspectRatio: this.aspectRatio,
    };
  }

  /**
   * Get content transform state
   */
  getContentTransform() {
    return {
      offsetX: this.contentOffsetX,
      offsetY: this.contentOffsetY,
      scale: this.contentScale,
    };
  }

  /**
   * Convert to regular fabric.Image
   */
  toRegularImage(): fabric.Image {
    const img = new fabric.Image(this.getElement(), {
      left: this.left,
      top: this.top,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      angle: this.angle,
      opacity: this.opacity,
      clipPath: this.clipPath,
    });

    return img;
  }

  /**
   * Serialize to JSON with frame data
   */
  override toObject(propertiesToInclude?: any) {
    return {
      ...(super.toObject(propertiesToInclude as any) as any),
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
      aspectRatio: this.aspectRatio,
      contentOffsetX: this.contentOffsetX,
      contentOffsetY: this.contentOffsetY,
      contentScale: this.contentScale,
    };
  }

  /**
   * Create ImageFrame from object
   */
  static async fromObject(object: any): Promise<ImageFrame> {
    const img = await fabric.Image.fromObject(object);
    const imageFrame = new ImageFrame(img.getElement() as fabric.ImageSource, {
      left: object.left,
      top: object.top,
      scaleX: object.scaleX,
      scaleY: object.scaleY,
      angle: object.angle,
      opacity: object.opacity,
      frameWidth: object.frameWidth,
      frameHeight: object.frameHeight,
      aspectRatio: object.aspectRatio,
    });

    imageFrame.contentOffsetX = object.contentOffsetX || 0;
    imageFrame.contentOffsetY = object.contentOffsetY || 0;
    imageFrame.contentScale = object.contentScale || 1;

    return imageFrame;
  }
}

/**
 * Register custom class with Fabric.js
 */
export function registerImageFrame() {
  // @ts-ignore
  fabric.ImageFrame = ImageFrame;
}

/**
 * Helper function to convert existing image to ImageFrame
 */
export function convertToImageFrame(
  image: fabric.Image,
  aspectRatio: number = 4 / 3
): ImageFrame | null {
  const element = image.getElement();
  if (!element) return null;

  const imgWidth = image.width || 200;
  const imgHeight = image.height || 200;
  const currentRatio = imgWidth / imgHeight;

  let frameWidth = imgWidth;
  let frameHeight = imgHeight;

  if (currentRatio > aspectRatio) {
    frameWidth = imgHeight * aspectRatio;
  } else {
    frameHeight = imgWidth / aspectRatio;
  }

  const imageFrame = new ImageFrame(element as fabric.ImageSource, {
    left: image.left,
    top: image.top,
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    angle: image.angle,
    opacity: image.opacity,
    frameWidth,
    frameHeight,
    aspectRatio,
  });

  return imageFrame;
}

/**
 * Helper to setup content panning for ImageFrame
 */
export function setupImageFramePanning(
  imageFrame: ImageFrame,
  canvas: fabric.Canvas
) {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;

  const handleMouseDown = (e: fabric.TPointerEventInfo) => {
    if (!imageFrame.isEditMode) return;

    isDragging = true;
    const pointer = canvas.getPointer(e.e);
    lastX = pointer.x;
    lastY = pointer.y;
    startOffsetX = imageFrame.contentOffsetX;
    startOffsetY = imageFrame.contentOffsetY;

    // Disable object movement during content drag
    imageFrame.set({ lockMovementX: true, lockMovementY: true });
  };

  const handleMouseMove = (e: fabric.TPointerEventInfo) => {
    if (!isDragging || !imageFrame.isEditMode) return;

    const pointer = canvas.getPointer(e.e);
    const deltaX = pointer.x - lastX;
    const deltaY = pointer.y - lastY;

    imageFrame.updateContentTransform(
      startOffsetX + deltaX,
      startOffsetY + deltaY
    );
  };

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      imageFrame.set({ lockMovementX: false, lockMovementY: false });
    }
  };

  imageFrame.on("mousedown", handleMouseDown);
  canvas.on("mouse:move", handleMouseMove);
  canvas.on("mouse:up", handleMouseUp);

  // Store handlers for cleanup
  (imageFrame as any)._panHandlers = {
    mouseDown: handleMouseDown,
    mouseMove: handleMouseMove,
    mouseUp: handleMouseUp,
  };
}

/**
 * Cleanup panning handlers
 */
export function removeImageFramePanning(
  imageFrame: ImageFrame,
  canvas: fabric.Canvas
) {
  const handlers = (imageFrame as any)._panHandlers;
  if (handlers) {
    imageFrame.off("mousedown", handlers.mouseDown);
    canvas.off("mouse:move", handlers.mouseMove);
    canvas.off("mouse:up", handlers.mouseUp);
    delete (imageFrame as any)._panHandlers;
  }
}
