import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalHospital,
  VideoCall,
  School,
  Campaign,
  Report,
  People,
  Security,
  AccessTime,
  LocationOn,
  HealthAndSafety,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // Add torch effect styles to head
    const style = document.createElement('style');
    style.textContent = `
      .torch-effect {
        position: relative;
        overflow: hidden;
      }
      
      .torch-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
          circle 150px at var(--mouse-x, 50%) var(--mouse-y, 50%),
          // rgba(255, 255, 255, 0.15) 0%,
          // rgba(255, 255, 255, 0.08) 30%,
          // rgba(255, 255, 255, 0.03) 60%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
      }
      
      .torch-effect:hover::before {
        opacity: 1;
        
      }
      
      .torch-effect > * {
        position: relative;
        z-index: 2;
      }
    `;
    document.head.appendChild(style);

    // Add mouse move listeners to all divs
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
      e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    };

    const addTorchEffect = () => {
      const divs = document.querySelectorAll('div');
      divs.forEach(div => {
        if (!div.classList.contains('torch-effect')) {
          div.classList.add('torch-effect');
          div.addEventListener('mousemove', handleMouseMove);
        }
      });
    };

    // Initial setup
    addTorchEffect();

    // Observer to handle dynamically added elements
    const observer = new MutationObserver(() => {
      addTorchEffect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      // Cleanup
      document.head.removeChild(style);
      const divs = document.querySelectorAll('.torch-effect');
      divs.forEach(div => {
        div.removeEventListener('mousemove', handleMouseMove);
        div.classList.remove('torch-effect');
      });
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: <LocalHospital sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Health Resource Hub',
      description: 'Connect with healthcare providers, find nearby facilities, and access medical resources.',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
    },
    {
      icon: <VideoCall sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      title: 'Telemedicine Services',
      description: 'Get virtual consultations with verified healthcare professionals from anywhere.',
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
    },
    {
      icon: <School sx={{ fontSize: 48, color: theme.palette.success.main }} />,
      title: 'Health Education',
      description: 'Access interactive educational content on nutrition, wellness, and preventive care.',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.1)} 100%)`,
    },
    {
      icon: <Campaign sx={{ fontSize: 48, color: theme.palette.warning.main }} />,
      title: 'Health Campaigns',
      description: 'Participate in immunization drives, health checkups, and wellness programs.',
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
    },
    {
      icon: <Report sx={{ fontSize: 48, color: theme.palette.error.main }} />,
      title: 'Community Reporting',
      description: 'Report health incidents and outbreaks for timely community response.',
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`,
    },
    {
      icon: <People sx={{ fontSize: 48, color: theme.palette.info.main }} />,
      title: 'Collaborative Care',
      description: 'Connect with health workers, NGOs, and community members for better health outcomes.',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.1)} 100%)`,
    },
  ];

  const stats = [
    { label: 'Healthcare Providers', value: '500+', icon: <LocalHospital />, color: theme.palette.primary.main },
    { label: 'Communities Served', value: '10,000+', icon: <People />, color: theme.palette.secondary.main },
    { label: 'Health Resources', value: '1,200+', icon: <HealthAndSafety />, color: theme.palette.success.main },
    { label: 'Active Campaigns', value: '25+', icon: <Campaign />, color: theme.palette.warning.main },
  ];

  const benefits = [
    {
      icon: <Security sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      title: 'Secure & Private',
      description: 'Your health information is protected with industry-standard security measures.',
    },
    {
      icon: <AccessTime sx={{ fontSize: 32, color: theme.palette.secondary.main }} />,
      title: '24/7 Access',
      description: 'Access healthcare resources and support whenever you need them.',
    },
    {
      icon: <LocationOn sx={{ fontSize: 32, color: theme.palette.success.main }} />,
      title: 'Location-Based',
      description: 'Find healthcare services and resources near your location.',
    },
  ];

  const partners = [
    { name: 'NGO One', logo: '/p2.jpg', url: 'https://example.org' },
    { name: 'NGO Two', logo: '/tt.jpg', url: 'https://example.org' },
    { name: 'NGO Three', logo: '/kk.webp', url: 'https://example.org' },
    { name: 'NGO Four', logo: '/ngo.webp', url: 'https://example.org' },
  ];

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh',
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
        opacity: 1, // increased opacity for better visibility
        zIndex: 0,
      },
    }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 0,
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 0.5,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Your Health, Our Priority
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: 'white',
                  opacity: 0.9,
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                Join the Care Buddy Health Ecosystem - a collaborative digital platform connecting communities with healthcare resources, education, and support.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: 'white',
                        color: theme.palette.primary.main,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: alpha('#ffffff', 0.9),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Get Started
                      <ArrowForward sx={{ ml: 1 }} />
                    </Button>
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: alpha('#ffffff', 0.1),
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                ) : (
                  <Button
                    component={Link}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.9),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Go to Dashboard
                    <ArrowForward sx={{ ml: 1 }} />
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <HealthAndSafety sx={{ fontSize: 120, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
            Comprehensive Healthcare Solutions
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
            Discover our integrated platform designed to address all aspects of community health and wellness
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: feature.gradient,
                  border: `1px solid ${alpha(feature.color, 0.2)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 32px ${alpha(feature.color, 0.15)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          py: 6,
          mb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: alpha(stat.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ color: stat.color }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="xl" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
                          Why Choose Care Buddy?
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
            Experience healthcare innovation designed with your needs in mind
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  pb: 8,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 24px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderColor: `${alpha(theme.palette.primary.main, 0.6)}`,
                  },
                }}
              >
                <Box sx={{ mb: 3 }}>
                  {benefit.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                  }}
                >
                  {benefit.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Partners Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Our Partners
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            We collaborate with NGOs and community organizations to reach more people.
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center" justifyContent="center">
          {partners.map((p, i) => (
            <Grid item xs={6} sm={4} md={2} key={i} sx={{ textAlign: 'center' }}>
              <Box
                component="a"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box
                  component="img"
                  src={p.logo}
                  alt={p.name}
                  sx={{ height: { xs: 80, sm: 96, md: 120 }, width: { xs: 120, sm: 160, md: 180 }, objectFit: 'contain', filter: 'grayscale(0.1)' }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          py: 8,
          borderRadius: 4,
          mx: 2,
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                mb: 3,
                color: 'white',
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Ready to Transform Your Health Journey?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'white',
                opacity: 0.9,
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join thousands of users who are already experiencing better health outcomes through our platform
            </Typography>
            <Button
              component={Link}
              to={isAuthenticated ? "/dashboard" : "/register"}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.9),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Today'}
              <ArrowForward sx={{ ml: 2 }} />
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
