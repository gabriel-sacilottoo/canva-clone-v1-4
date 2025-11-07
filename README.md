# Image Frame & Crop System

## Task 1: Setup Image Frame Structure & Aspect Ratio System ✓

This implementation provides a complete image frame and crop system with aspect ratio controls, matching the requirements for a Canva-like image editing experience.

## Features Implemented

### ✅ Core Structure
- **Frame-Content Parent-Child Architecture**: Frame acts as a mask (crop boundary), Content is the image inside
- **Overflow Hidden**: Frame uses `overflow: hidden` to hide content that exceeds the frame boundaries
- **Visual Border**: Frame has a visible outline/border to delimit the crop area

### ✅ Resize System
- **Corner-Only Handles**: 4 resize handles on corners only (no side handles)
- **Aspect Ratio Locking**: All resizing maintains the selected aspect ratio rigidly
- **Transform Center Maintenance**: Resizing from any corner maintains the appropriate anchor point

### ✅ Aspect Ratio System
- **6 Aspect Ratios**: 1:1, 4:3, 16:9, 3:2, 2:3, 9:16
- **Default Ratio**: 4:3 (applied when initializing new images)
- **No "None" Option**: All aspect ratios are locked (no free-form resizing)
- **Radix UI Dropdown**: Professional dropdown menu for aspect ratio selection

### ✅ Content Manipulation
- **Edit Mode**: Double-click frame to enter edit mode for content repositioning
- **Pan Support**: Drag to reposition image content within the frame
- **Scale Constraints**: Content always fills the entire frame (no gaps)
- **Visual Feedback**: Different border colors for frame mode (blue) vs edit mode (green)

## Technical Stack

- **Framework**: Next.js 15.2.2 with TypeScript
- **State Management**: Zustand 5.0.3 (lightweight, performant store)
- **UI Components**: Radix UI (@radix-ui/react-dropdown-menu)
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React

## Project Structure

```
canva-clone-v1-4/
├── app/
│   ├── page.tsx                    # Demo page with ImageFrame component
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   └── image-frame/
│       ├── image-frame.tsx         # Main ImageFrame component
│       ├── aspect-ratio-selector.tsx # Aspect ratio dropdown
│       ├── resize-handles.tsx      # Corner resize handles
│       └── index.ts                # Component exports
├── store/
│   └── use-image-frame-store.ts   # Zustand store for frame state
├── lib/
│   └── aspect-ratio-utils.ts      # Aspect ratio calculations
├── types/
│   └── image-frame.ts             # TypeScript type definitions
└── package.json
```

## Key Components

### 1. ImageFrame Component (`components/image-frame/image-frame.tsx`)
The main component implementing the Frame-Content structure:
- Manages frame positioning and dimensions
- Handles resize operations via corner handles
- Supports edit mode for content repositioning
- Displays visual feedback and info overlay

### 2. Zustand Store (`store/use-image-frame-store.ts`)
Global state management with actions:
- `setAspectRatio()` - Change aspect ratio and recalculate dimensions
- `startResize()`, `updateResize()`, `endResize()` - Handle resize operations
- `toggleEditMode()` - Switch between frame and edit modes
- `updateContentPosition()` - Pan content within frame
- `initializeFrame()` - Initialize with image dimensions

### 3. Aspect Ratio Utilities (`lib/aspect-ratio-utils.ts`)
Mathematical calculations for:
- Aspect ratio value conversions
- Proportional resize calculations
- Content scaling and centering
- Position adjustments during resize

### 4. AspectRatioSelector (`components/image-frame/aspect-ratio-selector.tsx`)
Radix UI dropdown menu featuring:
- All 6 aspect ratio options
- Visual checkmark for selected ratio
- Landscape/Portrait/Square labels
- Professional styling with Tailwind

## Usage

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Using the ImageFrame Component

```tsx
import { ImageFrame, AspectRatioSelector } from "@/components/image-frame";
import { useImageFrameStore } from "@/store/use-image-frame-store";

export default function MyPage() {
  const { config, setAspectRatio } = useImageFrameStore();

  return (
    <div>
      <AspectRatioSelector
        value={config.aspectRatio}
        onChange={setAspectRatio}
      />

      <ImageFrame
        src="path/to/image.jpg"
        alt="My image"
        onLoad={(dimensions) => console.log(dimensions)}
      />
    </div>
  );
}
```

## User Interactions

### Frame Mode (Default)
1. **Resize Frame**: Drag any of the 4 corner handles
   - Frame resizes proportionally based on selected aspect ratio
   - Transform maintains appropriate anchor point

2. **Change Aspect Ratio**: Click dropdown to select ratio
   - Frame dimensions recalculate instantly
   - Content rescales to fill new frame dimensions

3. **Enter Edit Mode**: Double-click the frame
   - Border changes from blue to green
   - Resize handles disappear
   - Cursor changes to move

### Edit Mode
1. **Pan Content**: Click and drag inside the frame
   - Image repositions within the frame boundaries
   - Content constrained to prevent gaps

2. **Exit Edit Mode**: Double-click again
   - Returns to frame mode
   - Resize handles reappear

## Algorithm Highlights

### Proportional Resize with Aspect Ratio Lock
```typescript
// Calculates new dimensions based on:
// 1. Mouse delta (movement)
// 2. Active corner handle
// 3. Locked aspect ratio
// 4. Minimum constraints
const newDimensions = calculateProportionalResize(
  currentDimensions,
  delta,
  corner,
  aspectRatio
);
```

### Content Scale Constraint
```typescript
// Ensures content fills entire frame (no gaps)
const scaleX = frameWidth / contentWidth;
const scaleY = frameHeight / contentHeight;
const scale = Math.max(scaleX, scaleY); // Use larger scale
```

### Position Adjustment During Resize
```typescript
// Maintains correct anchor point when resizing from different corners
// e.g., resizing from top-left moves frame position,
// but resizing from bottom-right keeps top-left fixed
const adjustment = calculatePositionAdjustment(
  originalDimensions,
  newDimensions,
  corner
);
```

## Design Decisions

### Why Zustand?
- Zero boilerplate compared to Redux
- No provider wrapping needed
- Excellent TypeScript support
- Minimal bundle size (~1KB)
- Perfect for this feature's state needs

### Why Corner-Only Handles?
- Matches requirement specification
- Maintains aspect ratio more intuitively
- Cleaner visual appearance
- Common pattern in professional design tools

### Why Separate Frame and Edit Modes?
- Clear mental model for users
- Prevents accidental content repositioning during frame resize
- Visual feedback (border color) reinforces current mode
- Double-click interaction is discoverable and common

## Testing Checklist

- [x] Frame structure with overflow hidden
- [x] 4 corner handles visible in frame mode
- [x] No side handles present
- [x] Resize from each corner maintains aspect ratio
- [x] All 6 aspect ratios selectable via dropdown
- [x] Default aspect ratio is 4:3
- [x] No "none" option in dropdown
- [x] Frame border visible
- [x] Double-click enters edit mode
- [x] Content draggable in edit mode
- [x] Content fills entire frame (no gaps)
- [x] Double-click exits edit mode
- [x] Resize handles hidden in edit mode
- [x] Info overlay shows current state

## Future Enhancements (Not in Task 1)

- [ ] Zoom controls for content scale
- [ ] Rotation support
- [ ] Flip horizontal/vertical
- [ ] Filters and effects
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Mobile touch support
- [ ] Multiple image frames on canvas

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
