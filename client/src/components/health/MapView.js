
import React, { useState, useEffect, useRef } from 'react';
import LeafletMap from './LeafletMap';
import {
  Box, Paper, Typography, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, useTheme, alpha, IconButton, Tooltip, Alert, Divider, Card, CardContent, Button
} from '@mui/material';
import { Add, Edit, Delete, Info, Refresh, LocationOn } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { canManageHealthReports, canDeleteHealthReports, canResolveHealthReports, canEditHealthReports, getRoleDisplayName } from '../../utils/permissions';

const MapView = ({ reports = [], onReportUpdate, onReportDelete, onOpenReportForm, onRefresh }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const [selectedReport, setSelectedReport] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    // Debug: log reports and their categories
    useEffect(() => {
      console.log('MapView reports:', reports);
      if (reports.length) {
        console.log('Report categories:', reports.map(r => r.category));
      }
    }, [reports]);

  // ...existing code...

  const mapRef = useRef(null);
  const healthCategories = [
      { value: 'illness', label: 'General Illness', icon: <Info />, color: 'primary' },
      { value: 'outbreak', label: 'Disease Outbreak', icon: <Info />, color: 'error' },
      { value: 'mental_health', label: 'Mental Health Crisis', icon: <Info />, color: 'warning' },
      { value: 'emergency', label: 'Medical Emergency', icon: <Info />, color: 'error' },
      { value: 'environmental', label: 'Environmental Health', icon: <Info />, color: 'warning' }
    ];

    const getCategoryIcon = (category) => {
      const found = healthCategories.find(cat => cat.value === category);
      return found ? found.icon : <Info />;
    };

    const getCategoryColor = (category) => {
      const found = healthCategories.find(cat => cat.value === category);
      return found ? found.color : 'primary';
    };

    const getSeverityColor = (severity) => {
      switch (severity?.toLowerCase()) {
        case 'critical': return 'error';
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'primary';
      }
    };

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {}
        );
      }
    }, []);

    const handleReportClick = (report) => setSelectedReport(report);
    const handleCloseDialog = () => setSelectedReport(null);

    const filteredReports = reports.filter(report => {
      const matchesSearch =
        (report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.city?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || report.type === filterType;
      const notResolved = !['solved', 'resolved', 'closed'].includes((report.status || '').toLowerCase());
      return matchesSearch && matchesType && notResolved;
    });

    useEffect(() => {
      console.log('MapView filterType:', filterType);
      console.log('MapView filteredReports:', filteredReports);
    }, [filterType, filteredReports]);

    const renderReportDetails = (report) => (
      <Dialog open={!!selectedReport} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getCategoryIcon(report.category)}
            <Typography variant="h6">{report.title}</Typography>
            <Chip label={report.severity} color={getSeverityColor(report.severity)} size="small" sx={{ ml: 'auto' }} />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>{report.description || 'No description provided'}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Category</Typography>
              <Chip label={healthCategories.find(cat => cat.value === report.category)?.label || 'Unknown'} color={getCategoryColor(report.category)} icon={getCategoryIcon(report.category)} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Location</Typography>
              <Typography variant="body1" paragraph>{report.city}, {report.state} {report.zipCode}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Reported</Typography>
              <Typography variant="body1" paragraph>{new Date(report.createdAt).toLocaleString()}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Status</Typography>
              <Chip label={report.status || 'Pending'} color={report.status === 'Resolved' ? 'success' : 'warning'} size="small" />
            </Grid>
          </Grid>
          {report.symptoms && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Symptoms</Typography>
              <Typography variant="body1">
                {Array.isArray(report.symptoms)
                  ? report.symptoms.map(symptom => typeof symptom === 'string' ? symptom : symptom && typeof symptom === 'object' && symptom.name ? symptom.name : 'Unknown symptom').join(', ')
                  : typeof report.symptoms === 'object' && report.symptoms !== null
                    ? report.symptoms.name || 'Unknown symptom'
                    : report.symptoms}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {canEditHealthReports(user) && (
            <Button variant="outlined" startIcon={<Edit />} onClick={handleCloseDialog}>Edit Report</Button>
          )}
          {canDeleteHealthReports(user) && (
            <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => { if (onReportDelete && report.id) { onReportDelete(report.id); } handleCloseDialog(); }}>Delete Report</Button>
          )}
        </DialogActions>
      </Dialog>
    );

    const renderCommunityStats = () => (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {healthCategories.map((category) => {
          const count = reports.filter(r => r.type === category.value).length;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={category.value}>
              <Card sx={{
                height: '100%',
                background: alpha(theme.palette[category.color].light, 0.1),
                border: `1px solid ${alpha(theme.palette[category.color].main, 0.2)}`
              }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: alpha(theme.palette[category.color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1,
                    color: theme.palette[category.color].main
                  }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette[category.color].main}>
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Community Health Map
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time visualization of community health reports, outbreaks, and medical emergencies
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<Add />} sx={{ px: 3 }} onClick={onOpenReportForm}>
              Report Health Issue
            </Button>
            {user && (
              <Chip label={`Role: ${getRoleDisplayName(user.role)}`} color={canDeleteHealthReports(user) ? 'success' : 'default'} variant="outlined" icon={<Info />} />
            )}
            <Tooltip title="Refresh Map">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Community Health Statistics */}
        {renderCommunityStats()}

        {/* Map Controls */}
        <Paper sx={{ p: 2, mb: 3, background: alpha(theme.palette.background.paper, 0.9) }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search reports by location, symptoms, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <LocationOn sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter by Type"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {healthCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.icon}
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${filteredReports.length} reports visible`} color="primary" variant="outlined" icon={<Info />} />
                {userLocation && (
                  <Chip 
                    label="Location enabled" 
                    color="success" 
                    variant="outlined" 
                    icon={<LocationOn />} 
                    clickable
                    onClick={() => {
                      if (userLocation && mapRef.current && mapRef.current.setView) {
                        mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
                      }
                    }}
                  />
                )}
                <Chip 
                  label="Real-time updates" 
                  color="info" 
                  variant="outlined" 
                  icon={<Refresh />} 
                  clickable
                  onClick={onRefresh}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Map Area */}
        <Box sx={{ height: 400, width: '100%', my: 2 }}>
          <LeafletMap
            ref={mapRef}
            reports={filteredReports}
            center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
            zoom={userLocation ? 10 : 5}
            onMarkerClick={handleReportClick}
          />
        </Box>

        {/* Report Details Dialog */}
        {selectedReport && renderReportDetails(selectedReport)}

        {/* Community Health Alert */}
        <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
          <Typography variant="body2">
            <strong>Community Health Reporting:</strong> This map shows real-time health reports from community members and healthcare workers. 
            Report urgent health issues, disease outbreaks, or mental health crises to help protect your community. 
            All reports are anonymous and help public health officials identify and respond to emerging health threats.
          </Typography>
        </Alert>
      </Box>
    );
  };

export default MapView;
