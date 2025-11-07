/**
 * Aspect Ratio Selector Component
 * Dropdown menu for selecting image frame aspect ratio
 */

"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import type { AspectRatio } from "@/types/image-frame";
import { ASPECT_RATIO_OPTIONS } from "@/lib/aspect-ratio-utils";

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (aspectRatio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="Select aspect ratio"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-60"
          >
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          <span>{value}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-60"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-md shadow-lg border border-gray-200 p-1 z-50"
          sideOffset={5}
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Aspect Ratio
          </div>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          {ASPECT_RATIO_OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className="relative flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 outline-none transition-colors"
              onSelect={() => onChange(option.value)}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <span className="flex-1 font-medium">{option.label}</span>
              <span className="text-xs text-gray-500">
                {option.ratio > 1 ? "Landscape" : option.ratio < 1 ? "Portrait" : "Square"}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
