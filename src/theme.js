import { createTheme, alpha } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
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
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: mode === 'dark' ? '#f9fafb' : '#111827',
      secondary: mode === 'dark' ? '#9ca3af' : '#6b7280',
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
      color: mode === 'dark' ? '#9ca3af' : '#6b7280',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#0891b2',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'dark' ? '#0f172a' : '#f1f5f9',
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
            backgroundColor: mode === 'dark' ? 'rgba(17, 24, 39, 0.6)' : '#f3f4f6',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : '#e5e7eb',
            },
            '&.Mui-focused': {
              backgroundColor: mode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : '#ffffff',
              boxShadow: `0 0 0 2px ${alpha('#0891b2', 0.5)}`,
            },
          },
          '& .MuiFilledInput-input': {
            color: mode === 'dark' ? '#f9fafb' : '#111827',
          },
          '& .MuiInputLabel-root': {
            color: mode === 'dark' ? '#9ca3af' : '#6b7280',
            '&.Mui-focused': {
              color: '#22d3ee',
            },
          },
          '& .MuiFilledInput-underline': {
            '&:before': {
              borderBottomColor: mode === 'dark' ? '#374151' : '#d1d5db',
            },
            '&:after': {
              borderBottomColor: '#0891b2',
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottomColor: mode === 'dark' ? '#6b7280' : '#9ca3af',
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

export default getTheme;
