import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0891b2',
      light: '#22d3ee',
      dark: '#0e7490',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#f43f5e',
      light: '#fb7185',
      dark: '#e11d48',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(17, 24, 39, 0.8)',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#9ca3af',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#0891b2 #0f172a',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0f172a',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#0891b2',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              boxShadow: `0 0 0 2px ${alpha('#0891b2', 0.5)}`,
            },
          },
          '& .MuiFilledInput-input': {
            color: '#f9fafb',
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
            '&.Mui-focused': {
              color: '#22d3ee',
            },
          },
          '& .MuiFilledInput-underline': {
            '&:before': {
              borderBottomColor: '#374151',
            },
            '&:after': {
              borderBottomColor: '#0891b2',
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottomColor: '#6b7280',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          padding: '14px 24px',
        },
        contained: {
          boxShadow: '0 10px 15px -3px rgba(8, 145, 178, 0.2)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(8, 145, 178, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(24px)',
        },
      },
    },
  },
});

export default theme;
