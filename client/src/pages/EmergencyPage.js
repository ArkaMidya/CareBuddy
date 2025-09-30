import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Chip, CircularProgress, Alert, Divider } from '@mui/material';

const EmergencyPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/emergencies')
      .then(res => {
        setEmergencies(res.data.emergencies || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load emergencies');
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Emergency Escalations</Typography>
      <Divider sx={{ mb: 2 }} />
      {loading ? <CircularProgress /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {emergencies.length === 0 && !loading ? (
        <Typography>No emergency escalations found.</Typography>
      ) : (
        emergencies.map(em => (
          <Paper key={em._id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6">{em.title || 'Untitled Emergency'}</Typography>
            <Typography variant="body2" color="text.secondary">{em.description}</Typography>
            <Chip label={em.severity} color="error" sx={{ mr: 1 }} />
            <Chip label={em.emergency_type || 'General'} color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>Reported by: {em.reporter_id || 'Unknown'}</Typography>
            <Typography variant="body2">Location: {em.location?.landmark || 'N/A'}</Typography>
            <Typography variant="body2">Assigned to: {em.assigned_to || 'Not assigned yet'}</Typography>
            <Typography variant="body2">Date: {new Date(em.createdAt).toLocaleString()}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default EmergencyPage;
