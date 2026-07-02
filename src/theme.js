import { createTheme } from '@mui/material/styles';

// ─── 1. PALETA MODO CLARO (LIGHT MODE) ───
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#0891b2',      // Tu cian original (vibrante)
    light: '#399cba',     // Hover suave
    dark: '#03586d',      // Contraste para textos
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b',      // Ámbar/Naranja complementario
    light: '#fcd34d',
    dark: '#b45309',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',   // Fondo base de la aplicación
    paper: '#f8f9fa',     // Superficie de tarjetas y modales
  },
  text: {
    primary: '#0f172a',   // Slate oscuro para máxima lectura
    secondary: '#475569', // Texto atenuado
  },
  error: { main: '#ef4444' },
  warning: { main: '#f97316' },
  info: { main: '#06b6d4' },
  success: { main: '#10b981' },
  divider: '#e2e8f0',     // Separadores sutiles
};

// ─── 2. PALETA MODO OSCURO (DARK MODE) ───
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#528b9e',      // Cian desaturado para evitar fatiga visual
    light: '#7ea4b1',
    dark: '#2990ad',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#d97706',      // Naranja desaturado para entorno nocturno
    light: '#f59e0b',
    dark: '#92400e',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',   // Gris oscuro base (Material Design)
    paper: '#1e1e1e',     // Mayor elevación = superficie ligeramente más clara
  },
  text: {
    primary: '#f1f5f9',   // Blanco roto para evitar el destello lumínico
    secondary: '#94a3b8',
  },
  error: { main: '#fca5a5' },
  warning: { main: '#fdba74' },
  info: { main: '#67e8f9' },
  success: { main: '#6ee7b7' },
  divider: '#334155',     // Separadores adaptados a la oscuridad
};

// ─── 3. CONFIGURACIÓN TIPOGRÁFICA ───
const typographyConfig = {
  fontFamily: '"Inter", "Plus Jakarta Sans", "Helvetica", "Arial", sans-serif',
  
  // Títulos Principales
  h1: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 700,
    fontSize: '1.875rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  
  // Títulos de Componentes (Tarjetas, Modales)
  h5: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  
  // Texto de Cuerpo (Párrafos)
  body1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.6, // Mayor interlineado contra la fatiga visual
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.57,
  },
  
  // Elementos de Interfaz
  button: {
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none', // Desactiva las mayúsculas automáticas
  },
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.43,
  },
};

// ─── 4. GENERADOR DINÁMICO DEL TEMA ───
export const getTheme = (mode) => {
  return createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: typographyConfig,
    
    // Configuración de formas y esquinas sugerida (1 * 8px = 8px global)
    shape: {
      borderRadius: 1,
    },
    
    // Ajustes específicos por componente para pulir la consistencia visual
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '6px', // Botones un toque más estilizados
            padding: '6px 16px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '12px', // Modales más curvos para suavizar la vista
            backgroundImage: 'none', // Quita superposiciones de degradados por defecto en MUI dark
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export default getTheme;
