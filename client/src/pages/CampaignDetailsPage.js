import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Card, CardContent, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert, Chip
} from '@mui/material';
import CampaignsService from '../services/campaignsService';
import { useAuth } from '../contexts/AuthContext';
import AddToCalendar from '../utils/addToCalendar';
import CountdownTimer from '../components/common/CountdownTimer';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openRegister, setOpenRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [form, setForm] = useState({ preferredDate: '', preferredTime: '', notes: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await CampaignsService.get(id);
        if (!mounted) return;
        setCampaign(res.data.data.campaign || res.data.campaign || res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate('/campaigns');
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (!campaign || !user) return;
    const registered = (campaign.registrations || []).some(r => String(r.user) === String(user._id || user.id));
    setAlreadyRegistered(registered);
  }, [campaign, user]);

  const handleOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      await CampaignsService.register(id, form);
      // refresh
      const res = await CampaignsService.get(id);
      setCampaign(res.data.data.campaign || res.data.campaign || res.data);
      setAlreadyRegistered(true);
      setOpenRegister(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!campaign) return <Container><Typography>Campaign not found</Typography></Container>;

  const regClosed = campaign.status === 'cancelled' || (campaign.registrationDeadline && new Date() > new Date(campaign.registrationDeadline));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/bglogo.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: 0,
        },
      }}>
        <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>{campaign.title}</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{campaign.description}</Typography>
              <Typography variant="body2">Type: {campaign.type}</Typography>
              <Typography variant="body2">Location: {campaign.location?.address || campaign.location?.city || JSON.stringify(campaign.location)}</Typography>
              {
                (() => {
                  const scheduleFirst = campaign.schedule && campaign.schedule.length ? campaign.schedule[0] : null;
                    const formatDate = (dateStr) => {
                      if (!dateStr) return 'TBD';
                      const d = new Date(dateStr);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      return `${day}/${month}/${year}`;
                    };
                    const displayDate = campaign.campaignDate
                      ? formatDate(campaign.campaignDate)
                      : (scheduleFirst ? `${formatDate(scheduleFirst.date)}${scheduleFirst.time ? ` ${scheduleFirst.time}` : ''}` : 'TBD');
                    return <Typography variant="body2">Date: {displayDate}</Typography>;
                })()
              }
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <CountdownTimer deadline={campaign.registrationDeadline} />
              {(() => {
                const now = new Date();
                const campaignHeld = campaign.campaignDate && new Date(campaign.campaignDate) < now;
                if (campaignHeld) {
                  return <Button variant="outlined" color="secondary" disabled>Already Held</Button>;
                }
                if (alreadyRegistered) return <Alert severity="success">You have already registered</Alert>;
                if (campaign.status === 'cancelled') return <Chip label="Cancelled" color="error" />;
                if (regClosed) return <Chip label="Registration closed" color="warning" />;
                if (user && user.role === 'patient') return <Button variant="contained" onClick={handleOpenRegister}>Register</Button>;
                return null;
              })()}
              <Button variant="outlined" onClick={() => AddToCalendar(campaign)} disabled={campaign.status === 'cancelled' || (campaign.registrationDeadline && new Date() > new Date(campaign.registrationDeadline))}>Add to Calendar</Button>
            </Box>
          </Box>
        </CardContent>
        </Card>

      <Dialog open={openRegister} onClose={handleCloseRegister} fullWidth>
        <DialogTitle>Register for {campaign.title}</DialogTitle>
        <form onSubmit={handleRegister}>
          <DialogContent>
            <TextField
              label="Preferred Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.preferredDate}
              onChange={(e) => setForm(f => ({ ...f, preferredDate: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Preferred Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.preferredTime}
              onChange={(e) => setForm(f => ({ ...f, preferredTime: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRegister}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={registerLoading}>{registerLoading ? 'Registering...' : 'Register'}</Button>
          </DialogActions>
        </form>
      </Dialog>
        
      </Box>
    </Container>
  );
};

export default CampaignDetailsPage;


