
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
};

const EmergencyDashboardPage = () => {
  const { showInfo, showSuccess, showError } = useNotification();
  const [emergencies, setEmergencies] = useState([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackEscalation, setFeedbackEscalation] = useState(null);
  const [feedback, setFeedback] = useState({ time_to_response: '', quality_of_care: 3, comments: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const { user } = useAuth();
  // Feedback dialog handlers
  const openFeedbackDialog = (escalation) => {
    setFeedbackEscalation(escalation);
    setFeedback({ time_to_response: '', quality_of_care: 3, comments: '' });
    setFeedbackDialogOpen(true);
  };
  const closeFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setFeedbackEscalation(null);
  };
  const submitFeedback = async () => {
    setFeedbackLoading(true);
    try {
      await axios.patch(`/api/emergencies/${feedbackEscalation._id}`, { feedback });
      showSuccess('Feedback submitted!');
      closeFeedbackDialog();
      fetchEmergencies();
    } catch (err) {
      showError('Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/emergencies');
      setEmergencies(res.data);
    } catch (err) {
      setEmergencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    // Setup socket.io for real-time updates
    const socket = io('/', { transports: ['websocket'] });
    socket.on('emergency:new', (data) => {
      fetchEmergencies();
      showInfo(`New emergency escalation: ${data?.title || 'Untitled'}`);
    });
    socket.on('emergency:update', (data) => {
      fetchEmergencies();
      showSuccess(`Escalation updated: ${data?.title || 'Untitled'} (Status: ${data?.status})`);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Status update handler
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`/api/emergencies/${id}`, { status: newStatus });
      await fetchEmergencies();
    } catch (err) {
      // Optionally show error
    }
  };

  const filteredEmergencies = statusFilter === 'all'
    ? emergencies
    : emergencies.filter(e => e.status === statusFilter);

  // Analytics calculations
  const total = emergencies.length;
  const pending = emergencies.filter(e => e.status === 'pending').length;
  const inProgress = emergencies.filter(e => e.status === 'in_progress').length;
  const resolved = emergencies.filter(e => e.status === 'resolved').length;
  // Bar chart data
  const chartData = [
    { status: 'Pending', count: pending },
    { status: 'In Progress', count: inProgress },
    { status: 'Resolved', count: resolved },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Emergency Escalation Dashboard</Typography>
      {/* Analytics Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Total</Typography><Typography variant="h4">{total}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Pending</Typography><Typography variant="h4" color="warning.main">{pending}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">In Progress</Typography><Typography variant="h4" color="info.main">{inProgress}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="h6">Resolved</Typography><Typography variant="h4" color="success.main">{resolved}</Typography></CardContent></Card></Grid>
      </Grid>
      {/* Bar Chart */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Status Breakdown</Typography>
          <BarChart
            xAxis={[{ scaleType: 'band', data: chartData.map(d => d.status) }]}
            series={[{ data: chartData.map(d => d.count), label: 'Count' }]}
            width={400}
            height={220}
          />
        </CardContent>
      </Card>
      {/* Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Escalations Map</Typography>
                <Box sx={{ height: 400 }}>
                  <MapContainer center={[22.5726, 88.3639]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filteredEmergencies.map(e => (
                      e.location && e.location.coordinates ? (
                        <Marker key={e._id} position={[e.location.coordinates[1], e.location.coordinates[0]]}>
                          <Popup>
                            <Typography variant="subtitle2">{e.title}</Typography>
                            <Typography variant="body2">{e.reason}</Typography>
                            <Chip label={e.status} color={statusColors[e.status] || 'default'} size="small" />
                          </Popup>
                        </Marker>
                      ) : null
                    ))}
                  </MapContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Escalation List</Typography>
                {filteredEmergencies.length === 0 ? (
                  <Typography>No escalations found.</Typography>
                ) : (
                  filteredEmergencies.map(e => (
                    <Box key={e._id} mb={2} p={1} border={1} borderColor="#eee" borderRadius={2}>
                      <Typography variant="subtitle1">{e.title}</Typography>
                      <Typography variant="body2">{e.reason}</Typography>
                      <Chip label={e.status} color={statusColors[e.status] || 'default'} size="small" sx={{ mr: 1 }} />
                      <Typography variant="caption">{e.location && (e.location.address?.city || e.location.landmark || 'Location specified')}</Typography>
                      {/* Status update buttons */}
                      <Box mt={1}>
                        {e.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(e._id, 'in_progress')}>Mark In Progress</button>
                            <button onClick={() => handleStatusUpdate(e._id, 'resolved')} style={{marginLeft:8}}>Mark Resolved</button>
                          </>
                        )}
                        {e.status === 'in_progress' && (
                          <button onClick={() => handleStatusUpdate(e._id, 'resolved')}>Mark Resolved</button>
                        )}
                      </Box>
                      {/* Feedback for resolved escalations */}
                      {e.status === 'resolved' && (
                        <Box mt={1}>
                          {e.feedback && e.feedback.comments ? (
                            <>
                              <Typography variant="body2" color="success.main">Feedback: {e.feedback.comments}</Typography>
                              <Typography variant="caption">Quality: {e.feedback.quality_of_care} / 5, Response Time: {e.feedback.time_to_response} min</Typography>
                            </>
                          ) : (user && (user._id === e.reporter_id || user.id === e.reporter_id) && (
                            <Button size="small" variant="outlined" onClick={() => openFeedbackDialog(e)}>
                              Submit Feedback
                            </Button>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={closeFeedbackDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            label="Time to Response (minutes)"
            type="number"
            fullWidth
            value={feedback.time_to_response}
            onChange={e => setFeedback(f => ({ ...f, time_to_response: e.target.value }))}
            margin="normal"
          />
          <Box display="flex" alignItems="center" gap={2} my={2}>
            <Typography>Quality of Care:</Typography>
            <Rating
              value={feedback.quality_of_care}
              onChange={(_, v) => setFeedback(f => ({ ...f, quality_of_care: v }))}
              max={5}
            />
          </Box>
          <TextField
            label="Comments"
            fullWidth
            multiline
            rows={3}
            value={feedback.comments}
            onChange={e => setFeedback(f => ({ ...f, comments: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeedbackDialog}>Cancel</Button>
          <Button onClick={submitFeedback} variant="contained" disabled={feedbackLoading}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
        </Grid>
      )}
    </Box>
  );
};

export default EmergencyDashboardPage;
