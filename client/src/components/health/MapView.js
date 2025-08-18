import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Stack,
  Badge
} from '@mui/material';
import {
  LocationOn,
  LocalHospital,
  Warning,
  Add,
  FilterList,
  Refresh,
  Info,
  ReportProblem,
  Psychology,
  Coronavirus,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  canManageHealthReports, 
  canDeleteHealthReports, 
  canResolveHealthReports, 
  canEditHealthReports,
  getRoleDisplayName 
} from '../../utils/permissions';


const MapView = ({ reports, onReportUpdate, onReportDelete }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [userLocation, setUserLocation] = useState(null);

  // Community health categories
  const healthCategories = [
    { value: 'illness', label: 'General Illness', icon: <LocalHospital />, color: 'primary' },
    { value: 'outbreak', label: 'Disease Outbreak', icon: <Coronavirus />, color: 'error' },
    { value: 'mental_health', label: 'Mental Health Crisis', icon: <Psychology />, color: 'warning' },
    { value: 'emergency', label: 'Medical Emergency', icon: <ReportProblem />, color: 'error' },
    { value: 'environmental', label: 'Environmental Health', icon: <Warning />, color: 'warning' }
  ];

  // Mock map data - in real implementation, this would integrate with Google Maps or similar
  const mockMapData = {
    reports: reports.map(report => ({
      ...report,
      position: {
        lat: (Math.random() - 0.5) * 0.1 + mapCenter.lat,
        lng: (Math.random() - 0.5) * 0.1 + mapCenter.lng
      },
      category: report.type || 'illness',
      severity: report.severity || 'medium',
      timestamp: new Date(report.createdAt || Date.now())
    }))
  };

  // Filter reports based on search and type
  const filteredReports = mockMapData.reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || report.category === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const handleAddReport = () => {
    setReportDialog(true);
  };

  const handleCloseDialog = () => {
    setReportDialog(false);
    setSelectedReport(null);
  };

  const getCategoryIcon = (category) => {
    const found = healthCategories.find(cat => cat.value === category);
    return found ? found.icon : <LocalHospital />;
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

  const renderMapArea = () => (
    <Paper 
      sx={{ 
        p: 3, 
        height: 400, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Mock Map Background */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: `repeating-linear-gradient(
          45deg,
          ${alpha(theme.palette.grey[200], 0.3)},
          ${alpha(theme.palette.grey[200], 0.3)} 10px,
          ${alpha(theme.palette.grey[100], 0.3)} 10px,
          ${alpha(theme.palette.grey[100], 0.3)} 20px
        )`
      }} />
      
      {/* User Location Indicator */}
      {userLocation && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}>
          <Box sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            border: `3px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[4]
          }} />
          <Typography variant="caption" sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 0.5,
            background: alpha(theme.palette.background.paper, 0.9),
            px: 1,
            borderRadius: 1
          }}>
            You are here
          </Typography>
        </Box>
      )}

      {/* Health Report Markers */}
      {filteredReports.map((report, index) => (
        <Box
          key={report.id || index}
          sx={{
            position: 'absolute',
            top: `${20 + (index % 5) * 60}px`,
            left: `${20 + (Math.floor(index / 5) * 80)}px`,
            cursor: 'pointer',
            zIndex: 5
          }}
          onClick={() => handleReportClick(report)}
        >
          <Tooltip title={`${report.title} - ${report.severity} severity`}>
            <Badge
              badgeContent={report.severity === 'critical' ? '!' : ''}
              color="error"
              invisible={report.severity !== 'critical'}
            >
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: alpha(theme.palette[getCategoryColor(report.category)].main, 0.9),
                border: `3px solid ${theme.palette.background.paper}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.background.paper,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}>
                {getCategoryIcon(report.category)}
              </Box>
            </Badge>
          </Tooltip>
        </Box>
      ))}

      {/* Map Legend */}
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        background: alpha(theme.palette.background.paper, 0.95),
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}>
        <Typography variant="subtitle2" gutterBottom>
          Map Legend
        </Typography>
        <Stack spacing={1}>
          {healthCategories.map((category) => (
            <Box key={category.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: theme.palette[category.color].main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {category.icon}
              </Box>
              <Typography variant="caption">
                {category.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );

  const renderReportDetails = (report) => (
    <Dialog open={!!selectedReport} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCategoryIcon(report.category)}
          <Typography variant="h6">
            {report.title}
          </Typography>
          <Chip 
            label={report.severity} 
            color={getSeverityColor(report.severity)}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {report.description || 'No description provided'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Category
            </Typography>
            <Chip 
              label={healthCategories.find(cat => cat.value === report.category)?.label || 'Unknown'}
              color={getCategoryColor(report.category)}
              icon={getCategoryIcon(report.category)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Location
            </Typography>
            <Typography variant="body1" paragraph>
              {report.city}, {report.state} {report.zipCode}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Reported
            </Typography>
            <Typography variant="body1" paragraph>
              {new Date(report.createdAt).toLocaleString()}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={report.status || 'Pending'} 
              color={report.status === 'Resolved' ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
        </Grid>
        
        {report.symptoms && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Symptoms
            </Typography>
            <Typography variant="body1">
              {report.symptoms}
            </Typography>
          </>
        )}
      </DialogContent>
             <DialogActions>
         <Button onClick={handleCloseDialog}>Close</Button>
         {canEditHealthReports(user) && (
           <Button 
             variant="outlined" 
             startIcon={<Edit />}
             onClick={() => {
               // Handle edit functionality
               handleCloseDialog();
             }}
           >
             Edit Report
           </Button>
         )}
         {canDeleteHealthReports(user) && (
           <Button 
             variant="outlined" 
             color="error"
             startIcon={<Delete />}
             onClick={() => {
               if (onReportDelete && report.id) {
                 onReportDelete(report.id);
               }
               handleCloseDialog();
             }}
           >
             Delete Report
           </Button>
         )}
       </DialogActions>
    </Dialog>
  );

  const renderCommunityStats = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {healthCategories.map((category) => {
        const count = filteredReports.filter(r => r.category === category.value).length;
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
           <Button
             variant="contained"
             startIcon={<Add />}
             onClick={handleAddReport}
             sx={{ px: 3 }}
           >
             Report Health Issue
           </Button>
           
           {user && (
             <Chip 
               label={`Role: ${getRoleDisplayName(user.role)}`}
               color={canDeleteHealthReports(user) ? 'success' : 'default'}
               variant="outlined"
               icon={<Info />}
             />
           )}
           
           <Tooltip title="Refresh Map">
             <IconButton size="small">
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
              <Chip 
                label={`${filteredReports.length} reports visible`}
                color="primary"
                variant="outlined"
                icon={<Info />}
              />
              {userLocation && (
                <Chip 
                  label="Location enabled"
                  color="success"
                  variant="outlined"
                  icon={<LocationOn />}
                />
              )}
              <Chip 
                label="Real-time updates"
                color="info"
                variant="outlined"
                icon={<Refresh />}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Map Area */}
      {renderMapArea()}

      {/* Report Details Dialog */}
      {selectedReport && renderReportDetails(selectedReport)}

      {/* Community Health Alert */}
      <Alert 
        severity="info" 
        sx={{ mt: 3 }}
        icon={<Info />}
      >
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
