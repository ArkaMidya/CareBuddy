import React, { useState } from 'react';
import MapPicker from '../common/MapPicker';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  alpha,
  Divider,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel
} from '@mui/material';
import { 
  LocalHospital, 
  Description, 
  LocationOn, 
  CheckCircle,
  Coronavirus,
  Psychology,
  Emergency,
  Warning,
  Public,
  Group
} from '@mui/icons-material';

const steps = [
  { label: 'Report Type & Priority', icon: <LocalHospital /> },
  { label: 'Health Details', icon: <Description /> },
  { label: 'Location & Community Impact', icon: <LocationOn /> },
  { label: 'Review & Submit', icon: <CheckCircle /> }
];

const healthTypes = [
  'General Checkup',
  'Emergency',
  'Chronic Condition',
  'Injury',
  'Mental Health',
  'Preventive Care',
  'Disease Outbreak',
  'Environmental Health',
  'Community Health Issue',
  'Other'
];

const severityLevels = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

const communityImpactLevels = [
  'Individual',
  'Family',
  'Neighborhood',
  'City/Region',
  'State/Province',
  'National'
];

const outbreakTypes = [
  'Influenza',
  'COVID-19',
  'Foodborne Illness',
  'Waterborne Disease',
  'Vector-borne Disease',
  'Other Infectious Disease'
];

const mentalHealthCrisisTypes = [
  'Suicidal Thoughts',
  'Severe Depression',
  'Anxiety Attack',
  'Psychotic Episode',
  'Substance Abuse Crisis',
  'Domestic Violence',
  'Other Mental Health Emergency'
];

const environmentalHealthIssues = [
  'Air Quality',
  'Water Contamination',
  'Chemical Exposure',
  'Radiation',
  'Noise Pollution',
  'Climate-related Health',
  'Other Environmental Issue'
];

