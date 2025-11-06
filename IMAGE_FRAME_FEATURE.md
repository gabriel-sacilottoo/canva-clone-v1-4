# Image Frame & Content Manipulation (Crop Tool)

## Overview

The Image Frame & Content Manipulation feature provides a professional image cropping system inspired by Figma's frame-based workflow. Users can manipulate both the **frame** (viewport/container) and the **content** (image) independently, offering precise control over image composition.

## Key Features

### 1. **Frame-Based Cropping**
- Frame acts as a viewport/mask with adjustable aspect ratios
- Content can be repositioned and scaled independently within the frame
- Frame handles are restricted to corners only for proportional resizing
- Seven preset aspect ratios: 4:3, 16:9, 1:1, 9:16, 3:2, 2:3, 21:9

### 2. **Content Edit Mode**
- **Double-click** on an image to enter Content Edit Mode
- Drag to reposition the image inside the frame
- Use corner handles to zoom in/out
- Visual feedback with blue border highlighting
- Press **ESC** or click outside to exit edit mode

### 3. **Minimum Coverage Constraint**
- Content automatically maintains minimum scale to fully cover the frame
- Prevents gaps or white space within the frame
- Ensures professional-looking crops

### 4. **Visual Feedback**
- Edit mode indicated by blue border
- Crop mode indicated by amber border
- Clear instructions displayed in the UI
- Cursor changes to "move" during content manipulation

## User Workflow

### Basic Cropping

1. **Select an Image** on the canvas
2. **Click the Crop icon** in the tools toolbar (appears when image is selected)
3. **Choose an aspect ratio** from the dropdown menu
4. **Resize the frame** using corner handles to adjust composition
5. **Click "Exit Crop Mode"** when done

### Advanced Content Manipulation

1. **Enter Crop Mode** first (apply an aspect ratio)
2. **Double-click** the image to enter Content Edit Mode
3. **Drag** the image to reposition it within the frame
4. **Scale** using corner handles if needed (zooming)
5. **Press ESC** or click outside to exit edit mode
6. **Exit Crop Mode** to finalize the crop

### Resetting Crop

- Click the **"Reset Crop"** button to:
  - Remove the aspect ratio constraint
  - Clear the frame clipPath
  - Restore all resize handles
  - Reset content positioning

## Technical Implementation

### Architecture

The feature is built on three main components:

1. **`useImageFrame` Hook** (`hooks/use-image-frame.ts`)
   - State management for frame and content transforms
   - Handles aspect ratio calculations
   - Provides actions for edit mode, dragging, and scaling

2. **`ImageCrop` Component** (`components/design/tools/ImageCrop.tsx`)
   - UI for aspect ratio selection
   - Crop mode toggle
   - Visual feedback and instructions
   - Integrates with Fabric.js canvas

3. **Image Frame Utilities** (`lib/image-frame-utils.ts`)
   - Fabric.js integration functions
   - Frame creation and manipulation
   - Double-click detection
   - Content panning handlers
   - Minimum scale calculations

4. **`ImageFrame` Class** (`lib/ImageFrameClass.ts`)
   - Custom Fabric.js class extending `fabric.Image`
   - Advanced rendering with overlay effects
   - Built-in content transform management
   - Serialization support for saving/loading

### Fabric.js Integration

The feature leverages Fabric.js's powerful canvas API:

- **clipPath**: Used for frame masking
- **Custom Controls**: Corner-only handles for frame resizing
- **Event Handlers**: Double-click, mouse move, keyboard events
- **Transform Properties**: Position, scale, rotation

### State Persistence

All frame and content data is stored on the Fabric.js object:

```javascript
{
  _frameConfig: {
    width: number,
    height: number,
    aspectRatio: number
  },
  _contentTransform: {
    offsetX: number,
    offsetY: number,
    scale: number
  }
}
```

This data persists through:
- Canvas JSON export
- Undo/redo operations
- Design autosave to Convex backend

## File Structure

```
hooks/
  └── use-image-frame.ts          # State management hook

components/design/tools/
  ├── ImageCrop.tsx                # Main crop UI component
  ├── ImageRadius.tsx              # Corner radius tool
  └── ImageFilters.tsx             # Filter effects tool

lib/
  ├── image-frame-utils.ts         # Fabric.js utility functions
  └── ImageFrameClass.ts           # Custom ImageFrame class

components/design/tools/
  └── index.tsx                    # Tools toolbar integration
```

## API Reference

### useImageFrame Hook

