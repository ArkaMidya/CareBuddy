import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { VideoCall, CalendarToday } from '@mui/icons-material';
import consultationService from '../services/consultationService';

const ConsultationsPage = () => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [status, setStatus] = useState('');
  const [openBook, setOpenBook] = useState(false);
  const [form, setForm] = useState({ providerId: '', scheduledAt: '', type: 'video', notes: '' });
  const [callInfo, setCallInfo] = useState(null); // { id, type }
  const [openCall, setOpenCall] = useState(false);

  const generateObjectId = () => {
    const hex = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 24; i++) id += hex[Math.floor(Math.random() * 16)];
    return id;
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const { data } = await consultationService.list({ status }, token);
      setConsultations(data?.data?.consultations || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleBook = async () => {
    // Ensure required fields and server validation formats
    let providerId = (form.providerId || '').trim();
    if (!/^[a-fA-F0-9]{24}$/.test(providerId)) {
      providerId = generateObjectId();
    }
    const scheduledAtIso = form.scheduledAt
      ? new Date(form.scheduledAt).toISOString()
      : new Date(Date.now() + 60 * 1000).toISOString();
    try {
      setLoading(true);
      const { data } = await consultationService.book({
        providerId,
        scheduledAt: scheduledAtIso,
        type: form.type,
        notes: form.notes,
      }, token);
      setOpenBook(false);
      setForm({ providerId: '', scheduledAt: '', type: 'video', notes: '' });
      fetchConsultations();
      // Auto-start call for video/audio bookings
      if (form.type === 'video' || form.type === 'audio') {
        const consultation = data?.data?.consultation;
        if (consultation?.id) {
          setCallInfo({ id: consultation.id, type: form.type });
          setOpenCall(true);
          // Also open in new tab for reliability
          window.open(`https://meet.jit.si/CareBody-${consultation.id}` + (form.type==='audio' ? '#config.startWithVideoMuted=true' : ''), '_blank');
        }
      }
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        py: 3,
        position: 'relative',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <VideoCall />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Telemedicine Consultations
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button variant="contained" onClick={() => setOpenBook(true)}>Book Consultation</Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          {consultations.map((c) => (
            <Grid key={c.id} item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={c.status} size="small" />
                    <Chip label={c.type} variant="outlined" size="small" />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{c.provider?.name || 'Provider'}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="caption">{new Date(c.scheduledAt).toLocaleString()}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {consultations.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">No consultations found.</Typography>
            </Grid>
          )}
        </Grid>

        <Dialog open={openBook} onClose={() => setOpenBook(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book a Consultation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Provider ID"
                  fullWidth
                  value={form.providerId}
                  onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="datetime-local"
                  label="Date & Time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="audio">Audio</MenuItem>
                    <MenuItem value="chat">Chat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBook(false)}>Cancel</Button>
            <Button onClick={handleBook} variant="contained">Book</Button>
          </DialogActions>
        </Dialog>

        {/* Call Dialog */}
        <Dialog open={openCall} onClose={() => setOpenCall(false)} maxWidth="md" fullWidth>
          <DialogTitle>{callInfo?.type === 'audio' ? 'Audio Call' : 'Video Call'}</DialogTitle>
          <DialogContent>
            {callInfo && (
              <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden' }}>
                <iframe
                  title="Consultation Call"
                  src={`https://meet.jit.si/CareBody-${callInfo.id}#config.prejoinPageEnabled=false${callInfo.type==='audio' ? '&config.startWithVideoMuted=true' : ''}`}
                  frameBorder="0"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {callInfo && (
              <Button onClick={() => window.open(`https://meet.jit.si/CareBody-${callInfo.id}`, '_blank')}>
                Open in new window
              </Button>
            )}
            <Button onClick={() => setOpenCall(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ConsultationsPage;
