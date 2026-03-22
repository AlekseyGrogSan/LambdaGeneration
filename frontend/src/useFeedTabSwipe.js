import { useCallback, useRef, useState } from 'react';

const DEFAULT_THRESHOLD = 50;
const VELOCITY_FLING = 0.35;

/**
 * Горизонтальный свайп между двумя вкладками ленты (pointer / touch).
 * Свайп влево → next, вправо → prev. Блокирует вертикальный скролл при горизонтальном жесте.
 */
export function useFeedTabSwipe({
    enabled,
    activeTab,
    onSwipeLeft,
    onSwipeRight,
    scrollContainerRef,
    threshold = DEFAULT_THRESHOLD,
}) {
    const [dragOffset, setDragOffset] = useState(0);
    const dragOffsetRef = useRef(0);
    const startX = useRef(0);
    const startY = useRef(0);
    const mode = useRef(null);
    const activePointerId = useRef(null);
    const lastX = useRef(0);
    const lastT = useRef(0);
    const velocityRef = useRef(0);

    const setOffset = useCallback((v) => {
        dragOffsetRef.current = v;
        setDragOffset(v);
    }, []);

    const unlockScroll = useCallback(() => {
        document.body.style.touchAction = '';
        const el = scrollContainerRef?.current;
        if (el) {
            el.style.overflowY = '';
            el.style.touchAction = '';
        }
    }, [scrollContainerRef]);

    const lockScroll = useCallback(() => {
        document.body.style.touchAction = 'none';
        const el = scrollContainerRef?.current;
        if (el) {
            el.style.overflowY = 'hidden';
            el.style.touchAction = 'none';
        }
    }, [scrollContainerRef]);

    const rubberBand = useCallback((dx) => {
        if (activeTab === 'random' && dx > 0) {
            return dx * 0.32;
        }
        if (activeTab === 'recommend' && dx < 0) {
            return dx * 0.32;
        }
        return dx;
    }, [activeTab]);

    const onPointerDown = useCallback(
        (e) => {
            if (!enabled) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            activePointerId.current = e.pointerId;
            mode.current = null;
            startX.current = e.clientX;
            startY.current = e.clientY;
            lastX.current = e.clientX;
            lastT.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
            velocityRef.current = 0;
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
        },
        [enabled],
    );

    const onPointerMove = useCallback(
        (e) => {
            if (!enabled || activePointerId.current !== e.pointerId) return;
            const dx = e.clientX - startX.current;
            const dy = e.clientY - startY.current;

            if (mode.current === null) {
                const ax = Math.abs(dx);
                const ay = Math.abs(dy);
                if (ax > 14 || ay > 14) {
                    if (ax > ay * 1.18) {
                        mode.current = 'h';
                        lockScroll();
                    } else {
                        mode.current = 'v';
                    }
                }
            }

            if (mode.current === 'h') {
                e.preventDefault();
                const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                const dt = now - lastT.current;
                if (dt > 0) {
                    velocityRef.current = (e.clientX - lastX.current) / dt;
                }
                lastX.current = e.clientX;
                lastT.current = now;
                setOffset(rubberBand(dx));
            }
        },
        [enabled, lockScroll, rubberBand, setOffset],
    );

    const finish = useCallback(
        (e) => {
            if (activePointerId.current !== e.pointerId) return;
            activePointerId.current = null;
            unlockScroll();

            if (mode.current === 'h') {
                const dx = dragOffsetRef.current;
                const v = velocityRef.current;
                const goLeft = dx < -threshold || (dx < -22 && v < -VELOCITY_FLING);
                const goRight = dx > threshold || (dx > 22 && v > VELOCITY_FLING);

                if (activeTab === 'random' && goLeft) {
                    onSwipeLeft?.();
                } else if (activeTab === 'recommend' && goRight) {
                    onSwipeRight?.();
                }
            }

            mode.current = null;
            setOffset(0);
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (_) {
                /* ignore */
            }
        },
        [activeTab, onSwipeLeft, onSwipeRight, threshold, unlockScroll, setOffset],
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

    return {
        dragOffset,
        swipeHandlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
        },
    };
}
