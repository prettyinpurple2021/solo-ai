import { useState, TouchEvent } from 'react';

interface SwipeInput {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    minSwipeDistance?: number;
}

interface TouchPosition {
    x: number;
    y: number;
}

export const useSwipe = ({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50
}: SwipeInput) => {
    const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
    const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null); // Reset touchEnd
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart.x - touchEnd.x;
        const distanceY = touchStart.y - touchEnd.y;

        // Check if the swipe is more horizontal than vertical
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (!isHorizontalSwipe) return;

        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }

        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
