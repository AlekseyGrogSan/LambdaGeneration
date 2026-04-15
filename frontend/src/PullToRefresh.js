import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';

const PullToRefresh = ({ onRefresh, isRefreshing, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const pullThreshold = 80;
    const maxPull = 120;

    const handleStart = (clientY) => {
        if (!containerRef.current) return;
        // Only start if at the top
        if (containerRef.current.scrollTop === 0) {
            setStartY(clientY);
            setIsDragging(true);
        }
    };

    const handleMove = (clientY) => {
        if (!isDragging || isRefreshing) return;
        
        const delta = clientY - startY;
        if (delta > 0 && containerRef.current.scrollTop === 0) {
            // Prevent default behavior (like native pull to refresh on mobile) if dragging
            // Note: This relies on passive: false event listeners if we wanted to prevent default natively, 
            // but for a React component wrapper, calculating distance is enough.
            const distance = Math.min(delta * 0.4, maxPull); // 0.4 friction
            setPullDistance(distance);
        } else {
            setPullDistance(0);
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        setStartY(0);

        if (pullDistance > pullThreshold && !isRefreshing) {
            onRefresh();
        }
        
        // Reset distance
        setPullDistance(0);
    };

    // Touch events
    const onTouchStart = (e) => handleStart(e.touches[0].clientY);
    const onTouchMove = (e) => {
        // e.preventDefault(); // can't do here passively
        handleMove(e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    // Mouse events for desktop
    const onMouseDown = (e) => handleStart(e.clientY);
    const onMouseMove = (e) => {
        if (isDragging) {
            // e.preventDefault();
            handleMove(e.clientY);
        }
    };
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => handleEnd();

    return (
        <Box 
            sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: `translateY(${Math.min(pullDistance, pullThreshold) - 60}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    zIndex: 10,
                    opacity: pullDistance > 10 || isRefreshing ? 1 : 0
                }}
            >
                <CircularProgress 
                    size={24} 
                    thickness={4} 
                    variant={isRefreshing ? 'indeterminate' : 'determinate'}
                    value={isRefreshing ? undefined : Math.min((pullDistance / pullThreshold) * 100, 100)}
                    sx={{ color: '#00bfa5' }}
                />
            </Box>
            <Box
                ref={containerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    transform: `translateY(${isRefreshing ? 50 : pullDistance}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    // Pass wrapper styles
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default PullToRefresh;