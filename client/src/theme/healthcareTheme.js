import { createTheme } from '@mui/material/styles';

// Professional Healthcare Color Palette
const healthcareTheme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Deep Green - represents health, growth, and vitality
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1976D2', // Professional Blue - trust, reliability, medical
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    success: {
      main: '#388E3C', // Success Green - positive health outcomes
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    warning: {
      main: '#F57C00', // Warning Orange - alerts and notifications
      light: '#FF9800',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F', // Error Red - health alerts and emergencies
      light: '#EF5350',
      dark: '#C62828',
    },
    info: {
      main: '#0288D1', // Info Blue - information and education
      light: '#29B6F6',
      dark: '#01579B',
    },
    background: {
      default: '#F8FBF8', // Very light green tinted background
      paper: '#ffffff',
    },
    text: {
      primary: '#1A1A1A', // Dark text for readability
      secondary: '#424242',
    },
    // Custom healthcare colors
    healthcare: {
      teal: '#00695C', // Teal for medical equipment and technology
      lavender: '#7B1FA2', // Lavender for wellness and mental health
      coral: '#FF7043', // Coral for emergency and urgent care
      mint: '#81C784', // Mint for preventive care and wellness
      navy: '#1A237E', // Navy for professional medical services
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#1A1A1A',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#1A1A1A',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#1A1A1A',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1A1A1A',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1A1A1A',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#1A1A1A',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#424242',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#616161',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #2E7D32 0%, #1976D2 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4CAF50',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2E7D32',
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
});

export default healthcareTheme;



