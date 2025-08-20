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
import userService from '../services/userService';
import { useNotification } from '../contexts/NotificationContext';
import { io as ioClient } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const ConsultationsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [status, setStatus] = useState('');
  const [openBook, setOpenBook] = useState(false);
  const [form, setForm] = useState({ providerId: '', scheduledAt: '', type: 'video', notes: '' });
  const [callInfo, setCallInfo] = useState(null); // { id, type }
  const [openCall, setOpenCall] = useState(false);

  const notify = useNotification();
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');

  const generateObjectId = () => {
    const hex = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 24; i++) id += hex[Math.floor(Math.random() * 16)];
    return id;
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await userService.listDoctors(token, specializationFilter);
      setDoctors(data?.data?.users || []);
    } catch (e) {
      setDoctors([]);
    }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status) {
        params.status = status;
      }
      const { data } = await consultationService.list(params, token);
      setConsultations(data?.data?.consultations || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
    // only fetch doctors for patients (providers should see requests, not doctor list)
    if (role === 'patient') fetchDoctors(); // Only fetch doctors if the current user is a patient

    // socket for real-time updates
    const socket = ioClient(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });

    console.log('Socket init, token present?', !!localStorage.getItem('token'), 'role=', role);
    socket.on('connect', () => console.log('Socket connected, id=', socket.id));
    socket.on('connect_error', (err) => console.error('Socket connect_error', err));

    socket.on('consultation:requested', (consultation) => {
      console.log('Received consultation:requested', consultation);
      // always refresh consultations (server will filter by authenticated user)
      fetchConsultations();
      if (role === 'doctor') { // Only notify if the current user is a doctor
        notify.showInfo('New consultation request received');
      }
    });

    socket.on('consultation:responded', (consultation) => {
      console.log('Received consultation:responded', consultation);
      fetchConsultations();
      if (role === 'patient') {
        notify.showInfo('Your consultation request was updated');
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, specializationFilter]);

  const handleBook = async () => {
    // Ensure required fields and server validation formats
    let providerId = (form.providerId || '').trim();
    if (!providerId) {
      notify.showError('Please select a doctor.');
      return;
    }

    if (!form.scheduledAt) {
      notify.showError('Please select a date and time for the consultation.');
      return;
    }

    const scheduledAtIso = new Date(form.scheduledAt).toISOString(); // Ensure it's a valid ISO string

    try {
      setLoading(true);
      const { data } = await consultationService.request({
        providerId,
        scheduledAt: scheduledAtIso,
        type: form.type,
        notes: form.notes,
      }, token);

      setOpenBook(false);
      setForm({ providerId: '', scheduledAt: '', type: 'video', notes: '' });
      fetchConsultations();
      notify.showSuccess('Consultation request sent!');

      // Auto-start call for video/audio bookings (if immediately scheduled, which happens after doctor accepts)
      if (data?.data?.consultation?.status === 'scheduled' && (form.type === 'video' || form.type === 'audio')) {
        const consultation = data.data.consultation;
        if (consultation?.id) {
          setCallInfo({ id: consultation.id, type: form.type });
          setOpenCall(true);
          // Also open in new tab for reliability
          window.open(`https://meet.jit.si/CareBody-${consultation.id}` + (form.type==='audio' ? '#config.startWithVideoMuted=true' : ''), '_blank');
        }
      }
    } catch (e) {
      console.error('Failed to book consultation:', e.response?.data || e.message);
      notify.showError(e.response?.data?.message || 'Failed to send consultation request.');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'requested', 'denied'];

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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                label="Specialization"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {Array.from(new Set(doctors.flatMap(d => (d.providerInfo?.specialization || []).map(s => s))))
                  .filter(Boolean)
                  .map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button variant="contained" onClick={() => setOpenBook(true)}>Book Consultation</Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          { consultations.length > 0 ? (
            consultations.filter(c => !(role === 'patient' && c.status === 'requested')).map((c) => (
              <Grid key={c._id || c.id} item xs={12} md={6} lg={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={c.status} size="small" />
                      <Chip label={c.type} variant="outlined" size="small" />
                    </Box>
                    { (role === 'health_worker' || role === 'doctor') ? (
                      <Typography variant="h6" sx={{ mb: 1 }}>Patient: {c.patient?.firstName} {c.patient?.lastName}</Typography>
                    ) : (
                      <Typography variant="h6" sx={{ mb: 1 }}>Doctor: {c.provider?.firstName} {c.provider?.lastName}</Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">Email: {c.patient?.email || c.provider?.email}</Typography>
                    {c.notes && <Typography variant="body2" sx={{ mt: 1 }}>Notes: {c.notes}</Typography>}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="caption">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : 'Not scheduled'}</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    {c.status === 'requested' && (role === 'health_worker' || role === 'doctor') && (
                      <> 
                        <Button size="small" onClick={async () => {
                          try {
                            await consultationService.respond(c._id || c.id, 'accept', token);
                            notify.showSuccess('Accepted consultation');
                            fetchConsultations();
                          } catch (e) { notify.showError('Failed to accept'); }
                        }}>Accept</Button>
                        <Button size="small" onClick={async () => {
                          try {
                            await consultationService.respond(c._id || c.id, 'deny', token);
                            notify.showSuccess('Denied consultation');
                            fetchConsultations();
                          } catch (e) { notify.showError('Failed to deny'); }
                        }}>Deny</Button>
                      </>
                    )}
                    {c.status === 'scheduled' && (c.type === 'video' || c.type === 'audio') && (
                      <Button size="small" onClick={() => { setCallInfo({ id: c._id || c.id, type: c.type }); setOpenCall(true); }}>Join</Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            role === 'patient' && doctors.length > 0 ? (
              (specializationFilter ? doctors.filter(d => (d.providerInfo?.specialization || []).includes(specializationFilter)) : doctors).map((doc) => (
                <Grid key={doc._id} item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={doc.role === 'health_worker' ? 'Health Worker' : (doc.role || 'Provider')} size="small" />
                        <Chip label={doc.providerInfo?.specialization?.[0] || 'General'} variant="outlined" size="small" />
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>{doc.firstName} {doc.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{doc.providerInfo?.specialization?.join(', ')}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" onClick={() => { setForm(f => ({ ...f, providerId: doc._id })); setOpenBook(true); }}>Request Consultation</Button>
                        <Button size="small" component="a" href={`mailto:${doc.email}`}>Contact</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {role === 'patient' ? 'No doctors found or no active consultations.' : 'No consultation requests or active consultations.'}
                </Typography>
              </Grid>
            )
          )}
        </Grid>

        <Dialog open={openBook} onClose={() => setOpenBook(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book a Consultation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    label="Doctor"
                    value={form.providerId}
                    onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
                  >
                    <MenuItem value="">Select Doctor</MenuItem>
                    {doctors.map((doc) => (
                      <MenuItem key={doc._id} value={doc._id}>
                        {doc.firstName} {doc.lastName} ({doc.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
