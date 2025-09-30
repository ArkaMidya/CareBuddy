import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Feedback, Star, Add, Visibility, CheckCircle } from '@mui/icons-material';
import { feedbackService } from '../services/feedbackService';

const FeedbackReferralPage = () => {
  const [userRole, setUserRole] = useState('user');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) setUserRole(user.role);
  }, []);
    const [feedback, setFeedback] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({
      title: '',
      description: '',
      type: 'general',
      serviceType: 'general',
      serviceId: '',
      rating: { overall: 5 },
      isAnonymous: false
    });

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [feedbackRes, feedbackStatsRes] = await Promise.all([
          feedbackService.getFeedback(),
          feedbackService.getFeedbackStats()
        ]);
        if (feedbackRes.success) {
          setFeedback(feedbackRes.data.feedback || []);
        }
        if (feedbackStatsRes.success) {
          setFeedbackStats(feedbackStatsRes.data);
        }
      } catch (error) {
        let errorMsg = 'Failed to fetch data. Please try again.';
        if (error.response) {
          errorMsg += `\nStatus: ${error.response.status}`;
          if (error.response.data && error.response.data.message) {
            errorMsg += `\nMessage: ${error.response.data.message}`;
          }
          if (error.response.data && error.response.data.error) {
            errorMsg += `\nError: ${error.response.data.error}`;
          }
        } else if (error.message) {
          errorMsg += `\n${error.message}`;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    const handleFeedbackSubmit = async () => {
      try {
        const payload = { ...feedbackForm };
        if (payload.serviceType === 'general') delete payload.serviceId;
        const response = await feedbackService.submitFeedback(payload);
        if (response.success) {
          setFeedback(prev => [response.data.feedback, ...prev]);
          setFeedbackDialogOpen(false);
          setFeedbackForm({
            title: '',
            description: '',
            type: 'general',
            serviceType: 'general',
            serviceId: '',
            rating: { overall: 5 },
            isAnonymous: false
          });
          fetchData();
        }
      } catch (error) {
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
          fetchData();
        }
      } catch (error) {
        setError('Failed to update feedback status. Please try again.');
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
          Feedback Management
        </Typography>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={0} centered>
            <Tab 
              icon={<Feedback />} 
              label="Feedback" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Patient Feedback</Typography>
          {userRole === 'patient' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFeedbackDialogOpen(true)}
            >
              Submit Feedback
            </Button>
          )}
        </Box>
        <Grid container spacing={3}>
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
                          <Feedback />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {item.description.substring(0, 100)}...
                              </Typography>
                            </Box>
                          }
                        />
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
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
                <Typography variant="body1" paragraph>
                  {selectedFeedback.description}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Rating:
                </Typography>
                <Rating value={selectedFeedback.rating?.overall || 0} readOnly max={5} />
              </Box>
            ) : (
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                  margin="normal"
                  multiline
                  rows={4}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={feedbackForm.type}
                    label="Type"
                    onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="care_quality">Care Quality</MenuItem>
                    <MenuItem value="wait_time">Wait Time</MenuItem>
                    <MenuItem value="communication">Communication</MenuItem>
                    <MenuItem value="facility">Facility</MenuItem>
                    <MenuItem value="medication">Medication</MenuItem>
                    <MenuItem value="follow_up">Follow Up</MenuItem>
                  </Select>
                </FormControl>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <Typography>Rating:</Typography>
                  <Rating
                    value={feedbackForm.rating.overall}
                    onChange={(e, value) => setFeedbackForm({...feedbackForm, rating: { ...feedbackForm.rating, overall: value }})}
                    max={5}
                  />
                </Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={feedbackForm.serviceType}
                    label="Service Type"
                    onChange={(e) => setFeedbackForm({...feedbackForm, serviceType: e.target.value})}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="campaign">Campaign</MenuItem>
                    <MenuItem value="facility">Facility</MenuItem>
                  </Select>
                </FormControl>
                {/* Service ID selection logic omitted for brevity */}
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button variant="contained" onClick={handleFeedbackSubmit}>
                    Submit
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  export default FeedbackReferralPage;
                // ...existing code...
