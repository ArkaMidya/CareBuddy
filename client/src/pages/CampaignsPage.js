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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CampaignsService from '../services/campaignsService';
import { useAuth } from '../contexts/AuthContext';
import CountdownTimer from '../components/common/CountdownTimer';
import AddToCalendar from '../utils/addToCalendar';

const CampaignsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Registration dialog state
  const [openRegister, setOpenRegister] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({ preferredDate: '', preferredTime: '', notes: '' });
  const [registerErrors, setRegisterErrors] = useState({});
  const [registeredCampaignIds, setRegisteredCampaignIds] = useState(new Set());
  const [removedCampaignIds, setRemovedCampaignIds] = useState(() => {
    try {
      const raw = localStorage.getItem('removedCampaignIds');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) {
      return new Set();
    }
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', type: '', location: { address: '', city: '', state: '', country: '', zipCode: '' }, capacity: '', registrationDeadline: '', campaignDate: ''
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filterType) params.type = filterType;
        if (filterStatus) params.status = filterStatus;
    const res = await CampaignsService.list(params);
    const list = res.data?.data?.campaigns || res.data?.campaigns || [];
    if (!mounted) return;
    const sorted = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // exclude locally removed campaigns
    const filtered = sorted.filter(c => !removedCampaignIds.has(c.id || c._id));
    setCampaigns(filtered);
      } catch (err) {
        console.error(err);
        setError('Failed to load campaigns');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [filterType, filterStatus]);

  const handleOpenRegister = (campaign) => {
    if (!user) return navigate('/login');
    setSelectedCampaign(campaign);
    setRegisterForm({ preferredDate: '', preferredTime: '', notes: '' });
    setOpenRegister(true);
  };

  const handleCloseRegister = () => setOpenRegister(false);

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setRegisterLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Build payload only with fields present
      const payload = {};
      if (user?.role === 'patient') {
        // patients send only notes (personal info taken from token)
        if (registerForm.notes) payload.notes = registerForm.notes.trim();
      } else {
        if (registerForm.preferredDate) payload.preferredDate = registerForm.preferredDate;
        if (registerForm.preferredTime) payload.preferredTime = registerForm.preferredTime;
        if (registerForm.notes) payload.notes = registerForm.notes.trim();
      }
      console.debug('Register payload', payload);
      await CampaignsService.register(selectedCampaign.id || selectedCampaign._id, payload, token);
      setRegisteredCampaignIds(prev => new Set(prev).add(selectedCampaign.id || selectedCampaign._id));
      setOpenRegister(false);
      setRegisterErrors({});
    } catch (err) {
      console.error(err);
      // show validation errors if present
      if (err.response?.data?.errors) {
        const map = {};
        err.response.data.errors.forEach(e => { map[e.param || e.field || 'server'] = e.msg || e.message; });
        setRegisterErrors(map);
      } else {
        setRegisterErrors({ server: err.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCancelCampaign = async (campaign) => {
    if (!campaign) return;
    if (!window.confirm('Are you sure you want to cancel this campaign?')) return;
    try {
      const token = localStorage.getItem('token');
      await CampaignsService.cancel(campaign.id || campaign._id, token);
      // refresh list
      const res = await CampaignsService.list({ type: filterType, status: filterStatus });
      const list = res.data?.data?.campaigns || res.data?.campaigns || [];
      const sorted = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filtered = sorted.filter(c => !removedCampaignIds.has(c.id || c._id));
      setCampaigns(filtered);
    } catch (err) {
      console.error('Cancel failed', err);
      alert(err.response?.data?.message || 'Failed to cancel campaign');
    }
  };

  const handleRemoveCampaign = async (campaign) => {
    if (!campaign) return;
    const idKey = campaign.id || campaign._id;
    // Try to permanently delete on server if user has permission
    try {
      const token = localStorage.getItem('token');
      await CampaignsService.remove(idKey, token);
      // remove from local list
      setCampaigns(prev => prev.filter(c => (c.id || c._id) !== idKey));
      // also remove from local removed ids if present
      setRemovedCampaignIds(prev => {
        const next = new Set(prev);
        if (next.has(idKey)) {
          next.delete(idKey);
          try { localStorage.setItem('removedCampaignIds', JSON.stringify(Array.from(next))); } catch (e) {}
        }
        return next;
      });
    } catch (err) {
      console.error('Delete failed', err);
      // fallback: hide locally and persist
      const next = new Set(removedCampaignIds);
      next.add(idKey);
      try { localStorage.setItem('removedCampaignIds', JSON.stringify(Array.from(next))); } catch (e) {}
      setRemovedCampaignIds(next);
      setCampaigns(prev => prev.filter(c => (c.id || c._id) !== idKey));
      alert(err.response?.data?.message || 'Failed to delete campaign, hidden locally');
    }
  };

  if (loading) return (
    <Container maxWidth="lg"><Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box></Container>
  );

  // Display all fetched campaigns
  const displayedCampaigns = campaigns;

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        py: 3,
        position: 'relative',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Health Campaigns
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="immunization">Immunization</MenuItem>
                <MenuItem value="health_checkup">Health Checkup</MenuItem>
                <MenuItem value="mental_health">Mental Health</MenuItem>
                <MenuItem value="blood_donation">Blood Donation</MenuItem>
                <MenuItem value="wellness">Wellness</MenuItem>
                <MenuItem value="awareness">Awareness</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Button onClick={() => { setFilterType(''); setFilterStatus(''); }}>Clear</Button>
          </Box>

          {user && ['admin','ngo','health_worker'].includes(user.role) && (
            <Button variant="contained" onClick={() => { setCreateErrors({}); setOpenCreate(true); }}>Create Campaign</Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          {displayedCampaigns.map((c) => {
            const id = c.id || c._id;
            const isCancelled = c.status === 'cancelled';
            const regClosed = c.status === 'cancelled' || (c.registrationDeadline && new Date() > new Date(c.registrationDeadline));
            const alreadyRegistered = registeredCampaignIds.has(id) || (c.registrations || []).some(r => r.user && (r.user === (user?._id || user?.id)));
            return (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>{c.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{c.description}</Typography>
                    <Typography variant="caption" color="text.secondary">Type: {c.type}</Typography>
                    <Box sx={{ mt: 1 }}>
                      {c.status !== 'cancelled' && <CountdownTimer deadline={c.registrationDeadline} />}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button size="small" component={RouterLink} to={`/campaigns/${id}`}>Details</Button>
                    <Button size="small" onClick={() => AddToCalendar(c, null, null, null)} disabled={isCancelled || (c.registrationDeadline && new Date() > new Date(c.registrationDeadline))}>Add to Calendar</Button>
                    {/* Render exactly one registration status or action */}
                    {(() => {
                      // If campaign creator or authorized roles, show cancel button when not cancelled
                      const allowedCancelRoles = ['admin','ngo','health_worker'];
                      const isOrganizer = !!(c.organizer && (String(c.organizer) === String(user?._id || user?.id)));
                      const canCancel = isOrganizer || allowedCancelRoles.includes(user?.role);

                      if (alreadyRegistered) return <Chip label="You have already registered" color="success" />;
                      if (isCancelled) {
                        // show Cancelled chip and, for organizer/authorized users, a Remove button to hide the card
                        return (
                          <>
                            <Chip label="Cancelled" color="error" />
                            {canCancel && (
                              <Button size="small" color="inherit" variant="outlined" onClick={() => handleRemoveCampaign(c)} sx={{ ml: 1 }}>
                                Remove
                              </Button>
                            )}
                          </>
                        );
                      }
                      if (regClosed) return <Chip label="Registration closed" color="warning" />;
                      if (canCancel) return <Button size="small" color="error" variant="outlined" onClick={() => handleCancelCampaign(c)}>Cancel</Button>;
                      if (user?.role === 'patient') return <Button size="small" variant="contained" onClick={() => handleOpenRegister(c)}>Register</Button>;
                      return null;
                    })()}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Registration dialog */}
        <Dialog open={openRegister} onClose={handleCloseRegister} fullWidth>
          <DialogTitle>Register for Campaign</DialogTitle>
          <form onSubmit={handleSubmitRegister}>
            <DialogContent>
              {user?.role === 'patient' ? (
                <>
                  <TextField
                    label="Name"
                    fullWidth
                    value={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    value={user.email || ''}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    value={user.phone || ''}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  {registerErrors.server && <Alert severity="error">{registerErrors.server}</Alert>}
                  <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    fullWidth
                    value={registerForm.notes}
                    onChange={(e) => setRegisterForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Preferred Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={registerForm.preferredDate}
                    onChange={(e) => setRegisterForm(f => ({ ...f, preferredDate: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Preferred Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={registerForm.preferredTime}
                    onChange={(e) => setRegisterForm(f => ({ ...f, preferredTime: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  {registerErrors.server && <Alert severity="error">{registerErrors.server}</Alert>}
                  <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    fullWidth
                    value={registerForm.notes}
                    onChange={(e) => setRegisterForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRegister}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Register'}</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Create campaign dialog (authorized users only) */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth>
          <DialogTitle>Create Campaign</DialogTitle>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const errs = {};
            if (!createForm.title) errs.title = 'Title is required';
            if (!createForm.type) errs.type = 'Type is required';
            if (!createForm.description) errs.description = 'Description is required';
            if (!createForm.registrationDeadline) errs.registrationDeadline = 'Registration deadline is required';
            if (!createForm.campaignDate) errs.campaignDate = 'Campaign date is required';
            if (!createForm.location?.address) errs.location = 'Location address is required';
            setCreateErrors(errs);
            if (Object.keys(errs).length) return;
            setCreateLoading(true);
            try {
              const token = localStorage.getItem('token');
              const toIso = (localDt) => {
                try {
                  return localDt ? new Date(localDt).toISOString() : null;
                } catch (e) { return localDt; }
              };

              const payload = {
                title: createForm.title,
                description: createForm.description,
                type: createForm.type,
                location: createForm.location,
                // include capacity only when user provided a value
                ...(createForm.capacity ? { capacity: parseInt(createForm.capacity, 10) } : {}),
                registrationDeadline: toIso(createForm.registrationDeadline),
                campaignDate: toIso(createForm.campaignDate)
              };
              await CampaignsService.create(payload, token);
               const res = await CampaignsService.list();
               const list = res.data?.data?.campaigns || res.data?.campaigns || [];
               const sorted = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
               const filtered = sorted.filter(c => !removedCampaignIds.has(c.id || c._id));
               setCampaigns(filtered);
              setOpenCreate(false);
              } catch (err) {
                console.error(err);
                const resp = err.response?.data;
                if (resp?.errors) {
                  const serverErrors = {};
                  resp.errors.forEach(e => { serverErrors[e.param || e.field || 'server'] = e.msg || e.message; });
                  setCreateErrors(serverErrors);
                } else if (resp) {
                  setCreateErrors({ server: JSON.stringify(resp) });
                } else {
                  setCreateErrors({ server: 'Create failed' });
                }
              } finally {
              setCreateLoading(false);
            }
          }}>
            <DialogContent>
              {createErrors.server && <Alert severity="error" sx={{ mb: 2 }}>{createErrors.server}</Alert>}
              <TextField fullWidth label="Title" value={createForm.title} onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))} error={!!createErrors.title} helperText={createErrors.title} sx={{ mb: 2 }} />
              <TextField fullWidth label="Description" value={createForm.description} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))} error={!!createErrors.description} helperText={createErrors.description} multiline rows={3} sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                label="Type"
                value={createForm.type}
                onChange={(e) => setCreateForm(f => ({ ...f, type: e.target.value }))}
                error={!!createErrors.type}
                helperText={createErrors.type}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value="immunization">Immunization</MenuItem>
                <MenuItem value="health_checkup">Health Checkup</MenuItem>
                <MenuItem value="mental_health">Mental Health</MenuItem>
                <MenuItem value="blood_donation">Blood Donation</MenuItem>
                <MenuItem value="wellness">Wellness</MenuItem>
                <MenuItem value="awareness">Awareness</MenuItem>
              </TextField>
              <TextField fullWidth label="Location Address" value={createForm.location.address} onChange={(e) => setCreateForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))} error={!!createErrors.location} helperText={createErrors.location} sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                inputProps={{ min: 0 }}
                value={createForm.capacity}
                onChange={(e) => setCreateForm(f => ({ ...f, capacity: e.target.value }))}
                error={!!createErrors.capacity}
                helperText={createErrors.capacity}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Registration Deadline" type="datetime-local" InputLabelProps={{ shrink: true }} value={createForm.registrationDeadline} onChange={(e) => setCreateForm(f => ({ ...f, registrationDeadline: e.target.value }))} error={!!createErrors.registrationDeadline} helperText={createErrors.registrationDeadline} sx={{ mb: 2 }} />
              <TextField fullWidth label="Campaign Date" type="datetime-local" InputLabelProps={{ shrink: true }} value={createForm.campaignDate} onChange={(e) => setCreateForm(f => ({ ...f, campaignDate: e.target.value }))} error={!!createErrors.campaignDate} helperText={createErrors.campaignDate} sx={{ mb: 2 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create'}</Button>
            </DialogActions>
          </form>
        </Dialog>

      </Box>
    </Container>
  );
};

export default CampaignsPage;





