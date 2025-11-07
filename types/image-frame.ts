/**
 * Image Frame & Aspect Ratio Types
 * Defines the core types for the image frame crop system
 */

export type AspectRatio = "1:1" | "4:3" | "16:9" | "3:2" | "2:3" | "9:16";

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  ratio: number;
}

export interface FrameDimensions {
  width: number;
  height: number;
}

export interface FramePosition {
  x: number;
  y: number;
}

export interface ImageFrameConfig {
  /** Frame dimensions */
  frame: FrameDimensions;
  /** Frame position on canvas */
  position: FramePosition;
  /** Current aspect ratio */
  aspectRatio: AspectRatio;
  /** Content (image) dimensions */
  content: FrameDimensions;
  /** Content position relative to frame */
  contentOffset: FramePosition;
  /** Content scale */
  contentScale: number;
}

export interface ResizeHandle {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  cursor: string;
}

export type ResizeMode = "corner" | "none";

export interface ImageFrameState {
  /** Current frame configuration */
  config: ImageFrameConfig;
  /** Is user currently resizing? */
  isResizing: boolean;
  /** Active resize handle */
  activeHandle: ResizeHandle["position"] | null;
  /** Is in edit mode (pan/zoom content)? */
  isEditMode: boolean;
}
