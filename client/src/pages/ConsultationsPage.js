import React, { useEffect, useState, useMemo } from 'react';
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
  useTheme,
  alpha,
} from '@mui/material';
import { VideoCall, CalendarToday } from '@mui/icons-material';
import userService from '../services/userService';
import consultationService from '../services/consultationService';
import CountdownTimer from '../components/common/CountdownTimer';
import { useNotification } from '../contexts/NotificationContext';
import { io as ioClient } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const ConsultationsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [status, setStatus] = useState('');
  const [openBook, setOpenBook] = useState(false);
  const [form, setForm] = useState({ providerId: '', scheduledAt: '', scheduledEnd: '', type: 'video', notes: '' });
  const [callInfo, setCallInfo] = useState(null); // { id, type }
  const [openCall, setOpenCall] = useState(false);
  const [tick, setTick] = useState(0); // used to force re-render when timers expire
  const [openPrescription, setOpenPrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
  const [currentConsultationForPrescription, setCurrentConsultationForPrescription] = useState(null);

  const nextUpcomingId = useMemo(() => {
    const now = new Date();
    const upcoming = consultations
      .filter((c) => c.status === 'scheduled' && c.scheduledAt && new Date(c.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return upcoming.length > 0 ? (upcoming[0]._id || upcoming[0].id) : null;
  }, [consultations, tick]);

  const notify = useNotification();
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  const navigate = useNavigate();

  // Only consultation-related notifications for this page
  const consultNotifications = (notify.notifications || []).filter(n => n.type && n.type.startsWith('consultation'));

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
      const consults = data?.data?.consultations || [];
      setConsultations(consults);

      // Auto-mark consultations as completed if their scheduledEnd has passed
      const toComplete = consults.filter(c => c.status === 'scheduled' && (c.scheduledEnd ? new Date(c.scheduledEnd) : null) && new Date(c.scheduledEnd) < new Date());
      if (toComplete.length > 0) {
        await Promise.all(toComplete.map(c => consultationService.respond(c._id || c.id, 'completed', token).catch(() => null)));
        // refresh list
        const { data: refreshed } = await consultationService.list(params, token);
        setConsultations(refreshed?.data?.consultations || []);
      }
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
        const payload = consultation?.consultation || consultation;
        const patient = consultation?.patient || payload?.patient || (payload && payload.data && payload.data.patient);
        const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email : 'A patient';
        const message = `${patientName} requested a consultation`;
        notify.showInfo(message);
        try {
          notify.addNotification({ id: payload?._id || payload?.id || `consult-${Date.now()}`, type: 'consultation:requested', message, data: payload, createdAt: new Date().toISOString(), read: false });
        } catch (e) { /* ignore */ }
      }
    });

    socket.on('consultation:responded', (payload) => {
      console.log('Received consultation:responded', payload);
      fetchConsultations();
      if (role === 'patient') {
        // payload may be either the consultation object or { consultation, action, provider, message }
        const message = payload?.message
          || (payload?.action && payload?.provider ? (
            `${(payload.provider.firstName || payload.provider.email || 'Provider')} ${payload.action === 'accept' ? 'accepted' : payload.action === 'deny' ? 'denied' : 'updated'} your consultation`
          ) : `Your consultation request was updated`);
        notify.showInfo(message);
        try {
          const consult = payload?.consultation || payload;
          notify.addNotification({ id: consult?._id || consult?.id || `consultresp-${Date.now()}`, type: 'consultation:responded', message, data: payload, createdAt: new Date().toISOString(), read: false });
        } catch (e) { /* ignore */ }
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, specializationFilter]);

  // periodic tick to refresh timers and re-evaluate Join visibility
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleBook = async () => {
    // Ensure required fields and server validation formats
    let providerId = (form.providerId || '').trim();
    if (!providerId) {
      notify.showError('Please select a doctor.');
      return;
    }

    if (!form.scheduledAt || !form.scheduledEnd) {
      notify.showError('Please provide both start and end time for the consultation.');
      return;
    }

    const startDate = new Date(form.scheduledAt);
    const endDate = new Date(form.scheduledEnd);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      notify.showError('Please provide valid start and end times.');
      return;
    }

    if (endDate <= startDate) {
      notify.showError('End time must be after start time.');
      return;
    }

    const scheduledAtIso = startDate.toISOString(); // Ensure it's a valid ISO string

    try {
      setLoading(true);
      const payload = { providerId, scheduledAt: scheduledAtIso, type: form.type, notes: form.notes };
      if (form.scheduledEnd) payload.scheduledEnd = new Date(form.scheduledEnd).toISOString();
      const { data } = await consultationService.request(payload, token);

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

  // Prescription helpers (doctor)
  const addMedicationRow = () => {
    setPrescriptionForm(f => ({ ...f, medications: [...(f.medications || []), { name: '', dosage: '', frequency: '', duration: '' }] }));
  };

  const updateMedicationField = (index, field, value) => {
    setPrescriptionForm(f => {
      const meds = (f.medications || []).map((m, i) => i === index ? { ...m, [field]: value } : m);
      return { ...f, medications: meds };
    });
  };

  const removeMedicationRow = (index) => {
    setPrescriptionForm(f => ({ ...f, medications: (f.medications || []).filter((_, i) => i !== index) }));
  };

  const submitPrescription = async () => {
    if (!currentConsultationForPrescription) return;
    try {
      setLoading(true);
      const payload = { medications: prescriptionForm.medications.filter(m => m.name), notes: prescriptionForm.notes };
      await consultationService.createPrescription(currentConsultationForPrescription._id || currentConsultationForPrescription.id, payload, token);
      notify.showSuccess('Prescription saved');
      setOpenPrescription(false);
      fetchConsultations();
    } catch (e) {
      console.error(e);
      notify.showError('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  const downloadPrescription = (prescription, consultation) => {
    const patient = consultation?.patient || {};
    const provider = consultation?.provider || {};
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>e-Prescription</title><style>body{font-family:Arial,sans-serif;padding:24px}h2{margin-bottom:8px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body><h2>e-Prescription</h2><div><strong>Patient:</strong> ${patient.firstName || ''} ${patient.lastName || ''} (${patient.email || ''})</div><div><strong>Provider:</strong> ${provider.firstName || ''} ${provider.lastName || ''}</div><div style="margin-top:12px"><strong>Issued:</strong> ${new Date(prescription.issuedAt || prescription.createdAt || Date.now()).toLocaleString()}</div><h3 style="margin-top:16px">Medications</h3><table><thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>${(prescription.medications || []).map(m => `<tr><td>${m.name || ''}</td><td>${m.dosage || ''}</td><td>${m.frequency || ''}</td><td>${m.duration || ''}</td></tr>`).join('')}</tbody></table><h3 style="margin-top:12px">Notes</h3><div>${(prescription.notes || '')}</div></body></html>`;

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `prescription-${(consultation && (consultation._id || consultation.id)) || Date.now()}.html`;
      a.href = url;
      a.download = filename;
      // Some browsers require the element to be in the DOM
      document.body.appendChild(a);
      a.click();
      a.remove();
      // release
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify.showSuccess('Prescription download started');
    } catch (e) {
      console.error('Download failed, falling back to open tab:', e);
      const win = window.open('', '_blank');
      if (!win) return notify.showError('Unable to open print window — check popup blocker');
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  };

  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'requested', 'denied'];

  const renderConsultationCard = (c) => {
    const now = new Date();
    const start = c.scheduledAt ? new Date(c.scheduledAt) : null;
    const end = c.scheduledEnd ? new Date(c.scheduledEnd) : (start ? new Date(start.getTime() + 30 * 60 * 1000) : null);

    return (
      <Grid key={c._id || c.id} item xs={12} md={6} lg={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Chip label={c.status} size="small" />
              <Chip label={c.type} variant="outlined" size="small" />
            </Box>
            {(role === 'health_worker' || role === 'doctor') ? (
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

            {(c.type === 'video' || c.type === 'audio') && (() => {
              if (!start || !end) return null;
              if (now < start) {
                if ((c._id || c.id) === nextUpcomingId) {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CountdownTimer deadline={start} label="Starts in" onExpired={() => setTick(t => t + 1)} />
                    </Box>
                  );
                }
                return null;
              }
              if (now >= start && now <= end) {
                if (c.status !== 'completed') return <Button size="small" onClick={() => { setCallInfo({ id: c._id || c.id, type: c.type }); setOpenCall(true); }}>Join</Button>;
                return null;
              }
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">Time Over</Typography>
                </Box>
              );
            })()}

            {(role === 'doctor' || role === 'health_worker') && (
              <>
                {c.prescription ? (
                  <Button size="small" onClick={() => downloadPrescription(c.prescription, c)}>Download Prescription</Button>
                ) : (end && now > end) ? (
                  <Button size="small" onClick={() => { setCurrentConsultationForPrescription(c); setPrescriptionForm({ medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' }); setOpenPrescription(true); }}>Prescribe</Button>
                ) : null}
              </>
            )}
            {role === 'patient' && c.prescription && (
              <Button size="small" onClick={() => downloadPrescription(c.prescription, c)}>Download Prescription</Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

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
              <InputLabel shrink>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                renderValue={(selected) => (selected === '' ? 'All' : selected)}
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {role !== 'doctor' && (
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
          )}
          {role !== 'doctor' && (
            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button variant="contained" onClick={() => setOpenBook(true)}>Book Consultation</Button>
            </Grid>
          )}
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          { consultations.length > 0 ? (
            consultations.filter(c => !(role === 'patient' && c.status === 'requested')).map(c => renderConsultationCard(c))
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
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Patient: {user?.firstName} {user?.lastName}</Typography>
              </Grid>
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
                  label="Start Date & Time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="datetime-local"
                  label="End Date & Time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={form.scheduledEnd}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledEnd: e.target.value }))}
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
        {/* Prescription Dialog */}
        <Dialog open={openPrescription} onClose={() => setOpenPrescription(false)} maxWidth="sm" fullWidth>
          <DialogTitle>e-Prescription</DialogTitle>
          <DialogContent>
            <Box>
              {(prescriptionForm.medications || []).map((m, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={5}>
                    <TextField label="Medication" fullWidth value={m.name} onChange={(e) => updateMedicationField(idx, 'name', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={4}><TextField label="Dosage" fullWidth value={m.dosage} onChange={(e) => updateMedicationField(idx, 'dosage', e.target.value)} /></Grid>
                      <Grid item xs={12} sm={4}><TextField label="Frequency" fullWidth value={m.frequency} onChange={(e) => updateMedicationField(idx, 'frequency', e.target.value)} /></Grid>
                      <Grid item xs={12} sm={4}><TextField label="Duration" fullWidth value={m.duration} onChange={(e) => updateMedicationField(idx, 'duration', e.target.value)} /></Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" color="error" onClick={() => removeMedicationRow(idx)}>Remove</Button>
                  </Grid>
                </Grid>
              ))}
              <Button onClick={addMedicationRow}>Add Medication</Button>
              <TextField label="Notes" fullWidth multiline minRows={3} sx={{ mt: 2 }} value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm(f => ({ ...f, notes: e.target.value }))} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrescription(false)}>Cancel</Button>
            <Button onClick={submitPrescription} variant="contained">Save Prescription</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ConsultationsPage;
