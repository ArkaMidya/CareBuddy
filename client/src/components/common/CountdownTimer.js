import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';

const pad = (n) => String(n).padStart(2, '0');

const CountdownTimer = ({ deadline, onExpired, label = 'Starts in' }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) return;
    let mounted = true;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        if (mounted) setTimeLeft(0);
        if (onExpired) onExpired();
        return;
      }

      if (mounted) setTimeLeft(diff);
    };

    update();
    const t = setInterval(update, 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [deadline, onExpired]);

  if (!deadline) return null;
  if (timeLeft === 0) return null;
  if (timeLeft == null) return null;

  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Chip label={`${days}d ${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`} color="primary" />
    </Box>
  );
};

export default CountdownTimer;


