"use client";

import { useSwipeable } from "react-swipeable";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Edit, Check, X } from "lucide-react";

interface SwipeableItemProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: {
        icon?: ReactNode;
        label?: string;
        color?: string;
    };
    rightAction?: {
        icon?: ReactNode;
        label?: string;
        color?: string;
    };
    className?: string;
    disabled?: boolean;
}

export function SwipeableItem({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction,
    rightAction,
    className,
    disabled = false
}: SwipeableItemProps) {
    const [offset, setOffset] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            if (disabled) return;
            // Limit swipe distance
            const newOffset = eventData.deltaX;
            // Only allow swiping if action exists for that direction
            if ((newOffset > 0 && !rightAction) || (newOffset < 0 && !leftAction)) {
                return;
            }
            setOffset(newOffset);
            setIsSwiping(true);
        },
        onSwipedLeft: (eventData) => {
            if (disabled || !leftAction) {
                setOffset(0);
                return;
            }
            if (eventData.deltaX < -100) {
                onSwipeLeft?.();
            }
            setOffset(0);
            setIsSwiping(false);
        },
        onSwipedRight: (eventData) => {
            if (disabled || !rightAction) {
                setOffset(0);
                return;
            }
            if (eventData.deltaX > 100) {
                onSwipeRight?.();
            }
            setOffset(0);
            setIsSwiping(false);
        },
        onTap: () => {
            setOffset(0);
            setIsSwiping(false);
        },
        trackMouse: true,
        preventScrollOnSwipe: true,
    });

    return (
        <div className="relative overflow-hidden touch-pan-y">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                {/* Right Swipe Action (appears on left) */}
                {rightAction && offset > 0 && (
                    <div
                        className={cn(
                            "h-full flex items-center justify-start px-6 w-full transition-opacity duration-200",
                            rightAction.color || "bg-green-500"
                        )}
                        style={{ opacity: Math.min(offset / 100, 1) }}
                    >
                        <div className="flex items-center gap-2 text-white font-medium">
                            {rightAction.icon || <Check className="w-5 h-5" />}
                            {rightAction.label && <span>{rightAction.label}</span>}
                        </div>
                    </div>
                )}

                {/* Left Swipe Action (appears on right) */}
                {leftAction && offset < 0 && (
                    <div
                        className={cn(
                            "h-full flex items-center justify-end px-6 w-full transition-opacity duration-200",
                            leftAction.color || "bg-red-500"
                        )}
                        style={{ opacity: Math.min(Math.abs(offset) / 100, 1) }}
                    >
                        <div className="flex items-center gap-2 text-white font-medium">
                            {leftAction.icon || <Trash2 className="w-5 h-5" />}
                            {leftAction.label && <span>{leftAction.label}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Foreground Content */}
            <div
                {...handlers}
                className={cn(
                    "relative transition-transform duration-200 ease-out bg-card",
                    className
                )}
                style={{
                    transform: `translateX(${offset}px)`,
                    cursor: isSwiping ? 'grabbing' : 'grab'
                }}
            >
                {children}
            </div>
        </div>
    );
}
