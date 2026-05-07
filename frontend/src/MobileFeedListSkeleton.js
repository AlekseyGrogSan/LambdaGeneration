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
                    bgcolor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-default)',
                }}
            >
                <Stack direction="row" spacing={1} sx={{ p: 1.25, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'var(--ui-c141)' }} />
                    <Skeleton variant="text" width="45%" sx={{ bgcolor: 'color-mix(in oklab, var(--text-primary) 8%, transparent)' }} />
                </Stack>
                <Skeleton variant="text" width="92%" sx={{ mx: 1.25, bgcolor: 'color-mix(in oklab, var(--text-primary) 8%, transparent)' }} />
                <Skeleton variant="text" width="70%" sx={{ mx: 1.25, bgcolor: 'color-mix(in oklab, var(--text-primary) 6%, transparent)' }} />
                <Skeleton
                    variant="rectangular"
                    height={160}
                    sx={{ m: 1.25, borderRadius: '12px', bgcolor: 'color-mix(in oklab, var(--text-primary) 6%, transparent)' }}
                />
                <Stack direction="row" spacing={2} sx={{ px: 1.25, pb: 1.25 }}>
                    <Skeleton variant="rounded" width={72} height={40} sx={{ bgcolor: 'var(--ui-c140)' }} />
                    <Skeleton variant="rounded" width={72} height={40} sx={{ bgcolor: 'var(--ui-c140)' }} />
                </Stack>
            </Box>
        ))}
    </Stack>
);

export default MobileFeedListSkeleton;
