import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  Avatar,
  Divider,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Person,
  Phone,
  Cake,
  Wc,
  LocationOn,
  Edit,
  Save,
  Cancel,
  Security,
  HealthAndSafety,
  Email,
  CalendarToday,
  Home,
  Business,
  Public,
  Pin,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, error: authError } = useAuth();
  const theme = useTheme();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0,10) : '',
    gender: user?.gender || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0,10) : '',
      gender: user?.gender || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      },
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    const payload = { ...form };
    try {
      const res = await updateProfile(payload);
      if (res.success) {
        setSaveSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setSaveError(res.error || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
        position: 'relative',
        // Only main page background image should exist, no extra background image for profile management div
      }}
    >
    <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                border: '4px solid white',
              }}
            >
              <HealthAndSafety sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
              }}
            >
              Profile Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Manage your personal information and healthcare preferences
            </Typography>
          </Box>
        </Fade>

        {/* Alerts */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {authError && (
            <Zoom in>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {authError}
              </Alert>
            </Zoom>
          )}
          {saveError && (
            <Zoom in>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {saveError}
              </Alert>
            </Zoom>
          )}
          {saveSuccess && (
            <Zoom in>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {saveSuccess}
              </Alert>
            </Zoom>
          )}
        </Stack>

        <Grid container spacing={4}>
          {/* Profile Avatar Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                  height: 'fit-content',
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        fontSize: '3rem',
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        border: '4px solid white',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {getInitials()}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: '50%',
                        transform: 'translateX(50%)',
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    {user?.role || 'User'}
        </Typography>

                  <Chip
                    icon={<Security />}
                    label="Verified Account"
                    color="success"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {user?.email}
                      </Typography>
                    </Box>
                    {user?.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {user?.phone}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Personal Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={handleEdit}
                      sx={{
                        borderRadius: 2,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={2}>
                      <Button
                        startIcon={<Cancel />}
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{
                          borderRadius: 2,
                          borderColor: theme.palette.error.main,
                          color: theme.palette.error.main,
                          '&:hover': {
                            borderColor: theme.palette.error.dark,
                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<Save />}
                        variant="contained"
                        onClick={onSubmit}
                        disabled={saving}
                        sx={{
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                          },
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Stack>
                  )}
                </Box>

            <Box component="form" onSubmit={onSubmit}>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 20 }} />
                        Basic Information
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        fullWidth
                        value={form.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        fullWidth
                        value={form.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={form.email}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: theme.palette.text.disabled }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        fullWidth
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        label="Date of Birth"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={form.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Cake sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={form.gender}
                          label="Gender"
                          onChange={(e) => handleChange('gender', e.target.value)}
                          startAdornment={
                            <InputAdornment position="start">
                              <Wc sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          }
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          {genderOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                </Grid>

                    {/* Address Section */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 20 }} />
                        Address Information
                      </Typography>
                </Grid>

                <Grid item xs={12}>
                      <TextField
                        label="Street Address"
                        fullWidth
                        value={form.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="City"
                        fullWidth
                        value={form.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="State/Province"
                        fullWidth
                        value={form.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="ZIP/Postal Code"
                        fullWidth
                        value={form.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Pin sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Country"
                        fullWidth
                        value={form.address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Public sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                </Grid>
              </Grid>
            </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
      </Box>
  );
};

export default ProfilePage;
