import React, { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Report,
  LocationOn,
  Add,
  Close,
  Person,
  Email,
  Phone,
  Business,
  HealthAndSafety,
  Navigation,
  Warning,
  MonitorHeart,
  Favorite,
  Shield,
  Search,
  Map,
  Eye,
  Edit3,
  CheckCircle,
  Error,
  Info,
  TrendingUp,
  LocalHospital,
  Public,
  Medication,
  Dashboard,
  MyLocation,
  AccessTime,
  PriorityHigh,
} from '@mui/icons-material';
import reportService from '../services/reportService';
import MapPicker from '../components/common/MapPicker';

const ReportsPage = () => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({ 
    type: '', 
    severity: '', 
    status: '', 
    search: ''
  });
  const [openNew, setOpenNew] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [newReport, setNewReport] = useState({
    type: 'illness',
    severity: 'medium',
    title: '',
    description: '',
    symptoms: [],
    affectedCount: 1,
    location: { 
      name: '', 
      lat: null, 
      lng: null,
      address: '',
      city: '',
      state: '',
      country: ''
    },
    reporter: {
      name: '',
      phone: '',
      email: '',
      isHealthWorker: false,
      organization: ''
    }
  });
  const [createErrors, setCreateErrors] = useState({});
  const [symptomInput, setSymptomInput] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const healthTypes = [
    { value: 'illness', label: 'Illness', icon: MonitorHeart, color: 'primary' },
    { value: 'outbreak', label: 'Outbreak', icon: Warning, color: 'error' },
    { value: 'mental_health', label: 'Mental Health', icon: Favorite, color: 'secondary' },
    { value: 'emergency', label: 'Emergency', icon: Shield, color: 'warning' },
    { value: 'injury', label: 'Injury', icon: LocalHospital, color: 'info' },
    { value: 'environmental_hazard', label: 'Environmental', icon: Public, color: 'success' },
    { value: 'medication_shortage', label: 'Medication', icon: Medication, color: 'error' },
    { value: 'other', label: 'Other', icon: Info, color: 'default' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'success', icon: CheckCircle },
    { value: 'medium', label: 'Medium', color: 'warning', icon: Warning },
    { value: 'high', label: 'High', color: 'error', icon: Error },
    { value: 'critical', label: 'Critical', color: 'error', icon: PriorityHigh }
  ];

  const commonSymptoms = [
    'Fever', 'Cough', 'Fatigue', 'Headache', 'Body aches', 'Sore throat',
    'Loss of taste/smell', 'Shortness of breath', 'Nausea', 'Diarrhea',
    'Anxiety', 'Depression', 'Insomnia', 'Panic attacks', 'Mood swings'
  ];

  const steps = [
    'Report Type & Severity',
    'Symptoms & Description',
    'Location & Contact'
  ];

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await reportService.list(filters, token);
      setReports(data?.data?.reports || []);
    } catch (e) {
      console.error('Error fetching reports:', e);
      setSnackbar({ open: true, message: 'Failed to fetch reports', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reports, filters]);

  const applyFiltersAndSort = () => {
    let filtered = [...reports];

    if (filters.type) {
      filtered = filtered.filter(report => report.type === filters.type);
    }
    if (filters.severity) {
      filtered = filtered.filter(report => report.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm) ||
        report.description?.toLowerCase().includes(searchTerm) ||
        report.location?.name?.toLowerCase().includes(searchTerm) ||
        report.reporter?.name?.toLowerCase().includes(searchTerm) ||
        report.symptoms?.some(symptom => symptom.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredReports(filtered);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: 'Geolocation not supported by your browser', severity: 'error' });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.address) {
            const address = data.address;
            setNewReport(prev => ({
              ...prev,
              location: {
                ...prev.location,
                lat: latitude,
                lng: longitude,
                name: data.display_name,
                address: data.display_name,
                city: address.city || address.town || address.village || '',
                state: address.state || '',
                country: address.country || ''
              }
            }));
          } else {
            setNewReport(prev => ({
              ...prev,
              location: {
                ...prev.location,
                lat: latitude,
                lng: longitude,
                name: 'My Current Location'
              }
            }));
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setNewReport(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              lng: longitude,
              name: 'My Current Location'
            }
          }));
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        setSnackbar({ open: true, message: 'Unable to get your current location. Please try again or enter manually.', severity: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, address } = data[0];
        setNewReport(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            name: data[0].display_name,
            address: data[0].display_name,
            city: address?.city || address?.town || address?.village || '',
            state: address?.state || '',
            country: address?.country || ''
          }
        }));
        setSearchLocation('');
        setShowLocationModal(false);
        setSnackbar({ open: true, message: 'Location found and set!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Location not found. Please try a different search term.', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSnackbar({ open: true, message: 'Error searching location. Please try again.', severity: 'error' });
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim() && !newReport.symptoms.includes(symptomInput.trim())) {
      setNewReport(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom) => {
    setNewReport(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const addCommonSymptom = (symptom) => {
    if (!newReport.symptoms.includes(symptom)) {
      setNewReport(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
  };

  const handleNext = () => {
    setCurrentStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreate = async () => {
    const errs = {};
    if (!newReport.title) errs.title = 'Title is required';
    if (!newReport.description) errs.description = 'Description is required';
    if (!newReport.location || !newReport.location.lat || !newReport.location.lng) errs.location = 'Location is required';
    if (!newReport.reporter.name) errs.reporterName = 'Reporter name is required';
    if (!newReport.reporter.email) errs.reporterEmail = 'Reporter email is required';
    
    setCreateErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      await reportService.create(newReport, token);
      setOpenNew(false);
      setCurrentStep(0);
      setNewReport({
        type: 'illness',
        severity: 'medium',
        title: '',
        description: '',
        symptoms: [],
        affectedCount: 1,
        location: { name: '', lat: null, lng: null, address: '', city: '', state: '', country: '' },
        reporter: { name: '', phone: '', email: '', isHealthWorker: false, organization: '' }
      });
      setCreateErrors({});
      setSymptomInput('');
      fetchReports();
      setSnackbar({ open: true, message: 'Report submitted successfully!', severity: 'success' });
    } catch (e) {
      console.error('Create report error', e);
      const msg = e.response?.data?.message || 'Failed to create report';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const severityMap = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return severityMap[severity] || 'default';
  };

  const getTypeIcon = (type) => {
    const typeMap = {
      illness: MonitorHeart,
      outbreak: Warning,
      mental_health: Favorite,
      emergency: Shield,
      injury: LocalHospital,
      environmental_hazard: Public,
      medication_shortage: Medication,
      other: Info
    };
    return typeMap[type] || Info;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      new: 'info',
      in_progress: 'warning',
      needs_attention: 'error',
      resolved: 'success'
    };
    return statusMap[status] || 'default';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Select Report Type and Severity
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Health Issue Type
                </Typography>
                <Grid container spacing={2}>
                  {healthTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <Grid item xs={6} key={type.value}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: newReport.type === type.value ? '2px solid' : '1px solid',
                            borderColor: newReport.type === type.value ? 'primary.main' : 'divider',
                            bgcolor: newReport.type === type.value ? 'primary.50' : 'background.paper',
                            '&:hover': { bgcolor: 'primary.50' }
                          }}
                          onClick={() => setNewReport(prev => ({ ...prev, type: type.value }))}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <IconComponent sx={{ fontSize: 32, color: `${type.color}.main`, mb: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {type.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Severity Level
                </Typography>
                <Grid container spacing={2}>
                  {severityLevels.map((severity) => {
                    const IconComponent = severity.icon;
                    return (
                      <Grid item xs={6} key={severity.value}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: newReport.severity === severity.value ? '2px solid' : '1px solid',
                            borderColor: newReport.severity === severity.value ? `${severity.color}.main` : 'divider',
                            bgcolor: newReport.severity === severity.value ? `${severity.color}.50` : 'background.paper',
                            '&:hover': { bgcolor: `${severity.color}.50` }
                          }}
                          onClick={() => setNewReport(prev => ({ ...prev, severity: severity.value }))}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <IconComponent sx={{ fontSize: 32, color: `${severity.color}.main`, mb: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {severity.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Report Title"
                  fullWidth
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  error={!!createErrors.title}
                  helperText={createErrors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Report color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Number of People Affected"
                  type="number"
                  fullWidth
                  value={newReport.affectedCount}
                  onChange={(e) => setNewReport(prev => ({ ...prev, affectedCount: parseInt(e.target.value) || 1 }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Describe Symptoms and Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Detailed Description"
                  fullWidth
                  multiline
                  minRows={4}
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  error={!!createErrors.description}
                  helperText={createErrors.description}
                  placeholder="Please describe the health issue in detail..."
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Symptoms
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Add Symptom"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HealthAndSafety color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button variant="contained" onClick={addSymptom}>
                    Add
                  </Button>
                </Box>
                
                {newReport.symptoms.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {newReport.symptoms.map((symptom, index) => (
                      <Chip
                        key={index}
                        label={symptom}
                        onDelete={() => removeSymptom(symptom)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Common symptoms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {commonSymptoms.map((symptom) => (
                    <Chip
                      key={symptom}
                      label={symptom}
                      onClick={() => addCommonSymptom(symptom)}
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.50' } }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Location and Contact Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Location
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleUseMyLocation}
                    disabled={isLoadingLocation}
                    startIcon={isLoadingLocation ? <CircularProgress size={20} /> : <MyLocation />}
                    sx={{ flex: 1 }}
                  >
                    {isLoadingLocation ? 'Getting Location...' : 'Use My Current Location'}
                  </Button>
                                     <Button
                     variant="outlined"
                     onClick={() => setShowLocationModal(true)}
                     startIcon={<LocationOn />}
                     sx={{ flex: 1 }}
                   >
                     Search Location
                   </Button>
                </Box>

                {newReport.location.lat && newReport.location.lng && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Location set:</strong> {newReport.location.name || 
                        `${newReport.location.lat.toFixed(4)}, ${newReport.location.lng.toFixed(4)}`}
                    </Typography>
                  </Alert>
                )}

                <MapPicker 
                  value={{ lat: newReport.location.lat, lng: newReport.location.lng }} 
                  onChange={(loc) => setNewReport(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, lat: loc.lat, lng: loc.lng } 
                  }))} 
                />
                {createErrors.location && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {createErrors.location}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Reporter Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={newReport.reporter.name}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        reporter: { ...prev.reporter, name: e.target.value }
                      }))}
                      error={!!createErrors.reporterName}
                      helperText={createErrors.reporterName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={newReport.reporter.email}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        reporter: { ...prev.reporter, email: e.target.value }
                      }))}
                      error={!!createErrors.reporterEmail}
                      helperText={createErrors.reporterEmail}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={newReport.reporter.phone}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        reporter: { ...prev.reporter, phone: e.target.value }
                      }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Organization (Optional)"
                      fullWidth
                      value={newReport.reporter.organization || ''}
                      onChange={(e) => setNewReport(prev => ({
                        ...prev,
                        reporter: { ...prev.reporter, organization: e.target.value }
                      }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newReport.reporter.isHealthWorker}
                          onChange={(e) => setNewReport(prev => ({
                            ...prev,
                            reporter: { ...prev.reporter, isHealthWorker: e.target.checked }
                          }))}
                        />
                      }
                      label="I am a healthcare worker"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        py: 3,
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
          opacity: 0.05,
          zIndex: 0,
        },
      }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          Health Reports Dashboard
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4 }}>
          Enhanced Reports Page Coming Soon - Based on Map Folder Components
        </Typography>
      </Box>
    </Container>
  );
};

export default ReportsPage;
