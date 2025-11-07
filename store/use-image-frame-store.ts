/**
 * Image Frame Zustand Store
 * Manages global state for image frame crop functionality
 */

import { create } from "zustand";
import type {
  AspectRatio,
  ImageFrameConfig,
  ImageFrameState,
  ResizeHandle,
  FrameDimensions,
} from "@/types/image-frame";
import {
  DEFAULT_ASPECT_RATIO,
  calculateFrameDimensions,
  calculateContentScale,
  calculateCenteredOffset,
  calculateProportionalResize,
  calculatePositionAdjustment,
} from "@/lib/aspect-ratio-utils";

interface ImageFrameStore extends ImageFrameState {
  // Actions
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  startResize: (handle: ResizeHandle["position"]) => void;
  updateResize: (delta: { x: number; y: number }) => void;
  endResize: () => void;
  toggleEditMode: () => void;
  updateContentPosition: (offset: { x: number; y: number }) => void;
  updateContentScale: (scale: number) => void;
  initializeFrame: (imageDimensions: FrameDimensions, containerSize: FrameDimensions) => void;
  resetFrame: () => void;
}

const DEFAULT_CONFIG: ImageFrameConfig = {
  frame: { width: 400, height: 300 },
  position: { x: 0, y: 0 },
  aspectRatio: DEFAULT_ASPECT_RATIO,
  content: { width: 800, height: 600 },
  contentOffset: { x: 0, y: 0 },
  contentScale: 1,
};

export const useImageFrameStore = create<ImageFrameStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  isResizing: false,
  activeHandle: null,
  isEditMode: false,

  /**
   * Change the aspect ratio and recalculate frame dimensions
   */
  setAspectRatio: (aspectRatio: AspectRatio) => {
    const { config } = get();
    const currentCenter = {
      x: config.position.x + config.frame.width / 2,
      y: config.position.y + config.frame.height / 2,
    };

    // Calculate new frame dimensions maintaining current width
    const newDimensions = calculateFrameDimensions(
      aspectRatio,
      config.frame.width,
      config.frame.width * 2 // Allow height to adjust
    );

    // Recalculate content scale and offset
    const newScale = calculateContentScale(config.content, newDimensions);
    const newOffset = calculateCenteredOffset(config.content, newDimensions, newScale);

    // Maintain center position
    const newPosition = {
      x: currentCenter.x - newDimensions.width / 2,
      y: currentCenter.y - newDimensions.height / 2,
    };

    set({
      config: {
        ...config,
        aspectRatio,
        frame: newDimensions,
        position: newPosition,
        contentScale: newScale,
        contentOffset: newOffset,
      },
    });
  },

  /**
   * Start resizing from a corner handle
   */
  startResize: (handle: ResizeHandle["position"]) => {
    set({ isResizing: true, activeHandle: handle });
  },

  /**
   * Update frame dimensions during resize
   */
  updateResize: (delta: { x: number; y: number }) => {
    const { config, activeHandle } = get();
    if (!activeHandle) return;

    const originalDimensions = { ...config.frame };

    // Calculate new dimensions with aspect ratio locked
    const newDimensions = calculateProportionalResize(
      config.frame,
      delta,
      activeHandle,
      config.aspectRatio
    );

    // Calculate position adjustment to resize from correct corner
    const positionAdjustment = calculatePositionAdjustment(
      originalDimensions,
      newDimensions,
      activeHandle
    );

    // Recalculate content scale and offset
    const newScale = calculateContentScale(config.content, newDimensions);
    const newOffset = calculateCenteredOffset(config.content, newDimensions, newScale);

    set({
      config: {
        ...config,
        frame: newDimensions,
        position: {
          x: config.position.x + positionAdjustment.x,
          y: config.position.y + positionAdjustment.y,
        },
        contentScale: newScale,
        contentOffset: newOffset,
      },
    });
  },

  /**
   * End resize operation
   */
  endResize: () => {
    set({ isResizing: false, activeHandle: null });
  },

  /**
   * Toggle edit mode for content manipulation
   */
  toggleEditMode: () => {
    set((state) => ({ isEditMode: !state.isEditMode }));
  },

  /**
   * Update content position (pan)
   */
  updateContentPosition: (offset: { x: number; y: number }) => {
    const { config } = get();
    set({
      config: {
        ...config,
        contentOffset: offset,
      },
    });
  },

  /**
   * Update content scale (zoom)
   */
  updateContentScale: (scale: number) => {
    const { config } = get();
    // Ensure minimum scale to prevent gaps
    const minScale = calculateContentScale(config.content, config.frame);
    const newScale = Math.max(scale, minScale);

    set({
      config: {
        ...config,
        contentScale: newScale,
      },
    });
  },

  /**
   * Initialize frame with image and container dimensions
   */
  initializeFrame: (imageDimensions: FrameDimensions, containerSize: FrameDimensions) => {
    // Calculate initial frame dimensions with default aspect ratio
    const frameDimensions = calculateFrameDimensions(
      DEFAULT_ASPECT_RATIO,
      Math.min(containerSize.width * 0.8, imageDimensions.width),
      Math.min(containerSize.height * 0.8, imageDimensions.height)
    );

    // Center frame in container
    const position = {
      x: (containerSize.width - frameDimensions.width) / 2,
      y: (containerSize.height - frameDimensions.height) / 2,
    };

    // Calculate content scale and offset
    const contentScale = calculateContentScale(imageDimensions, frameDimensions);
    const contentOffset = calculateCenteredOffset(imageDimensions, frameDimensions, contentScale);

    set({
      config: {
        frame: frameDimensions,
        position,
        aspectRatio: DEFAULT_ASPECT_RATIO,
        content: imageDimensions,
        contentOffset,
        contentScale,
      },
      isResizing: false,
      activeHandle: null,
      isEditMode: false,
    });
  },

  /**
   * Reset frame to default state
   */
  resetFrame: () => {
    set({
      config: DEFAULT_CONFIG,
      isResizing: false,
      activeHandle: null,
      isEditMode: false,
    });
  },
}));
