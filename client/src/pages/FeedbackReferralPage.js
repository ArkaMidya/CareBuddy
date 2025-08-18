import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Feedback,
  Share,
  Assessment,
  TrendingUp,
  Star,
  Add,
  Visibility,
  Edit,
  CheckCircle,
  Schedule,
  Warning,
  Person,
  CalendarToday,
  LocationOn,
  MedicalServices,
  Psychology,
  LocalHospital,
  PriorityHigh,
  Timeline,
  Analytics
} from '@mui/icons-material';
import { feedbackService } from '../services/feedbackService';
import { referralService } from '../services/referralService';

const FeedbackReferralPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);

  // Form states
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    description: '',
    type: 'general',
    rating: { overall: 5 },
    isAnonymous: false
  });

  const [referralForm, setReferralForm] = useState({
    title: '',
    description: '',
    type: 'specialist',
    specialty: '',
    priority: 'routine',
    urgency: 'medium',
    clinicalReason: '',
    patient: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [feedbackRes, referralsRes, feedbackStatsRes, referralStatsRes] = await Promise.all([
        feedbackService.getFeedback(),
        referralService.getReferrals(),
        feedbackService.getFeedbackStats(),
        referralService.getReferralStats()
      ]);

      if (feedbackRes.success) {
        setFeedback(feedbackRes.data.feedback || []);
      }
      if (referralsRes.success) {
        setReferrals(referralsRes.data.referrals || []);
      }
      if (feedbackStatsRes.success) {
        setFeedbackStats(feedbackStatsRes.data);
      }
      if (referralStatsRes.success) {
        setReferralStats(referralStatsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFeedbackSubmit = async () => {
    try {
      const response = await feedbackService.submitFeedback(feedbackForm);
      if (response.success) {
        setFeedback(prev => [response.data.feedback, ...prev]);
        setFeedbackDialogOpen(false);
        setFeedbackForm({
          title: '',
          description: '',
          type: 'general',
          rating: { overall: 5 },
          isAnonymous: false
        });
        // Refresh data after submission
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    }
  };

  const handleFeedbackStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const response = await feedbackService.updateFeedbackStatus(feedbackId, { status: newStatus });
      if (response.success) {
        setFeedback(prev => prev.map(f => 
          f._id === feedbackId ? { ...f, status: newStatus } : f
        ));
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setError('Failed to update feedback status. Please try again.');
    }
  };

  const handleReferralSubmit = async () => {
    try {
      const response = await referralService.createReferral(referralForm);
      if (response.success) {
        setReferrals(prev => [response.data.referral, ...prev]);
        setReferralDialogOpen(false);
        setReferralForm({
          title: '',
          description: '',
          type: 'specialist',
          specialty: '',
          priority: 'routine',
          urgency: 'medium',
          clinicalReason: '',
          patient: ''
        });
        // Refresh data after submission
        fetchData();
      }
    } catch (error) {
      console.error('Error creating referral:', error);
      setError('Failed to create referral. Please try again.');
    }
  };

  const getFeedbackTypeIcon = (type) => {
    switch (type) {
      case 'care_quality': return <MedicalServices />;
      case 'wait_time': return <Schedule />;
      case 'communication': return <Psychology />;
      case 'facility': return <LocalHospital />;
      case 'medication': return <PriorityHigh />;
      case 'follow_up': return <Timeline />;
      default: return <Feedback />;
    }
  };

  const getReferralTypeIcon = (type) => {
    switch (type) {
      case 'specialist': return <MedicalServices />;
      case 'diagnostic': return <Assessment />;
      case 'treatment': return <LocalHospital />;
      case 'follow_up': return <Timeline />;
      case 'emergency': return <PriorityHigh />;
      case 'preventive': return <TrendingUp />;
      default: return <Share />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'addressed': return 'primary';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'accepted': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      case 'routine': return 'success';
      case 'urgent': return 'warning';
      case 'emergency': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Feedback & Referral Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab 
            icon={<Feedback />} 
            label="Feedback" 
            iconPosition="start"
          />
          <Tab 
            icon={<Share />} 
            label="Referrals" 
            iconPosition="start"
          />
          <Tab 
            icon={<Analytics />} 
            label="Analytics" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Feedback Tab */}
      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Patient Feedback</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFeedbackDialogOpen(true)}
            >
              Submit Feedback
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Feedback Stats */}
            {feedbackStats && (
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Feedback Overview
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Star color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h4">
                        {feedbackStats.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        / 5.0
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {feedbackStats.total} total feedback
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Feedback List */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Feedback
                  </Typography>
                  {feedback.length === 0 ? (
                    <Typography color="textSecondary" textAlign="center" py={4}>
                      No feedback submitted yet
                    </Typography>
                  ) : (
                    <List>
                      {feedback.slice(0, 5).map((item) => (
                        <ListItem key={item._id} divider>
                          <ListItemIcon>
                            {getFeedbackTypeIcon(item.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Rating value={item.rating.overall} readOnly size="small" />
                                  <Chip 
                                    label={item.type.replace('_', ' ')} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={item.status} 
                                    color={getStatusColor(item.status)}
                                    size="small"
                                  />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                  {item.description.substring(0, 100)}...
                                </Typography>
                              </Box>
                            }
                          />
                                                     <Box display="flex" gap={1}>
                             <IconButton
                               size="small"
                               onClick={() => {
                                 setSelectedFeedback(item);
                                 setFeedbackDialogOpen(true);
                               }}
                             >
                               <Visibility />
                             </IconButton>
                             {item.status === 'pending' && (
                               <>
                                 <IconButton
                                   size="small"
                                   color="primary"
                                   onClick={() => handleFeedbackStatusUpdate(item._id, 'reviewed')}
                                   title="Mark as Reviewed"
                                 >
                                   <CheckCircle />
                                 </IconButton>
                                 <IconButton
                                   size="small"
                                   color="success"
                                   onClick={() => handleFeedbackStatusUpdate(item._id, 'resolved')}
                                   title="Mark as Resolved"
                                 >
                                   <CheckCircle />
                                 </IconButton>
                               </>
                             )}
                           </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Referrals Tab */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Patient Referrals</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setReferralDialogOpen(true)}
            >
              Create Referral
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Referral Stats */}
            {referralStats && (
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Referral Overview
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {referralStats.total}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total referrals
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="body2">
                        Pending: {referralStats.statusBreakdown?.pending || 0}
                      </Typography>
                      <Typography variant="body2">
                        Accepted: {referralStats.statusBreakdown?.accepted || 0}
                      </Typography>
                      <Typography variant="body2">
                        Completed: {referralStats.statusBreakdown?.completed || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Referral List */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Referrals
                  </Typography>
                  {referrals.length === 0 ? (
                    <Typography color="textSecondary" textAlign="center" py={4}>
                      No referrals created yet
                    </Typography>
                  ) : (
                    <List>
                      {referrals.slice(0, 5).map((item) => (
                        <ListItem key={item._id} divider>
                          <ListItemIcon>
                            {getReferralTypeIcon(item.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Chip 
                                    label={item.type} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={item.status} 
                                    color={getStatusColor(item.status)}
                                    size="small"
                                  />
                                  <Chip 
                                    label={item.priority} 
                                    color={getPriorityColor(item.priority)}
                                    size="small"
                                  />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                  {item.description.substring(0, 100)}...
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReferral(item);
                              setReferralDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Analytics & Insights
          </Typography>
          
          <Grid container spacing={3}>
            {/* Feedback Analytics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Feedback Analytics
                  </Typography>
                  {feedbackStats ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Average Rating: {feedbackStats.averageRating.toFixed(1)}/5.0
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Total Feedback: {feedbackStats.total}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        By Type:
                      </Typography>
                      {Object.entries(feedbackStats.typeBreakdown || {}).map(([type, count]) => (
                        <Box key={type} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">
                            {type.replace('_', ' ')}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No feedback data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Referral Analytics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Referral Analytics
                  </Typography>
                  {referralStats ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Total Referrals: {referralStats.total}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        By Status:
                      </Typography>
                      {Object.entries(referralStats.statusBreakdown || {}).map(([status, count]) => (
                        <Box key={status} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">
                            {status}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No referral data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFeedback ? 'View Feedback' : 'Submit Feedback'}
        </DialogTitle>
        <DialogContent>
          {selectedFeedback ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFeedback.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={selectedFeedback.rating.overall} readOnly />
                <Chip label={selectedFeedback.type.replace('_', ' ')} />
                <Chip label={selectedFeedback.status} color={getStatusColor(selectedFeedback.status)} />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedFeedback.description}
              </Typography>
              {selectedFeedback.response && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Response:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedFeedback.response.content}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={feedbackForm.description}
                    onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={feedbackForm.type}
                      onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                      label="Type"
                    >
                      <MenuItem value="care_quality">Care Quality</MenuItem>
                      <MenuItem value="wait_time">Wait Time</MenuItem>
                      <MenuItem value="communication">Communication</MenuItem>
                      <MenuItem value="facility">Facility</MenuItem>
                      <MenuItem value="medication">Medication</MenuItem>
                      <MenuItem value="follow_up">Follow-up</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <Typography>Rating:</Typography>
                    <Rating
                      value={feedbackForm.rating.overall}
                      onChange={(event, newValue) => {
                        setFeedbackForm({
                          ...feedbackForm, 
                          rating: { ...feedbackForm.rating, overall: newValue }
                        });
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>
            {selectedFeedback ? 'Close' : 'Cancel'}
          </Button>
          {!selectedFeedback && (
            <Button variant="contained" onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog 
        open={referralDialogOpen} 
        onClose={() => setReferralDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedReferral ? 'View Referral' : 'Create Referral'}
        </DialogTitle>
        <DialogContent>
          {selectedReferral ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedReferral.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip label={selectedReferral.type} />
                <Chip label={selectedReferral.status} color={getStatusColor(selectedReferral.status)} />
                <Chip label={selectedReferral.priority} color={getPriorityColor(selectedReferral.priority)} />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedReferral.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Clinical Reason:
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedReferral.clinicalReason}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={referralForm.title}
                    onChange={(e) => setReferralForm({...referralForm, title: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={referralForm.description}
                    onChange={(e) => setReferralForm({...referralForm, description: e.target.value})}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={referralForm.type}
                      onChange={(e) => setReferralForm({...referralForm, type: e.target.value})}
                      label="Type"
                    >
                      <MenuItem value="specialist">Specialist</MenuItem>
                      <MenuItem value="diagnostic">Diagnostic</MenuItem>
                      <MenuItem value="treatment">Treatment</MenuItem>
                      <MenuItem value="follow_up">Follow-up</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                      <MenuItem value="preventive">Preventive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Specialty"
                    value={referralForm.specialty}
                    onChange={(e) => setReferralForm({...referralForm, specialty: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={referralForm.priority}
                      onChange={(e) => setReferralForm({...referralForm, priority: e.target.value})}
                      label="Priority"
                    >
                      <MenuItem value="routine">Routine</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Urgency</InputLabel>
                    <Select
                      value={referralForm.urgency}
                      onChange={(e) => setReferralForm({...referralForm, urgency: e.target.value})}
                      label="Urgency"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clinical Reason"
                    value={referralForm.clinicalReason}
                    onChange={(e) => setReferralForm({...referralForm, clinicalReason: e.target.value})}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReferralDialogOpen(false)}>
            {selectedReferral ? 'Close' : 'Cancel'}
          </Button>
          {!selectedReferral && (
            <Button variant="contained" onClick={handleReferralSubmit}>
              Create Referral
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackReferralPage;
