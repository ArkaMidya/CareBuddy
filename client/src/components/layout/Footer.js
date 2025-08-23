import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  LocalHospital,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
  HealthAndSafety,
  Favorite,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { text: 'Health Resources', href: '/resources' },
        { text: 'Telemedicine', href: '/consultations' },
        { text: 'Education', href: '/education' },
        { text: 'Campaigns', href: '/campaigns' },
        { text: 'Reports', href: '/reports' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Contact Us', href: '/contact' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Community',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Our Mission', href: '/mission' },
        { text: 'Partners', href: '/partners' },
        { text: 'Volunteer', href: '/volunteer' },
        { text: 'Donate', href: '/donate' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/carebody', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/carebody', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/carebody', label: 'LinkedIn' },
    { icon: <Instagram />, href: 'https://instagram.com/carebody', label: 'Instagram' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: 'white',
        py: 6,
        mt: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.success.main} 100%)`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <HealthAndSafety sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
                    Care Buddy
                  </Typography>
                  <Chip
                    label="Health Ecosystem"
                    size="small"
                    sx={{
                      backgroundColor: alpha('#ffffff', 0.2),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
              </Box>
                             <Typography variant="body2" sx={{ mb: 3, opacity: 1, lineHeight: 1.6, color: 'white' }}>
                 Collaborative Digital Ecosystem for Inclusive Health and Well-Being. 
                 Advancing SDG-3 through innovative healthcare technology and community partnerships.
               </Typography>
              
              {/* Contact Info */}
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha('#ffffff', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Email sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                                     <Typography variant="body2" sx={{ opacity: 1, color: 'white' }}>
                     contact@carebuddy.org
                   </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha('#ffffff', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Phone sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                                     <Typography variant="body2" sx={{ opacity: 1, color: 'white' }}>
                     +1 (555) 123-4567
                   </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: alpha('#ffffff', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationOn sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                                     <Typography variant="body2" sx={{ opacity: 1, color: 'white' }}>
                     Global Health Initiative
                   </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={2} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link) => (
                  <Link
                    key={link.text}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      opacity: 0.8,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        opacity: 1,
                        color: theme.palette.primary.light,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Social Links and Bottom Section */}
        <Divider sx={{ 
          my: 4, 
          borderColor: alpha('#ffffff', 0.4),
          borderWidth: '2px',
          '&::before, &::after': {
            borderColor: alpha('#ffffff', 0.4),
            borderWidth: '2px',
          }
        }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          {/* Copyright */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                         <Typography variant="body2" sx={{ opacity: 1, color: 'white' }}>
               © {currentYear} Care Buddy Health Ecosystem. All rights reserved.
             </Typography>
             <Typography variant="caption" sx={{ opacity: 1, color: 'white', display: 'block', mt: 0.5 }}>
               Made with <Favorite sx={{ fontSize: 12, color: theme.palette.error.light, mx: 0.5 }} /> for better health
             </Typography>
          </Box>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{
                  color: 'white',
                  backgroundColor: alpha('#ffffff', 0.1),
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.2),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* SDG Badge */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Chip
            label="Advancing SDG-3: Good Health and Well-Being"
            color="success"
            size="medium"
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.2),
              color: 'white',
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              fontSize: '0.9rem',
              py: 1,
              px: 2,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;








