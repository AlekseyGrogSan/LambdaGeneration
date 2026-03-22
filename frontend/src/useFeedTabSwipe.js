import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_THRESHOLD = 50;
const VELOCITY_FLING = 0.35;

function isInteractivePointerTarget(node) {
    if (!node || typeof Element === 'undefined' || !(node instanceof Element)) {
        return false;
    }
    return Boolean(
        node.closest(
            [
                'button',
                'a[href]',
                'input',
                'textarea',
                'select',
                'label',
                '[role="button"]',
                '[role="link"]',
                '[role="checkbox"]',
                '[role="switch"]',
                '[role="tab"]',
                '[role="menuitem"]',
                '[contenteditable="true"]',
            ].join(', '),
        ),
    );
}

/**
 * Горизонтальный свайп между двумя вкладками ленты (pointer / touch).
 * Свайп влево → next, вправо → prev. Блокирует вертикальный скролл при горизонтальном жесте.
 * Не перехватывает жесты с кнопок/ссылок/полей — иначе ломается click из‑за pointer capture.
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
    const surfaceElRef = useRef(null);
    const docListenersRef = useRef(null);
    const horizontalCaptureSetRef = useRef(false);

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

    const removeDocListeners = useCallback(() => {
        const bundle = docListenersRef.current;
        if (!bundle) return;
        document.removeEventListener('pointermove', bundle.move);
        document.removeEventListener('pointerup', bundle.end);
        document.removeEventListener('pointercancel', bundle.end);
        docListenersRef.current = null;
    }, []);

    const finishGesture = useCallback(
        (e) => {
            if (activePointerId.current !== e.pointerId) return;

            const surface = surfaceElRef.current;
            if (horizontalCaptureSetRef.current && surface) {
                try {
                    surface.releasePointerCapture(e.pointerId);
                } catch (_) {
                    /* ignore */
                }
                horizontalCaptureSetRef.current = false;
            }

            activePointerId.current = null;
            surfaceElRef.current = null;
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
            removeDocListeners();
        },
        [activeTab, onSwipeLeft, onSwipeRight, threshold, unlockScroll, setOffset, removeDocListeners],
    );

    useEffect(() => () => removeDocListeners(), [removeDocListeners]);

    useEffect(() => {
        if (!enabled) {
            removeDocListeners();
            unlockScroll();
            horizontalCaptureSetRef.current = false;
            activePointerId.current = null;
            surfaceElRef.current = null;
            mode.current = null;
            setOffset(0);
        }
    }, [enabled, removeDocListeners, unlockScroll, setOffset]);

    const onPointerDown = useCallback(
        (e) => {
            if (!enabled) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (isInteractivePointerTarget(e.target)) return;

            removeDocListeners();

            activePointerId.current = e.pointerId;
            surfaceElRef.current = e.currentTarget;
            horizontalCaptureSetRef.current = false;
            mode.current = null;
            startX.current = e.clientX;
            startY.current = e.clientY;
            lastX.current = e.clientX;
            lastT.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
            velocityRef.current = 0;

            const onMove = (ev) => {
                if (!enabled || activePointerId.current !== ev.pointerId) return;
                const dx = ev.clientX - startX.current;
                const dy = ev.clientY - startY.current;

                if (mode.current === null) {
                    const ax = Math.abs(dx);
                    const ay = Math.abs(dy);
                    if (ax > 14 || ay > 14) {
                        if (ax > ay * 1.18) {
                            mode.current = 'h';
                            lockScroll();
                            const surface = surfaceElRef.current;
                            if (surface && !horizontalCaptureSetRef.current) {
                                try {
                                    surface.setPointerCapture(ev.pointerId);
                                    horizontalCaptureSetRef.current = true;
                                } catch (_) {
                                    /* ignore */
                                }
                            }
                        } else {
                            mode.current = 'v';
                        }
                    }
                }

                if (mode.current === 'h') {
                    ev.preventDefault();
                    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                    const dt = now - lastT.current;
                    if (dt > 0) {
                        velocityRef.current = (ev.clientX - lastX.current) / dt;
                    }
                    lastX.current = ev.clientX;
                    lastT.current = now;
                    setOffset(rubberBand(dx));
                }
            };

            const onEnd = (ev) => {
                finishGesture(ev);
            };

            docListenersRef.current = { move: onMove, end: onEnd };
            document.addEventListener('pointermove', onMove, { passive: false });
            document.addEventListener('pointerup', onEnd);
            document.addEventListener('pointercancel', onEnd);
        },
        [enabled, finishGesture, lockScroll, rubberBand, removeDocListeners, setOffset],
    );

    return {
        dragOffset,
        swipeHandlers: {
            onPointerDown,
        },
    };
}
