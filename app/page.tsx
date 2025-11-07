/**
 * Image Frame Demo Page
 * Demonstrates the ImageFrame component with aspect ratio controls
 */

"use client";

import React from "react";
import { ImageFrame, AspectRatioSelector } from "@/components/image-frame";
import { useImageFrameStore } from "@/store/use-image-frame-store";

export default function HomePage() {
  const { config, setAspectRatio } = useImageFrameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Image Frame & Crop System</h1>
              <p className="text-sm text-gray-500 mt-1">
                Task 1: Setup Image Frame Structure & Aspect Ratio System
              </p>
            </div>
            <AspectRatioSelector value={config.aspectRatio} onChange={setAspectRatio} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Canvas Area */}
          <div className="relative w-full h-[600px]">
            <ImageFrame
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop"
              alt="Demo landscape image"
              onLoad={(dimensions) => {
                console.log("Image loaded:", dimensions);
              }}
            />
          </div>

          {/* Instructions Panel */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Frame Mode (Default)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Drag corner handles to resize frame (maintains aspect ratio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Use dropdown to change aspect ratio (1:1, 4:3, 16:9, 3:2, 2:3, 9:16)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Double-click frame to enter Edit Mode</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Edit Mode</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Drag inside frame to reposition content (pan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Content is constrained to fill entire frame (no gaps)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Double-click to exit Edit Mode</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Implemented Features ✓</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Frame-Content parent-child structure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Overflow: hidden on Frame</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Corner-only resize handles (4 corners)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>6 aspect ratios (1:1, 4:3, 16:9, 3:2, 2:3, 9:16)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Default aspect ratio: 4:3</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No "none" option (all ratios are locked)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Proportional resize maintains aspect ratio</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Radix UI dropdown for aspect ratio selection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h2 className="text-lg font-semibold">Technical Implementation</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">State Management</h3>
                <p className="text-sm text-gray-600">
                  Zustand store manages frame config, resize state, and edit mode
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">UI Components</h3>
                <p className="text-sm text-gray-600">
                  Radix UI DropdownMenu with Tailwind CSS styling
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Calculations</h3>
                <p className="text-sm text-gray-600">
                  Utility functions handle aspect ratio math, scaling, and positioning
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
