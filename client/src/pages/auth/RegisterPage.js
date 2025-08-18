import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  useTheme,
  alpha,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RegisterPage = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    dateOfBirth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNo: '',
    organization: '',
    qualification: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const shouldShowHealthFields = () => {
    return ['health_worker', 'healthcare_provider'].includes(formData.role);
  };

  const shouldShowNGOFields = () => {
    return formData.role === 'ngo_worker';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode.replace(/\s/g, ''))) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    }
    
    // Role-specific validation
    if (['health_worker', 'healthcare_provider'].includes(formData.role)) {
      if (!formData.licenseNo.trim()) {
        newErrors.licenseNo = 'License number is required for health professionals';
      }
      if (!formData.organization.trim()) {
        newErrors.organization = 'Organization is required for health professionals';
      }
      if (!formData.qualification.trim()) {
        newErrors.qualification = 'Qualification is required for health professionals';
      }
    } else if (formData.role === 'ngo_worker') {
      if (!formData.qualification.trim()) {
        newErrors.qualification = 'Qualification is required for NGO workers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        licenseNo: formData.licenseNo.trim(),
        organization: formData.organization.trim(),
        qualification: formData.qualification.trim()
      });
      
      showSuccess('Registration successful! Please check your email to verify your account.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
        dateOfBirth: '',
        gender: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        licenseNo: '',
        organization: '',
        qualification: ''
      });
      setErrors({});
      
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.95)
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Create Account
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Join CareBody and start managing your health journey
          </Typography>
        </Box>

        {/* Registration Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                placeholder="Enter your first name"
                required
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                placeholder="Enter your last name"
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="Enter your email address"
                required
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="Enter your phone number"
                required
              />
            </Grid>

            {/* Role */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role} required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="health_worker">Health Worker</MenuItem>
                  <MenuItem value="healthcare_provider">Healthcare Provider</MenuItem>
                  <MenuItem value="ngo_worker">NGO Worker</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="user">General User</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender} required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Street Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
                placeholder="Enter your street address"
                required
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                placeholder="Enter your city"
                required
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                error={!!errors.state}
                helperText={errors.state}
                placeholder="Enter your state"
                required
              />
            </Grid>

            {/* ZIP Code */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => {
                  // Allow only digits and spaces
                  const value = e.target.value.replace(/[^\d\s]/g, '');
                  handleInputChange('zipCode', value);
                }}
                error={!!errors.zipCode}
                helperText={errors.zipCode || "Enter 6 digits (e.g., 123456)"}
                placeholder="123456"
                required
                inputProps={{
                  maxLength: 6
                }}
              />
            </Grid>

            {/* License Number - Only for Health Workers and Healthcare Providers */}
            {shouldShowHealthFields() && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={formData.licenseNo}
                  onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                  error={!!errors.licenseNo}
                  helperText={errors.licenseNo}
                  placeholder="Enter your professional license number"
                  required
                />
              </Grid>
            )}

            {/* Organization - Only for Health Workers and Healthcare Providers */}
            {shouldShowHealthFields() && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  error={!!errors.organization}
                  helperText={errors.organization}
                  placeholder="Enter your organization/hospital name"
                  required
                />
              </Grid>
            )}

            {/* Qualification - For Health Workers, Healthcare Providers, and NGO Workers */}
            {(shouldShowHealthFields() || shouldShowNGOFields()) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  error={!!errors.qualification}
                  helperText={errors.qualification}
                  placeholder="Enter your professional qualification/degree"
                  required
                />
              </Grid>
            )}

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password || "Password must be at least 8 characters long"}
                placeholder="Create a strong password (min 8 characters)"
                required
                InputProps={{
                  endAdornment: (
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                placeholder="Confirm your password"
                required
                InputProps={{
                  endAdornment: (
                    <Button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box sx={{ mt: 4 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
        </Divider>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Sign In Instead
          </Button>
        </Box>

        {/* Terms and Privacy Notice */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            By creating an account, you agree to our{' '}
            <Button
              component={RouterLink}
              to="/terms"
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none', textDecoration: 'underline' }}
              color="primary"
            >
              Terms of Service
            </Button>
            {' '}and{' '}
            <Button
              component={RouterLink}
              to="/privacy"
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none', textDecoration: 'underline' }}
              color="primary"
            >
              Privacy Policy
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
