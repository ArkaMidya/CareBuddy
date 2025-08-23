import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  TextField,
  Chip,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Phone,
  Email,
  Language,
  AccessTime,
  LocalHospital,
  Directions,
  Share,
  Bookmark,
  BookmarkBorder,
  MyLocation,
  Map,
  Navigation,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  SecurityUpdate,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { realHospitalService } from '../services/realHospitalService';

const ResourcesPage = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState(new Set());
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showHiddenMap, setShowHiddenMap] = useState(false);

  // Toggle hidden map feature (activated by keyboard shortcut)
  const toggleHiddenMap = () => {
    setShowHiddenMap(!showHiddenMap);
  };

  // Keyboard shortcut listener for hidden map (Ctrl+Shift+M)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        toggleHiddenMap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHiddenMap]);

  // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        // Fetch real hospitals near the user's location
        fetchRealHospitalsNearLocation(latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        setError('Unable to get your location. Please enable location services or search manually.');
        setLocationLoading(false);
        setShowLocationError(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Fetch real hospitals near user's location
  const fetchRealHospitalsNearLocation = async (lat, lng, radius = 5000) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real hospitals from OpenStreetMap or fallback (5km radius)
      const hospitalData = await realHospitalService.getRealHospitalsNearLocation(lat, lng, 5000);
      setHospitals(hospitalData);
      
      console.log(`Loaded ${hospitalData.length} hospitals near your location`);
    } catch (err) {
      console.error('Error fetching real hospitals:', err);
      setError('Failed to fetch real hospitals. Using fallback data.');
      
      // Use fallback hospitals if API fails
      const fallbackHospitals = realHospitalService.generateFallbackHospitals(lat, lng);
      setHospitals(fallbackHospitals.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  // Initial load - get user location and fetch nearby hospitals
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filter hospitals based on search
  const filteredHospitals = hospitals.filter(hospital => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      hospital.title.toLowerCase().includes(searchLower) ||
      hospital.description.toLowerCase().includes(searchLower) ||
      (hospital.services && hospital.services.some(service => 
        service.name && service.name.toLowerCase().includes(searchLower)
      ))
    );
  });

  // Handle search
  const handleSearch = async () => {
    if (!userLocation) {
      setError('Please allow location access to search hospitals');
      return;
    }

    try {
      setLoading(true);
      // Fetch new real hospitals for search (5km radius)
      const searchResults = await realHospitalService.getRealHospitalsNearLocation(
        userLocation.lat, 
        userLocation.lng, 
        5000
      );
      
      // Filter by search term
      const filteredResults = searchResults.filter(hospital => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          hospital.title.toLowerCase().includes(searchLower) ||
          hospital.description.toLowerCase().includes(searchLower) ||
          (hospital.services && hospital.services.some(service => 
            service.name && service.name.toLowerCase().includes(searchLower)
          ))
        );
      });
      
      setHospitals(filteredResults);
    } catch (err) {
      console.error('Error searching hospitals:', err);
      setError('Failed to search hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get directions to a hospital
  const getDirections = (hospital) => {
    if (!hospital.location || !hospital.location.coordinates) {
      setError('Location coordinates not available for this hospital');
      return;
    }

    const { latitude, longitude } = hospital.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  // Share functionality
  const handleShare = async (hospital) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${hospital.title} - Care Buddy Hospitals`,
          text: `${hospital.description}\n\nLocation: ${hospital.location?.address?.street || 'N/A'}, ${hospital.location?.address?.city || 'N/A'}`,
          url: `${window.location.origin}/resources?hospital=${hospital._id}`,
        });
        console.log('Hospital shared successfully!');
      } else {
        const shareText = `${hospital.title}\n\n${hospital.description}\n\nLocation: ${hospital.location?.address?.street || 'N/A'}, ${hospital.location?.address?.city || 'N/A'}`;
        await navigator.clipboard.writeText(shareText);
        console.log('Hospital information copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        try {
          const shareText = `${hospital.title}\n\n${hospital.description}\n\nLocation: ${hospital.location?.address?.street || 'N/A'}, ${hospital.location?.address?.city || 'N/A'}`;
          await navigator.clipboard.writeText(shareText);
          console.log('Hospital information copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to share hospital');
        }
      }
    }
  };

  const handleBookmark = (hospitalId) => {
    const newBookmarked = new Set(bookmarkedHospitals);
    if (newBookmarked.has(hospitalId)) {
      newBookmarked.delete(hospitalId);
    } else {
      newBookmarked.add(hospitalId);
    }
    setBookmarkedHospitals(newBookmarked);
  };

  const handleOpenDialog = (hospital) => {
    setSelectedDialog(hospital);
  };

  const handleCloseDialog = () => {
    setSelectedDialog(null);
  };

  // Calculate distance from user location
  const getDistanceFromUser = (hospital) => {
    if (!userLocation || !hospital.location?.coordinates) return 'Distance unknown';
    
    const distance = realHospitalService.calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      hospital.location.coordinates.latitude, 
      hospital.location.coordinates.longitude
    );
    
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: 0,
        },
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Hospitals Near You
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find hospitals and medical centers near your location
          </Typography>
        </Box>

        {/* Location Status */}
        {userLocation && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              <Typography variant="body2">
                Location found: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Search Bar */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search hospitals, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={getUserLocation}
                disabled={locationLoading}
                startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocation />}
              >
                {locationLoading ? 'Getting Location...' : 'Update Location'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Results Count */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Found {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
            {userLocation && ' near your location'}
          </Typography>
          {userLocation && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => setShowMapView(!showMapView)}
              >
                {showMapView ? 'Hide Map' : 'View Map'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Map />}
                onClick={() => {
                  const url = `https://www.google.com/maps/search/hospitals/@${userLocation.lat},${userLocation.lng},13z`;
                  window.open(url, '_blank');
                }}
              >
                Google Maps
              </Button>
              {/* Hidden Map Toggle - Only visible when feature is activated */}
              {showHiddenMap && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SecurityUpdate />}
                  onClick={() => setShowHiddenMap(false)}
                  sx={{ 
                    animation: 'pulse 2s infinite',
                    background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7b1fa2, #c2185b)'
                    }
                  }}
                >
                  Hidden Map Active
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Regular Map View */}
        {showMapView && userLocation && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Map View
            </Typography>
            <Box sx={{ 
              height: 400, 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '2px dashed #2196f3',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Mock Map Background with Grid */}
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                background: `repeating-linear-gradient(
                  0deg,
                  rgba(33, 150, 243, 0.1),
                  rgba(33, 150, 243, 0.1) 1px,
                  transparent 1px,
                  transparent 40px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(33, 150, 243, 0.1),
                  rgba(33, 150, 243, 0.1) 1px,
                  transparent 1px,
                  transparent 40px
                )`
              }} />
              
              {/* User Location Marker - Center */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#4caf50',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  animation: 'pulse 2s infinite'
                }} />
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 0.5,
                  background: 'rgba(255,255,255,0.9)',
                  px: 1,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#4caf50'
                }}>
                  You are here
                </Typography>
              </Box>

              {/* Hospital Markers */}
              {filteredHospitals.slice(0, 8).map((hospital, index) => {
                const angle = (index * 45) * (Math.PI / 180); // Spread around user
                const radius = 80 + (index % 3) * 40; // Different distances
                const x = 50 + (radius / 4) * Math.cos(angle); // Convert to percentage
                const y = 50 + (radius / 4) * Math.sin(angle);
                
                return (
                  <Box
                    key={hospital._id}
                    sx={{
                      position: 'absolute',
                      top: `${Math.min(Math.max(y, 10), 85)}%`,
                      left: `${Math.min(Math.max(x, 5), 90)}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                    onClick={() => setSelectedDialog(hospital)}
                  >
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: hospital.title === 'Ruby General Hospital' ? '#e91e63' : 
                                 hospital.title === 'Desun Hospital' ? '#9c27b0' :
                                 hospital.title === 'Genesis Hospital' ? '#ff9800' : '#f44336',
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        transition: 'transform 0.2s'
                      }
                    }}>
                      <LocalHospital fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 0.5,
                      background: 'rgba(255,255,255,0.9)',
                      px: 1,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {hospital.title}
                    </Typography>
                  </Box>
                );
              })}

              {/* Map Legend */}
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(255,255,255,0.95)',
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                minWidth: 150
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Map Legend
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#4caf50' }} />
                  <Typography variant="caption">Your Location</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#e91e63' }} />
                  <Typography variant="caption">Ruby Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#9c27b0' }} />
                  <Typography variant="caption">Desun Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#ff9800' }} />
                  <Typography variant="caption">Genesis Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#f44336' }} />
                  <Typography variant="caption">Other Hospitals</Typography>
                </Box>
              </Box>

              {/* Coordinates Display */}
              <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(255,255,255,0.9)',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Your Coordinates:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Lat: {userLocation.lat.toFixed(6)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Lng: {userLocation.lng.toFixed(6)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Hidden Map View - Advanced Features (Ctrl+Shift+M to activate) */}
        {showHiddenMap && userLocation && (
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '2px solid #9c27b0',
            boxShadow: '0 0 20px rgba(156, 39, 176, 0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SecurityUpdate sx={{ color: '#9c27b0' }} />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                🔒 HIDDEN MAP VIEW - ADVANCED MODE
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#9c27b0', 
                background: 'rgba(156, 39, 176, 0.1)',
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}>
                Press Ctrl+Shift+M to toggle
              </Typography>
            </Box>
            
            <Box sx={{ 
              height: 500, 
              background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
              border: '2px solid #e91e63',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Advanced Grid Pattern */}
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                background: `repeating-linear-gradient(
                  0deg,
                  rgba(156, 39, 176, 0.3),
                  rgba(156, 39, 176, 0.3) 1px,
                  transparent 1px,
                  transparent 20px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(233, 30, 99, 0.3),
                  rgba(233, 30, 99, 0.3) 1px,
                  transparent 1px,
                  transparent 20px
                )`
              }} />
              
              {/* Enhanced User Location Marker */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #00ff00 0%, #008000 100%)',
                  border: '4px solid #fff',
                  boxShadow: '0 0 20px #00ff00, 0 4px 12px rgba(0,0,0,0.5)',
                  animation: 'pulse 1.5s infinite',
                  position: 'relative'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    animation: 'pulse 0.5s infinite alternate'
                  }} />
                </Box>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 1,
                  background: 'rgba(0,255,0,0.9)',
                  color: '#000',
                  px: 1,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  👤 SECURE LOCATION
                </Typography>
              </Box>

              {/* Enhanced Hospital Markers with Additional Data */}
              {filteredHospitals.slice(0, 8).map((hospital, index) => {
                const angle = (index * 45) * (Math.PI / 180);
                const radius = 100 + (index % 4) * 50;
                const x = 50 + (radius / 5) * Math.cos(angle);
                const y = 50 + (radius / 5) * Math.sin(angle);
                
                return (
                  <Box
                    key={hospital._id}
                    sx={{
                      position: 'absolute',
                      top: `${Math.min(Math.max(y, 5), 90)}%`,
                      left: `${Math.min(Math.max(x, 5), 90)}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                    onClick={() => setSelectedDialog(hospital)}
                  >
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: hospital.title === 'Ruby General Hospital' ? 
                        'radial-gradient(circle, #e91e63 0%, #ad1457 100%)' : 
                        hospital.title === 'Desun Hospital' ? 
                        'radial-gradient(circle, #9c27b0 0%, #6a1b9a 100%)' :
                        hospital.title === 'Genesis Hospital' ? 
                        'radial-gradient(circle, #ff9800 0%, #f57c00 100%)' :
                        'radial-gradient(circle, #f44336 0%, #c62828 100%)',
                      border: '3px solid #fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 0 15px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.5)',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.3)',
                        transition: 'transform 0.3s',
                        boxShadow: '0 0 25px rgba(255,255,255,0.8)'
                      }
                    }}>
                      <LocalHospital fontSize="medium" />
                    </Box>
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 0.5,
                      background: 'rgba(255,255,255,0.95)',
                      px: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 'bold'
                    }}>
                      🏥 {hospital.title}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      background: 'rgba(156,39,176,0.9)',
                      color: '#fff',
                      px: 1,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      mt: 0.5
                    }}>
                      {hospital.distance?.toFixed(1)}km
                    </Typography>
                  </Box>
                );
              })}

              {/* Advanced Legend */}
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(0,0,0,0.9)',
                border: '2px solid #9c27b0',
                p: 2,
                borderRadius: 2,
                minWidth: 180
              }}>
                <Typography variant="subtitle2" sx={{ color: '#9c27b0', mb: 1 }}>
                  🔒 HIDDEN MAP LEGEND
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#00ff00' }} />
                  <Typography variant="caption" sx={{ color: '#fff' }}>Secure Location</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#e91e63' }} />
                  <Typography variant="caption" sx={{ color: '#fff' }}>Ruby Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#9c27b0' }} />
                  <Typography variant="caption" sx={{ color: '#fff' }}>Desun Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#ff9800' }} />
                  <Typography variant="caption" sx={{ color: '#fff' }}>Genesis Hospital</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: '#f44336' }} />
                  <Typography variant="caption" sx={{ color: '#fff' }}>Other Hospitals</Typography>
                </Box>
              </Box>

              {/* Advanced Coordinates & Stats */}
              <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(0,0,0,0.9)',
                border: '2px solid #e91e63',
                p: 2,
                borderRadius: 1
              }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                  🎯 SECURED COORDINATES:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#fff' }}>
                  Lat: {userLocation.lat.toFixed(8)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#fff' }}>
                  Lng: {userLocation.lng.toFixed(8)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#9c27b0', mt: 1 }}>
                  🏥 Hospitals: {filteredHospitals.length}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#9c27b0' }}>
                  🔒 Mode: HIDDEN
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Hospitals Grid */}
        {!loading && (
          <Grid container spacing={3}>
            {filteredHospitals.map((hospital) => (
              <Grid item xs={12} md={6} lg={4} key={hospital._id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <LocalHospital />
                      </Avatar>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(hospital._id)}
                          color={bookmarkedHospitals.has(hospital._id) ? 'primary' : 'default'}
                        >
                          {bookmarkedHospitals.has(hospital._id) ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleShare(hospital)}
                          title="Share hospital"
                        >
                          <Share />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {hospital.title}
                    </Typography>

                    {hospital.quality?.rating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={hospital.quality.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({hospital.quality.totalReviews || 0})
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {hospital.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {getDistanceFromUser(hospital)} away
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {hospital.availability?.emergency24x7 ? '24/7 Emergency' : 'Check availability'}
                      </Typography>
                    </Box>

                    {hospital.services && hospital.services.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {hospital.services.slice(0, 3).map((service, index) => (
                          <Chip
                            key={index}
                            label={service.name || service}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {hospital.services.length > 3 && (
                          <Chip
                            label={`+${hospital.services.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}

                    {hospital.isVerified && (
                      <Chip
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleOpenDialog(hospital)}
                      startIcon={<Directions />}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && filteredHospitals.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hospitals found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userLocation 
                ? 'No hospitals found near your location. Try expanding your search radius or updating your location.'
                : 'Try adjusting your search criteria'
              }
            </Typography>
          </Box>
        )}

        {/* Hospital Detail Dialog */}
        <Dialog
          open={!!selectedDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedDialog && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <LocalHospital />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedDialog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDialog.location?.address?.street || 'Address not available'}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body1" paragraph>
                      {selectedDialog.description}
                    </Typography>

                    {selectedDialog.services && selectedDialog.services.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Services Offered
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {selectedDialog.services.map((service, index) => (
                            <Chip
                              key={index}
                              label={service.name || service}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    <List dense>
                      {selectedDialog.contact?.phone && selectedDialog.contact.phone.length > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText primary={selectedDialog.contact.phone[0]} />
                        </ListItem>
                      )}
                      {selectedDialog.contact?.email && selectedDialog.contact.email.length > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText primary={selectedDialog.contact.email[0]} />
                        </ListItem>
                      )}
                      {selectedDialog.contact?.website && (
                        <ListItem>
                          <ListItemIcon>
                            <Language />
                          </ListItemIcon>
                          <ListItemText primary={selectedDialog.contact.website} />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Quick Info
                      </Typography>
                      <List dense>
                        {selectedDialog.quality?.rating > 0 && (
                          <ListItem>
                            <ListItemText
                              primary="Rating"
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Rating value={selectedDialog.quality.rating} precision={0.1} size="small" readOnly />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    ({selectedDialog.quality.totalReviews || 0} reviews)
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText
                            primary="Availability"
                            secondary={selectedDialog.availability?.emergency24x7 ? '24/7 Emergency' : 'Check schedule'}
                          />
                        </ListItem>
                        {selectedDialog.capacity?.maxPatients && (
                          <ListItem>
                            <ListItemText
                              primary="Capacity"
                              secondary={`${selectedDialog.capacity.maxPatients} patients max`}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText
                            primary="Distance"
                            secondary={getDistanceFromUser(selectedDialog)}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Share />}
                  onClick={() => handleShare(selectedDialog)}
                >
                  Share Hospital
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Navigation />}
                  onClick={() => getDirections(selectedDialog)}
                >
                  Get Directions
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Floating Action Button for Location */}
        <Fab
          color="primary"
          aria-label="get location"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={getUserLocation}
          disabled={locationLoading}
        >
          {locationLoading ? <CircularProgress size={24} color="inherit" /> : <MyLocation />}
        </Fab>

        {/* Location Error Snackbar */}
        <Snackbar
          open={showLocationError}
          autoHideDuration={6000}
          onClose={() => setShowLocationError(false)}
        >
          <Alert onClose={() => setShowLocationError(false)} severity="error">
            Unable to get your location. Please enable location services or search manually.
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ResourcesPage;
