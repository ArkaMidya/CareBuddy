import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Divider,
  Paper,
  InputAdornment,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Phone,
  Email,
  Language,
  AccessTime,
  Star,
  LocalHospital,
  HealthAndSafety,
  Business,
  School,
  VolunteerActivism,
  Directions,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ResourcesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [bookmarkedResources, setBookmarkedResources] = useState(new Set());

  // Share functionality
  const handleShare = async (resource) => {
    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: `${resource.title} - Care Buddy Health Resources`,
          text: `${resource.description}\n\nLocation: ${resource.location}, ${resource.city}, ${resource.state}\nPhone: ${resource.phone}`,
          url: `${window.location.origin}/resources?resource=${resource.id}`,
        });
        // Note: We don't have showSuccess/Error in this component, so we'll use console.log
        console.log('Resource shared successfully!');
      } else {
        // Fallback: copy to clipboard
        const shareText = `${resource.title}\n\n${resource.description}\n\nLocation: ${resource.location}, ${resource.city}, ${resource.state}\nPhone: ${resource.phone}\n\nFind more health resources at: ${window.location.origin}/resources?resource=${resource.id}`;
        await navigator.clipboard.writeText(shareText);
        console.log('Resource information copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback to clipboard if Web Share API fails
        try {
          const shareText = `${resource.title}\n\n${resource.description}\n\nLocation: ${resource.location}, ${resource.city}, ${resource.state}\nPhone: ${resource.phone}\n\nFind more health resources at: ${window.location.origin}/resources?resource=${resource.id}`;
          await navigator.clipboard.writeText(shareText);
          console.log('Resource information copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to share resource');
        }
      }
    }
  };

  // Mock data for health resources
  const resources = [
    {
      id: 1,
      title: 'City General Hospital',
      type: 'hospital',
      category: 'emergency',
      description: '24/7 emergency care, trauma center, and specialized medical services.',
      location: '123 Main Street, Downtown',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 123-4567',
      email: 'info@citygeneral.com',
      website: 'www.citygeneral.com',
      rating: 4.5,
      reviews: 128,
      services: ['Emergency Care', 'Trauma Center', 'Cardiology', 'Neurology'],
      availability: '24/7',
      capacity: '500 beds',
      verified: true,
      distance: '2.3 km',
    },
    {
      id: 2,
      title: 'Community Health Clinic',
      type: 'clinic',
      category: 'primary',
      description: 'Affordable primary healthcare services for the community.',
      location: '456 Oak Avenue, Westside',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 234-5678',
      email: 'contact@communityclinic.org',
      website: 'www.communityclinic.org',
      rating: 4.2,
      reviews: 89,
      services: ['Primary Care', 'Vaccinations', 'Health Screenings', 'Family Planning'],
      availability: 'Mon-Fri 8AM-6PM',
      capacity: '50 patients/day',
      verified: true,
      distance: '1.8 km',
    },
    {
      id: 3,
      title: 'Mental Health Support Center',
      type: 'specialized',
      category: 'mental_health',
      description: 'Professional mental health services and counseling support.',
      location: '789 Pine Street, Eastside',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 345-6789',
      email: 'support@mentalhealth.org',
      website: 'www.mentalhealth.org',
      rating: 4.7,
      reviews: 156,
      services: ['Counseling', 'Therapy', 'Crisis Support', 'Group Sessions'],
      availability: 'Mon-Sat 9AM-8PM',
      capacity: '30 patients/day',
      verified: true,
      distance: '3.1 km',
    },
    {
      id: 4,
      title: 'Mobile Health Unit',
      type: 'mobile',
      category: 'outreach',
      description: 'Mobile healthcare services reaching underserved communities.',
      location: 'Various locations',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 456-7890',
      email: 'mobile@healthunit.org',
      website: 'www.mobilehealthunit.org',
      rating: 4.3,
      reviews: 67,
      services: ['Health Screenings', 'Vaccinations', 'Basic Care', 'Health Education'],
      availability: 'Tue-Sat 10AM-4PM',
      capacity: '40 patients/day',
      verified: true,
      distance: 'Varies',
    },
    {
      id: 5,
      title: 'Pediatric Care Center',
      type: 'specialized',
      category: 'pediatrics',
      description: 'Specialized healthcare services for children and adolescents.',
      location: '321 Elm Street, Northside',
      city: 'New York',
      state: 'NY',
      phone: '+1 (555) 567-8901',
      email: 'care@pediatriccenter.com',
      website: 'www.pediatriccenter.com',
      rating: 4.6,
      reviews: 203,
      services: ['Pediatric Care', 'Vaccinations', 'Growth Monitoring', 'Child Development'],
      availability: 'Mon-Fri 8AM-5PM',
      capacity: '80 patients/day',
      verified: true,
      distance: '4.2 km',
    },
  ];

  const categories = [
    { value: 'emergency', label: 'Emergency Care' },
    { value: 'primary', label: 'Primary Care' },
    { value: 'specialized', label: 'Specialized Care' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'outreach', label: 'Community Outreach' },
  ];

  const types = [
    { value: 'hospital', label: 'Hospital', icon: <LocalHospital /> },
    { value: 'clinic', label: 'Clinic', icon: <HealthAndSafety /> },
    { value: 'specialized', label: 'Specialized Center', icon: <Business /> },
    { value: 'mobile', label: 'Mobile Unit', icon: <VolunteerActivism /> },
  ];

  const getTypeIcon = (type) => {
    const typeObj = types.find(t => t.value === type);
    return typeObj ? typeObj.icon : <LocalHospital />;
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesType = !selectedType || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleBookmark = (resourceId) => {
    const newBookmarked = new Set(bookmarkedResources);
    if (newBookmarked.has(resourceId)) {
      newBookmarked.delete(resourceId);
    } else {
      newBookmarked.add(resourceId);
    }
    setBookmarkedResources(newBookmarked);
  };

  const handleOpenDialog = (resource) => {
    setSelectedDialog(resource);
  };

  const handleCloseDialog = () => {
    setSelectedDialog(null);
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
          //backgroundImage: 'url("/bglogo.jpg")',
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
            Health Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find healthcare facilities, services, and resources in your area
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search resources, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {types.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Found {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Resources Grid */}
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} md={6} lg={4} key={resource.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {getTypeIcon(resource.type)}
                    </Avatar>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleBookmark(resource.id)}
                        color={bookmarkedResources.has(resource.id) ? 'primary' : 'default'}
                      >
                        {bookmarkedResources.has(resource.id) ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleShare(resource)}
                        title="Share resource"
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {resource.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={resource.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({resource.reviews})
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {resource.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {resource.distance} away
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {resource.availability}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {resource.services.slice(0, 3).map((service, index) => (
                      <Chip
                        key={index}
                        label={service}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {resource.services.length > 3 && (
                      <Chip
                        label={`+${resource.services.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {resource.verified && (
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
                    onClick={() => handleOpenDialog(resource)}
                    startIcon={<Directions />}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No resources found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Box>
        )}

        {/* Resource Detail Dialog */}
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
                    {getTypeIcon(selectedDialog.type)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedDialog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDialog.location}
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

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Services Offered
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {selectedDialog.services.map((service, index) => (
                        <Chip
                          key={index}
                          label={service}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText primary={selectedDialog.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText primary={selectedDialog.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Language />
                        </ListItemIcon>
                        <ListItemText primary={selectedDialog.website} />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Quick Info
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Rating"
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating value={selectedDialog.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  ({selectedDialog.reviews} reviews)
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Availability"
                            secondary={selectedDialog.availability}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Capacity"
                            secondary={selectedDialog.capacity}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Distance"
                            secondary={selectedDialog.distance}
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
                  Share Resource
                </Button>
                <Button variant="contained" startIcon={<Directions />}>
                  Get Directions
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ResourcesPage;
