import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const MobileFeedListSkeleton = ({ count = 3 }) => (
    <Stack spacing={1.5} sx={{ width: '100%', py: 1 }}>
        {Array.from({ length: count }).map((_, i) => (
            <Box
                key={i}
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    bgcolor: '#2c2c2c',
                    border: '1px solid #333',
                }}
            >
                <Stack direction="row" spacing={1} sx={{ p: 1.25, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(0,191,165,0.15)' }} />
                    <Skeleton variant="text" width="45%" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                </Stack>
                <Skeleton variant="text" width="92%" sx={{ mx: 1.25, bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Skeleton variant="text" width="70%" sx={{ mx: 1.25, bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton
                    variant="rectangular"
                    height={160}
                    sx={{ m: 1.25, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)' }}
                />
                <Stack direction="row" spacing={2} sx={{ px: 1.25, pb: 1.25 }}>
                    <Skeleton variant="rounded" width={72} height={40} sx={{ bgcolor: 'rgba(0,191,165,0.12)' }} />
                    <Skeleton variant="rounded" width={72} height={40} sx={{ bgcolor: 'rgba(0,191,165,0.12)' }} />
                </Stack>
            </Box>
        ))}
    </Stack>
);

export default MobileFeedListSkeleton;