```typescript
const {
  isEditMode,           // boolean
  frameAspectRatio,     // AspectRatio
  contentTransform,     // { x, y, scale }
  isDragging,           // boolean
  isScaling,            // boolean
  enterEditMode,        // () => void
  exitEditMode,         // () => void
  startDrag,            // (x, y) => void
  updateDrag,           // (x, y) => void
  endDrag,              // () => void
  updateScale,          // (scale, minScale?) => void
  changeAspectRatio,    // (ratio) => void
  resetTransform,       // () => void
  aspectRatioValue,     // number
} = useImageFrame("4:3");
```

### Utility Functions

#### Frame Management
- `createFrameFromImage(image, aspectRatio)` - Calculate frame dimensions
- `applyFrameToImage(image, frameConfig, canvas)` - Apply clipPath
- `enableFrameMode(image)` - Restrict to corner handles
- `disableFrameMode(image)` - Restore all handles

#### Edit Mode
- `enterImageEditMode(image, canvas)` - Activate edit mode
- `exitImageEditMode(image, canvas)` - Deactivate edit mode
- `isImageInEditMode(image)` - Check edit mode status

#### Content Manipulation
- `setupDoubleClickHandler(image, canvas, callback)` - Double-click detection
- `setupContentPanning(image, canvas)` - Enable panning
- `removeContentPanning(image, canvas)` - Cleanup handlers
- `applyContentTransform(image, transform, canvas)` - Apply pan/zoom
- `calculateMinimumScale(image, frameConfig)` - Compute coverage scale

#### ImageFrame Class
- `new ImageFrame(element, options)` - Create frame instance
- `imageFrame.updateFrame(aspectRatio)` - Change aspect ratio
- `imageFrame.updateContentTransform(x, y, scale)` - Update content
- `imageFrame.enterEditMode()` - Enter edit mode
- `imageFrame.exitEditMode()` - Exit edit mode
- `imageFrame.resetContentTransform()` - Reset to defaults

## Usage Example

```typescript
import { useCanvas } from "@/store/useCanvas";
import { createFrameFromImage, applyFrameToImage } from "@/lib/image-frame-utils";

function MyComponent() {
  const { canvas } = useCanvas();
  const activeObj = canvas?.getActiveObject();

  const applyCrop = () => {
    if (activeObj?.type === "image") {
      const image = activeObj as fabric.Image;

      // Create 16:9 frame
      const frameConfig = createFrameFromImage(image, 16/9);
      applyFrameToImage(image, frameConfig, canvas);

      console.log("Crop applied!");
    }
  };

  return <button onClick={applyCrop}>Apply 16:9 Crop</button>;
}
```

## Keyboard Shortcuts

- **ESC** - Exit Content Edit Mode
- **Double-click** - Enter Content Edit Mode
- **Space + Drag** - Alternative pan method (optional, not yet implemented)

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Known Limitations

1. **Translucent Overlay**: The overlay effect in the basic implementation is simplified. The `ImageFrame` custom class provides full overlay rendering.

2. **Touch Devices**: Double-click detection works on desktop. For mobile, long-press (500ms) should be implemented as an alternative.

3. **Performance**: Large images (4K+) may experience slight lag during panning. Consider image compression for production use.

4. **Undo/Redo**: Content transforms are tracked but may require additional integration with the canvas history system.

## Future Enhancements

- [ ] Long-press support for mobile devices
- [ ] Freeform crop mode (non-aspect-ratio-locked)
- [ ] Custom aspect ratio input
- [ ] Crop presets (Instagram, Twitter, Facebook sizes)
- [ ] Rotation within frame
- [ ] Multiple frames per image
- [ ] Smart crop suggestions (face detection)

## Development Notes

### Testing Checklist
- [x] Frame resizes proportionally with aspect ratio lock
- [x] Double-click activates edit mode reliably
- [x] Content pans smoothly without frame moving
- [x] Minimum scale constraint prevents gaps
- [x] ESC key exits edit mode
- [x] Aspect ratio changes work correctly
- [x] Reset button clears all crop data
- [x] TypeScript types are correct
- [x] No console errors during operation

### Performance Optimizations
- Uses CSS transforms for smooth animations
- RequestAnimationFrame for drag updates
- Debounced canvas rendering
- Efficient event handler cleanup

## Credits

Developed for Canva Clone V1.4 by implementing Figma-style frame-based image manipulation.

## Support

For issues or questions, please refer to:
- Main project README
- Fabric.js documentation: http://fabricjs.com/docs/
- React documentation: https://react.dev/

---

**Last Updated**: November 2025
**Version**: 1.0.0
