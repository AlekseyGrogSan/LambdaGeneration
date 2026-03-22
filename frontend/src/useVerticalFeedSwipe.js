import { useCallback, useRef, useState } from 'react';

const THRESHOLD = 50;

/**
 * Вертикальная лента: pointerdown / pointermove / pointerup.
 * translateY(-currentIndex * slideHeight + deltaY); при отпускании transition 0.25s ease.
 */
export function useVerticalFeedSwipe({
    enabled,
    slideHeight,
    itemCount,
    currentIndex,
    setCurrentIndex,
    onSwipePastEnd,
}) {
    const [deltaY, setDeltaY] = useState(0);
    const [transitionOn, setTransitionOn] = useState(true);

    const startYRef = useRef(0);
    const startXRef = useRef(0);
    const modeRef = useRef(null);
    const pointerIdRef = useRef(null);
    const deltaYRef = useRef(0);

    const finish = useCallback(
        (e) => {
            if (pointerIdRef.current !== e.pointerId) return;
            pointerIdRef.current = null;

            setTransitionOn(true);

            if (modeRef.current === 'v' && itemCount > 0) {
                const d = deltaYRef.current;
                if (Math.abs(d) > THRESHOLD) {
                    if (d < 0) {
                        if (currentIndex < itemCount - 1) {
                            setCurrentIndex((i) => i + 1);
                        } else if (onSwipePastEnd) {
                            onSwipePastEnd();
                        }
                    } else if (d > 0 && currentIndex > 0) {
                        setCurrentIndex((i) => i - 1);
                    }
                }
            }

            modeRef.current = null;
            deltaYRef.current = 0;
            setDeltaY(0);

            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
        },
        [currentIndex, itemCount, onSwipePastEnd, setCurrentIndex],
    );

    const onPointerDown = useCallback(
        (e) => {
            if (!enabled || slideHeight <= 0 || itemCount === 0) return;
            pointerIdRef.current = e.pointerId;
            startYRef.current = e.clientY;
            startXRef.current = e.clientX;
            modeRef.current = null;
            deltaYRef.current = 0;
            setDeltaY(0);
            setTransitionOn(false);
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
        },
        [enabled, slideHeight, itemCount],
    );

    const onPointerMove = useCallback(
        (e) => {
            if (!enabled || pointerIdRef.current !== e.pointerId) return;

            const dy = e.clientY - startYRef.current;
            const dx = e.clientX - startXRef.current;
            const ady = Math.abs(dy);
            const adx = Math.abs(dx);

            if (modeRef.current === null && (adx > 12 || ady > 12)) {
                if (ady > adx) {
                    modeRef.current = 'v';
                } else {
                    modeRef.current = 'h';
                }
            }

            if (modeRef.current === 'h') {
                return;
            }

            if (modeRef.current === 'v') {
                e.preventDefault();
                deltaYRef.current = dy;
                setDeltaY(dy);
            }
        },
        [enabled],
    );

    const onPointerUp = useCallback(
        (e) => {
            finish(e);
        },
        [finish],
    );

    const onPointerCancel = useCallback(
        (e) => {
            finish(e);
        },
        [finish],
    );

    const translateY = -currentIndex * slideHeight + deltaY;

    return {
        pointerHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
        },
        trackStyle: {
            display: 'flex',
            flexDirection: 'column',
            transform: `translateY(${translateY}px)`,
            transition: transitionOn ? 'transform 0.25s ease' : 'none',
            willChange: transitionOn ? 'auto' : 'transform',
        },
    };
}
