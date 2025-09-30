import React, { useState, useEffect } from 'react';
import reportsService from '../../services/reportsService';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  FilterList,
  Sort,
  Add,
  LocationOn,
  Warning,
  CheckCircle,
  Schedule,
  Undo,
  Done,
  Person,
  CalendarToday,
  Category,
  Description
} from '@mui/icons-material';
import { format } from 'date-fns';

const ReportsList = ({
  reports = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onResolve,
  onUndo,
  userRole = 'user'
}) => {
  const [filteredReports, setFilteredReports] = useState(reports);
  const [escalatedIds, setEscalatedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Emergency Escalation State
  const { user } = useAuth();
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationError, setEscalationError] = useState('');
  const [escalationSuccess, setEscalationSuccess] = useState(false);
  const [emergencyType, setEmergencyType] = useState('General');

  // Check if user has admin privileges
  const hasAdminPrivileges = ['admin', 'doctor'].includes(userRole);

  useEffect(() => {
    // Fetch escalated report IDs on mount
    async function fetchEscalated() {
      try {
        const result = await reportsService.getEscalatedReportIds();
        setEscalatedIds(result.escalated || []);
      } catch (e) {
        setEscalatedIds([]);
      }
    }
    fetchEscalated();
  }, []);

  useEffect(() => {
    let filtered = [...reports];
    // Mark escalated reports
    filtered = filtered.map(r => {
      const id = String(r._id || r.id);
      if (id === 'escalated') {
        console.warn('Invalid report id detected:', id, r);
        return { ...r, escalated: false };
      }
      const isEscalated = escalatedIds.includes(id);
      console.log('Report', id, 'escalated:', isEscalated);
      return { ...r, escalated: isEscalated };
    });
    console.log('Escalated IDs:', escalatedIds);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const titleMatch = report.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = report.description?.toLowerCase().includes(searchTerm.toLowerCase());
        // Handle location search for both string and object formats
        let locationMatch = false;
        if (typeof report.location === 'string') {
          locationMatch = report.location.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (report.location) {
          const city = report.location.address?.city || '';
          const landmark = report.location.landmark || '';
          locationMatch = city.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         landmark.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return titleMatch || descriptionMatch || locationMatch;
      });
    }
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt || a.date);
          bValue = new Date(b.createdAt || b.date);
          break;
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'severity':
          aValue = a.severity || 'low';
          bValue = b.severity || 'low';
          break;
        case 'status':
          aValue = a.status || 'pending';
          bValue = b.status || 'pending';
          break;
        default:
          aValue = a.title || '';
          bValue = b.title || '';
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, severityFilter, sortBy, sortOrder, escalatedIds]);

  const getSeverityColor = (severity) => {

    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle fontSize="small" />;
      case 'in_progress':
        return <Schedule fontSize="small" />;
      case 'pending':
        return <Warning fontSize="small" />;
      default:
        return <Warning fontSize="small" />;
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
    if (onView) onView(report);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditDialogOpen(true);
    if (onEdit) onEdit(report);
  };

  const handleResolve = (report) => {
    if (onResolve) {
      onResolve(report);
    }
  };

  const handleUndo = (report) => {
    if (onUndo) {
      onUndo(report);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedReport(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedReport(null);
  };

  // Emergency Escalation Handlers
  const handleOpenEscalateDialog = (report) => {
    setSelectedReport(report);
    setEscalationReason('');
    setEscalationError('');
    setEscalationSuccess(false);
    setEmergencyType('General');
    setEscalateDialogOpen(true);
  };

  const handleCloseEscalateDialog = () => {
    setEscalateDialogOpen(false);
    setSelectedReport(null);
    setEscalationReason('');
    setEscalationError('');
    setEscalationSuccess(false);
  };

  // Helper to check if selected report has a valid location for escalation

  const handleSubmitEscalation = async () => {
  // Debug: print selected report location before escalation
  console.log('Escalation: selectedReport.location =', selectedReport.location);
    if (!escalationReason.trim()) {
      setEscalationError('Please provide a reason for escalation.');
      return;
    }
    setEscalationLoading(true);
    setEscalationError('');
    try {
      // Ensure location is in GeoJSON format
      let geoLocation = null;
      if (selectedReport.location && selectedReport.location.coordinates && Array.isArray(selectedReport.location.coordinates)) {
        geoLocation = {
          type: 'Point',
          coordinates: selectedReport.location.coordinates
        };
      } else if (selectedReport.location && selectedReport.location.lng && selectedReport.location.lat) {
        geoLocation = {
          type: 'Point',
          coordinates: [selectedReport.location.lng, selectedReport.location.lat]
        };
      }
      if (!geoLocation || !Array.isArray(geoLocation.coordinates) || geoLocation.coordinates.length !== 2 ||
          typeof geoLocation.coordinates[0] !== 'number' || typeof geoLocation.coordinates[1] !== 'number') {
        setEscalationError('Cannot escalate: This report does not have a valid location. Please ensure a location is set.');
        setEscalationLoading(false);
        return;
      }
      await axios.post('/api/emergencies', {
        report_id: selectedReport._id || selectedReport.id,
        reason: escalationReason,
        location: geoLocation,
        severity: selectedReport.severity,
        description: selectedReport.description,
        title: selectedReport.title,
        reporter_id: user?._id || user?.id,
        emergency_type: emergencyType,
      });
      setEscalationSuccess(true);
      // Refresh escalated IDs so the button disables immediately
      try {
        const result = await reportsService.getEscalatedReportIds();
        setEscalatedIds(result.escalated || []);
      } catch (e) {}
      setTimeout(() => {
        handleCloseEscalateDialog();
      }, 1200);
    } catch (err) {
      let msg = 'Failed to escalate. Please try again.';
      if (err.response && err.response.data && err.response.data.error) {
        msg = `Failed to escalate: ${err.response.data.error}`;
      }
      setEscalationError(msg);
    } finally {
      setEscalationLoading(false);
    }
  };

  // Helper to check if selected report has a valid location for escalation
  const isValidEscalationLocation = (report) => {
    if (!report) return false;
    if (report.location && Array.isArray(report.location.coordinates)) {
      const coords = report.location.coordinates;
      return coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number';
    }
    if (report.location && typeof report.location.lng === 'number' && typeof report.location.lat === 'number') {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search reports"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="severity">Severity</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
              >
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Report Button */}
      {userRole !== 'viewer' && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ mb: 2 }}
          >
            Add New Report
          </Button>
        </Box>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <List sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" textAlign="center" color="textSecondary" gutterBottom>
                {reports.length === 0 ? 'No reports submitted yet' : 'No reports match your filters'}
              </Typography>
              <Typography variant="body2" textAlign="center" color="textSecondary">
                {reports.length === 0 
                  ? 'Submit your first health report to get started. Use the "Add New Report" button above.'
                  : 'Try adjusting your search terms or filters to see more results.'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredReports.map((report) => (
            <Grid item xs={12} key={report._id || report.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" component="h3">
                          {report.title}
                        </Typography>
                        <Chip
                          label={report.severity}
                          color={getSeverityColor(report.severity)}
                          size="small"
                        />
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {report.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        {report.location && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="caption" color="textSecondary">
                              {typeof report.location === 'string' 
                                ? report.location 
                                : report.location.address?.city || report.location.landmark || 'Location specified'
                              }
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(report.createdAt || report.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
                        <IconButton
                          size="small"
                          onClick={() => handleView(report)}
                          color="primary"
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {userRole !== 'viewer' && (
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(report)}
                            color="primary"
                            title="Edit Report"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {['admin', 'doctor'].includes(userRole) && report.status !== 'resolved' && (
                          <IconButton
                            size="small"
                            onClick={() => handleResolve(report)}
                            color="success"
                            title="Mark as Resolved"
                          >
                            <Done />
                          </IconButton>
                        )}
                        {['admin', 'doctor'].includes(userRole) && report.status === 'resolved' && (
                          <IconButton
                            size="small"
                            onClick={() => handleUndo(report)}
                            color="warning"
                            title="Undo Resolution"
                          >
                            <Undo />
                          </IconButton>
                        )}
                        {['admin', 'doctor'].includes(userRole) && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(report)}
                            color="error"
                            title="Delete Report"
                          >
                            <Delete />
                          </IconButton>
                        )}
                        {/* Escalate to Emergency Care Button */}
                        <Tooltip title={report.escalated ? 'Already escalated' : 'Escalate to Emergency Care'}>
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleOpenEscalateDialog(report)}
                              startIcon={<Warning />}
                              disabled={!!report.escalated}
                            >
                              Escalate
                            </Button>
                          </span>
                        </Tooltip>
      {/* Emergency Escalation Dialog */}
      <Dialog
        open={escalateDialogOpen}
        onClose={handleCloseEscalateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="error" />
            Escalate to Emergency Care
          </Box>
        </DialogTitle>
        <DialogContent>
          {escalationSuccess ? (
            <Alert severity="success">Escalation submitted successfully!</Alert>
          ) : (
            <>
              <Typography gutterBottom>
                Please provide a reason/details for escalation. This will notify emergency care authorities.
              </Typography>
              <FormControl fullWidth margin="normal" disabled={escalationLoading}>
                <InputLabel>Emergency Type</InputLabel>
                <Select
                  value={emergencyType}
                  label="Emergency Type"
                  onChange={e => setEmergencyType(e.target.value)}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Infectious Disease">Infectious Disease</MenuItem>
                  <MenuItem value="Environmental">Environmental</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Reason for Escalation"
                value={escalationReason}
                onChange={e => setEscalationReason(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                disabled={escalationLoading}
                error={!!escalationError}
                helperText={escalationError}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEscalateDialog} disabled={escalationLoading}>Cancel</Button>
          {!escalationSuccess && (
            <span title={
              !isValidEscalationLocation(selectedReport)
                ? 'Cannot escalate: This report does not have a valid location. Please edit the report and set a location on the map.'
                : ''
            }>
              <Button
                variant="contained"
                color="error"
                onClick={handleSubmitEscalation}
                disabled={escalationLoading || !isValidEscalationLocation(selectedReport)}
              >
                {escalationLoading ? <CircularProgress size={22} /> : 'Escalate'}
              </Button>
            </span>
          )}
          {!isValidEscalationLocation(selectedReport) && !escalationSuccess && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Cannot escalate: This report does not have a valid location. Please edit the report and set a location on the map.<br/>
              <strong>Tip:</strong> Edit the report, pick a location on the map, and save before escalating.
            </Alert>
          )}
        </DialogActions>
      </Dialog>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Visibility color="primary" />
            Report Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedReport.title}
              </Typography>
              
              <Box display="flex" gap={2} mb={2}>
                <Chip
                  label={selectedReport.severity}
                  color={getSeverityColor(selectedReport.severity)}
                />
                <Chip
                  icon={getStatusIcon(selectedReport.status)}
                  label={selectedReport.status}
                  color={getStatusColor(selectedReport.status)}
                />
                {selectedReport.type && (
                  <Chip label={selectedReport.type} variant="outlined" />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={selectedReport.description}
                  />
                </ListItem>
                
                                 {selectedReport.symptoms && (
                   <ListItem>
                     <ListItemIcon>
                       <Warning />
                     </ListItemIcon>
                     <ListItemText
                       primary="Symptoms"
                       secondary={
                         Array.isArray(selectedReport.symptoms)
                           ? selectedReport.symptoms.map(symptom =>
                               typeof symptom === 'string'
                                 ? symptom
                                 : symptom.name || 'Unknown symptom'
                             ).join(', ')
                           : typeof selectedReport.symptoms === 'object' && selectedReport.symptoms !== null
                             ? selectedReport.symptoms.name || 'Unknown symptom'
                             : selectedReport.symptoms
                       }
                     />
                   </ListItem>
                 )}

                {selectedReport.location && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={
                        typeof selectedReport.location === 'string' 
                          ? selectedReport.location 
                          : selectedReport.location.address?.city || selectedReport.location.landmark || 'Location specified'
                      }
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={format(new Date(selectedReport.createdAt || selectedReport.date), 'PPP p')}
                  />
                </ListItem>

                {selectedReport.updatedAt && selectedReport.updatedAt !== selectedReport.createdAt && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={format(new Date(selectedReport.updatedAt), 'PPP p')}
                    />
                  </ListItem>
                )}

                {(selectedReport.numberOfPeopleAffected || selectedReport.affectedPopulation?.count) && (
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="People Affected"
                      secondary={selectedReport.numberOfPeopleAffected || selectedReport.affectedPopulation?.count || 'Not specified'}
                    />
                  </ListItem>
                )}

                {selectedReport.communityImpact && (
                  <ListItem>
                    <ListItemIcon>
                      <Category />
                    </ListItemIcon>
                    <ListItemText
                      primary="Community Impact"
                      secondary={selectedReport.communityImpact}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          {userRole !== 'viewer' && (
            <Button
              onClick={() => {
                handleCloseViewDialog();
                handleEdit(selectedReport);
              }}
              variant="contained"
              startIcon={<Edit />}
            >
              Edit Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit color="primary" />
            Edit Report
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={selectedReport.title || ''}
                    onChange={(e) => setSelectedReport({...selectedReport, title: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={selectedReport.description || ''}
                    onChange={(e) => setSelectedReport({...selectedReport, description: e.target.value})}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={selectedReport.severity || 'low'}
                      onChange={(e) => setSelectedReport({...selectedReport, severity: e.target.value})}
                      label="Severity"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedReport.status || 'pending'}
                      onChange={(e) => setSelectedReport({...selectedReport, status: e.target.value})}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={
                      typeof selectedReport.location === 'string' 
                        ? selectedReport.location 
                        : selectedReport.location?.address?.city || selectedReport.location?.landmark || ''
                    }
                    onChange={(e) => setSelectedReport({...selectedReport, location: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                                 {selectedReport.symptoms && (
                   <Grid item xs={12}>
                     <TextField
                       fullWidth
                       label="Symptoms"
                       value={
                         Array.isArray(selectedReport.symptoms)
                           ? selectedReport.symptoms.map(symptom =>
                               typeof symptom === 'string'
                                 ? symptom
                                 : symptom.name || 'Unknown symptom'
                           ).join(', ')
                         : typeof selectedReport.symptoms === 'object' && selectedReport.symptoms !== null
                           ? selectedReport.symptoms.name || 'Unknown symptom'
                           : selectedReport.symptoms || ''
                       }
                       onChange={(e) => setSelectedReport({...selectedReport, symptoms: e.target.value})}
                       margin="normal"
                       multiline
                       rows={2}
                     />
                   </Grid>
                 )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (onEdit) {
                onEdit(selectedReport);
              }
              handleCloseEditDialog();
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default ReportsList;
