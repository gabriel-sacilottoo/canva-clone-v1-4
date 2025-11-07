/**
 * Aspect Ratio Utility Functions
 * Provides calculations and helpers for the aspect ratio system
 */

import type { AspectRatio, AspectRatioOption, FrameDimensions } from "@/types/image-frame";

/**
 * Available aspect ratios with their numeric values
 */
export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "2:3", label: "2:3", ratio: 2 / 3 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
];

/**
 * Default aspect ratio when inserting a new image
 */
export const DEFAULT_ASPECT_RATIO: AspectRatio = "4:3";

/**
 * Get the numeric ratio for an aspect ratio string
 */
export function getAspectRatioValue(aspectRatio: AspectRatio): number {
  const option = ASPECT_RATIO_OPTIONS.find((opt) => opt.value === aspectRatio);
  return option?.ratio ?? 4 / 3;
}

/**
 * Calculate frame dimensions based on aspect ratio and container size
 * Maintains aspect ratio while fitting within max dimensions
 */
export function calculateFrameDimensions(
  aspectRatio: AspectRatio,
  maxWidth: number,
  maxHeight: number
): FrameDimensions {
  const ratio = getAspectRatioValue(aspectRatio);

  let width = maxWidth;
  let height = width / ratio;

  // If height exceeds max, recalculate based on height
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  return { width, height };
}

/**
 * Calculate new dimensions when resizing with aspect ratio locked
 * Resizes from a specific corner while maintaining the aspect ratio
 */
export function calculateProportionalResize(
  currentDimensions: FrameDimensions,
  delta: { x: number; y: number },
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  aspectRatio: AspectRatio,
  minWidth = 100,
  minHeight = 100
): FrameDimensions {
  const ratio = getAspectRatioValue(aspectRatio);

  // Calculate new dimensions based on corner
  let newWidth = currentDimensions.width;
  let newHeight = currentDimensions.height;

  switch (corner) {
    case "top-left":
      newWidth = currentDimensions.width - delta.x;
      newHeight = currentDimensions.height - delta.y;
      break;
    case "top-right":
      newWidth = currentDimensions.width + delta.x;
      newHeight = currentDimensions.height - delta.y;
      break;
    case "bottom-left":
      newWidth = currentDimensions.width - delta.x;
      newHeight = currentDimensions.height + delta.y;
      break;
    case "bottom-right":
      newWidth = currentDimensions.width + delta.x;
      newHeight = currentDimensions.height + delta.y;
      break;
  }

  // Use the larger delta to maintain aspect ratio
  const widthBasedHeight = newWidth / ratio;
  const heightBasedWidth = newHeight * ratio;

  // Choose the dimension that results in a larger resize
  if (Math.abs(newWidth - currentDimensions.width) > Math.abs(newHeight - currentDimensions.height)) {
    newHeight = widthBasedHeight;
  } else {
    newWidth = heightBasedWidth;
  }

  // Apply minimum constraints
  newWidth = Math.max(newWidth, minWidth);
  newHeight = Math.max(newHeight, minHeight);

  // Recalculate to maintain exact aspect ratio after min constraints
  if (newWidth === minWidth) {
    newHeight = minWidth / ratio;
  } else if (newHeight === minHeight) {
    newWidth = minHeight * ratio;
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Calculate the position adjustment when resizing from different corners
 * Ensures the frame resizes from the correct anchor point
 */
export function calculatePositionAdjustment(
  originalDimensions: FrameDimensions,
  newDimensions: FrameDimensions,
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right"
): { x: number; y: number } {
  const widthDiff = newDimensions.width - originalDimensions.width;
  const heightDiff = newDimensions.height - originalDimensions.height;

  switch (corner) {
    case "top-left":
      return { x: -widthDiff, y: -heightDiff };
    case "top-right":
      return { x: 0, y: -heightDiff };
    case "bottom-left":
      return { x: -widthDiff, y: 0 };
    case "bottom-right":
      return { x: 0, y: 0 };
  }
}

/**
 * Calculate content scale to fit within frame
 * Ensures content fills the entire frame (no gaps)
 */
export function calculateContentScale(
  contentDimensions: FrameDimensions,
  frameDimensions: FrameDimensions
): number {
  const scaleX = frameDimensions.width / contentDimensions.width;
  const scaleY = frameDimensions.height / contentDimensions.height;

  // Use the larger scale to ensure content covers the entire frame
  return Math.max(scaleX, scaleY);
}

/**
 * Calculate centered content offset within frame
 */
export function calculateCenteredOffset(
  contentDimensions: FrameDimensions,
  frameDimensions: FrameDimensions,
  scale: number
): { x: number; y: number } {
  const scaledWidth = contentDimensions.width * scale;
  const scaledHeight = contentDimensions.height * scale;

  return {
    x: (frameDimensions.width - scaledWidth) / 2,
    y: (frameDimensions.height - scaledHeight) / 2,
  };
}