const ReportForm = ({ onSubmit }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    severity: '',
    description: '',
    symptoms: '',
    medications: '',
    allergies: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    emergencyContact: '',
    // Community health specific fields
    isCommunityHealth: false,
    communityImpact: '',
    outbreakType: '',
    mentalHealthCrisisType: '',
    environmentalIssueType: '',
    numberOfPeopleAffected: '',
    isAnonymous: false,
    requiresImmediateResponse: false,
    publicHealthRisk: false,
    symptomsOnset: '',
    exposureDetails: '',
    preventiveMeasures: '',
    coordinates: null // { lat, lng }
  });
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleNext = () => {
    setSubmitAttempted(true);
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setSubmitAttempted(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMapLocation = (coords) => {
      console.log('ReportForm: handleMapLocation coords =', coords);
      console.log('ReportForm: formData.coordinates before =', formData.coordinates);
    setFormData(prev => ({ ...prev, coordinates: coords }));
      setTimeout(() => {
        console.log('ReportForm: formData.coordinates after =', coords);
      }, 100);
    if (errors.coordinates) {
      setErrors(prev => ({ ...prev, coordinates: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.type) newErrors.type = 'Health type is required';
        if (!formData.severity) newErrors.severity = 'Severity level is required';
        if (formData.publicHealthRisk) {
          if (!formData.communityImpact) newErrors.communityImpact = 'Community impact area is required';
          if (!formData.numberOfPeopleAffected || isNaN(Number(formData.numberOfPeopleAffected)) || Number(formData.numberOfPeopleAffected) <= 0) {
            newErrors.numberOfPeopleAffected = 'Number of people affected is required and must be greater than 0';
          }
        }
        break;
      case 1:
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.isCommunityHealth && !formData.communityImpact) {
          newErrors.communityImpact = 'Community impact level is required';
        }
        break;
      case 2:
  if (!formData.location.trim()) newErrors.location = 'Location is required';
  if (!formData.coordinates || !formData.coordinates.lat || !formData.coordinates.lng) {
    newErrors.coordinates = 'Please select a location on the map. You must pick a location to submit a report.';
  }
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (validateStep(activeStep)) {
      // Transform form data to match backend schema
      const report = {
        type: mapHealthTypeToBackend(formData.type),
        severity: mapSeverityToBackend(formData.severity),
        title: formData.title,
        description: formData.description || formData.symptoms || 'Health report submitted',
        location: {
          type: (formData.coordinates && formData.coordinates.lng && formData.coordinates.lat) ? 'Point' : undefined,
          coordinates: (formData.coordinates && formData.coordinates.lng && formData.coordinates.lat)
            ? [formData.coordinates.lng, formData.coordinates.lat]
            : undefined,
          address: {
            street: formData.address || '',
            city: formData.city || '',
            state: formData.state || '',
            country: 'US', // Default country
            zipCode: formData.zipCode || ''
          },
          landmark: (formData.location && formData.location.landmark) || formData.location || ''
        },
        urgency: formData.requiresImmediateResponse ? 'emergency' : 'routine',
        status: 'pending',
        priority: mapSeverityToPriority(formData.severity),
        symptoms: formData.symptoms ? [{
          name: formData.symptoms,
          severity: 'moderate',
          duration: 'Unknown'
        }] : [],
        suspectedCause: 'unknown',
        affectedPopulation: {
          count: parseInt(formData.numberOfPeopleAffected) || 1,
          ageGroups: ['adult'],
          demographics: {
            gender: { male: 0, female: 0, other: 0 },
            socioeconomicStatus: 'middle'
          }
        }
      };
      onSubmit(report);
      // Reset form
      setFormData({
        title: '',
        type: '',
        severity: '',
        description: '',
        symptoms: '',
        medications: '',
        allergies: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPhone: '',
        emergencyContact: '',
        isCommunityHealth: false,
        communityImpact: '',
        outbreakType: '',
        mentalHealthCrisisType: '',
        environmentalIssueType: '',
        numberOfPeopleAffected: '',
        isAnonymous: false,
        requiresImmediateResponse: false,
        publicHealthRisk: false,
        symptomsOnset: '',
        exposureDetails: '',
        preventiveMeasures: ''
      });
      setActiveStep(0);
      setErrors({});
      setSubmitAttempted(false);
    }
  };

  // Helper functions to map form values to backend schema
  const mapHealthTypeToBackend = (formType) => {
    const typeMap = {
      'General Checkup': 'other',
      'Emergency': 'injury',
      'Chronic Condition': 'illness',
      'Injury': 'injury',
      'Mental Health': 'mental_health_crisis',
      'Preventive Care': 'other',
      'Disease Outbreak': 'outbreak',
      'Environmental Health': 'environmental_hazard',
      'Community Health Issue': 'other',
      'Other': 'other'
    };
    return typeMap[formType] || 'other';
  };

  const mapSeverityToBackend = (formSeverity) => {
    const severityMap = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high',
      'Critical': 'critical'
    };
    return severityMap[formSeverity] || 'medium';
  };

  const mapSeverityToPriority = (formSeverity) => {
    const priorityMap = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high',
      'Critical': 'critical'
    };
    return priorityMap[formSeverity] || 'medium';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Report Type & Priority
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Select the type of health report and its priority level. Community health issues will be routed to appropriate public health authorities.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., Flu Outbreak in Downtown, Mental Health Crisis, Water Contamination"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Health Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Health Type"
                >
                  {healthTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.severity}>
                <InputLabel>Severity Level</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  label="Severity Level"
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
                {errors.severity && <Typography color="error" variant="caption">{errors.severity}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.publicHealthRisk}
                    onChange={(e) => handleInputChange('publicHealthRisk', e.target.checked)}
                  />
                }
                label="This poses a public health risk requiring immediate attention (Community Alert)"
              />
            </Grid>
            {formData.publicHealthRisk && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.communityImpact}>
                    <InputLabel>Community Impact Area</InputLabel>
                    <Select
                      value={formData.communityImpact}
                      onChange={(e) => handleInputChange('communityImpact', e.target.value)}
                      label="Community Impact Area"
                    >
                      {communityImpactLevels.map((level) => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </Select>
                    {errors.communityImpact && <Typography color="error" variant="caption">{errors.communityImpact}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of People Affected"
                    type="number"
                    value={formData.numberOfPeopleAffected}
                    onChange={(e) => handleInputChange('numberOfPeopleAffected', e.target.value)}
                    error={!!errors.numberOfPeopleAffected}
                    helperText={errors.numberOfPeopleAffected}
                    placeholder="e.g., 25, 100+"
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Health Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description || "Describe the health concern, symptoms, or situation in detail"}
                placeholder="Please provide a detailed description of the health concern..."
              />
            </Grid>

            {formData.isCommunityHealth && (
              <>
                {formData.type === 'Disease Outbreak' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Outbreak Type</InputLabel>
                      <Select
                        value={formData.outbreakType}
                        onChange={(e) => handleInputChange('outbreakType', e.target.value)}
                        label="Outbreak Type"
                      >
                        {outbreakTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {formData.type === 'Mental Health' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Mental Health Crisis Type</InputLabel>
                      <Select
                        value={formData.mentalHealthCrisisType}
                        onChange={(e) => handleInputChange('mentalHealthCrisisType', e.target.value)}
                        label="Mental Health Crisis Type"
                      >
                        {mentalHealthCrisisTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {formData.type === 'Environmental Health' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Environmental Issue Type</InputLabel>
                      <Select
                        value={formData.environmentalIssueType}
                        onChange={(e) => handleInputChange('environmentalIssueType', e.target.value)}
                        label="Environmental Issue Type"
                      >
                        {environmentalHealthIssues.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Symptoms Onset"
                    value={formData.symptomsOnset}
                    onChange={(e) => handleInputChange('symptomsOnset', e.target.value)}
                    placeholder="When did symptoms first appear?"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Exposure Details"
                    value={formData.exposureDetails}
                    onChange={(e) => handleInputChange('exposureDetails', e.target.value)}
                    placeholder="Describe how people were exposed (if known)..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Preventive Measures Taken"
                    value={formData.preventiveMeasures}
                    onChange={(e) => handleInputChange('preventiveMeasures', e.target.value)}
                    placeholder="What preventive measures have been implemented?"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Symptoms"
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="List any symptoms being experienced..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Medications"
                value={formData.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                placeholder="List any medications being taken..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any known allergies..."
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location & Community Impact
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={!!errors.location}
                helperText={errors.location || "e.g., Hospital name, Clinic, Community center, Neighborhood"}
                placeholder="Where did this health event occur?"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          handleMapLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        },
                        (err) => {
                          alert('Unable to fetch current location. Please allow location access.');
                        }
                      );
                    } else {
                      alert('Geolocation is not supported by your browser.');
                    }
                  }}
                >
                  Use Current Location
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Or pick a location on the map (required)
                </Typography>
              </Box>
              <MapPicker
                value={formData.coordinates}
                onChange={handleMapLocation}
                error={!!errors.coordinates}
              />
              {errors.coordinates && (
                <Typography color="error" variant="caption" sx={{ fontWeight: 600 }}>
                  {errors.coordinates}
                </Typography>
              )}
              {!formData.coordinates && submitAttempted && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Please select a location on the map to continue. Location is required for all health reports.
                </Alert>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address..."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Your contact number..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact person..."
              />
            </Grid>
            {formData.isCommunityHealth && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Community Health Reporting Options
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isAnonymous}
                        onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                      />
                    }
                    label="Submit anonymously (recommended for community reports)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.requiresImmediateResponse}
                        onChange={(e) => handleInputChange('requiresImmediateResponse', e.target.checked)}
                      />
                    }
                    label="Requires immediate public health response"
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Report
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all information before submitting. Community health reports will be automatically routed to appropriate public health authorities.
            </Alert>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1">{formData.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{formData.type}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Severity</Typography>
                  <Typography variant="body1">{formData.severity}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{formData.location}</Typography>
                </Grid>
                
                {formData.isCommunityHealth && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Community Impact</Typography>
                      <Typography variant="body1">{formData.communityImpact}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">People Affected</Typography>
                      <Typography variant="body1">{formData.numberOfPeopleAffected || 'Not specified'}</Typography>
                    </Grid>
                    {formData.outbreakType && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Outbreak Type</Typography>
                        <Typography variant="body1">{formData.outbreakType}</Typography>
                      </Grid>
                    )}
                    {formData.mentalHealthCrisisType && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Crisis Type</Typography>
                        <Typography variant="body1">{formData.mentalHealthCrisisType}</Typography>
                      </Grid>
                    )}
                    {formData.environmentalIssueType && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">Environmental Issue</Typography>
                        <Typography variant="body1">{formData.environmentalIssueType}</Typography>
                      </Grid>
                    )}
                  </>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{formData.description}</Typography>
                </Grid>
                
                {formData.symptoms && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Symptoms</Typography>
                    <Typography variant="body1">
                      {Array.isArray(formData.symptoms)
                        ? formData.symptoms.map(symptom =>
                            typeof symptom === 'string'
                              ? symptom
                              : symptom.name || 'Unknown symptom'
                          ).join(', ')
                        : formData.symptoms}
                    </Typography>
                  </Grid>
                )}
                
                {formData.isCommunityHealth && (
                  <>
                    {formData.exposureDetails && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Exposure Details</Typography>
                        <Typography variant="body1">{formData.exposureDetails}</Typography>
                      </Grid>
                    )}
                    {formData.preventiveMeasures && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Preventive Measures</Typography>
                        <Typography variant="body1">{formData.preventiveMeasures}</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>

            {formData.isCommunityHealth && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Community Health Report:</strong> This report will be automatically routed to public health authorities 
                  and may trigger immediate response protocols. Your privacy will be protected.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 4,
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, 0.9)
      }}
    >
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              StepIconComponent={() => step.icon}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mt: 2, mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: theme.palette.primary.main,
                '&:hover': {
                  background: theme.palette.primary.dark
                }
              }}
            >
              Submit Report
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                background: theme.palette.primary.main,
                '&:hover': {
                  background: theme.palette.primary.dark
                }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReportForm;
