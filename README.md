# Frontend - Sistema de Administración de Apartamentos

Frontend desarrollado en **React** con **Vite** y **TailwindCSS**.

## 🚀 Tecnologías

- **React 18**
- **Vite** - Build tool
- **React Router DOM** - Navegación
- **Axios** - Peticiones HTTP
- **TailwindCSS** - Estilos

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Context API (Auth)
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios (API)
│   ├── App.jsx        # Componente principal
│   └── main.jsx       # Punto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## 📦 Instalación

1. **Instalar Node.js** (versión 18 o superior)
   - https://nodejs.org/

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   Crear archivo `.env` en la raíz:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5173`

## 🔨 Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 🌐 Deploy

### Vercel / Netlify
1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar output directory: `dist`
4. Configurar variable de entorno `VITE_API_URL`
5. Deploy automático

## 📱 Características

- ✅ Login con JWT
- ✅ Dashboard con estadísticas
- ✅ CRUD de Apartamentos
- ✅ CRUD de Arrendatarios
- ✅ Gestión de Pagos
- ✅ Diseño responsive
- ✅ Rutas protegidas

## 🎨 Personalización

Los colores principales se pueden modificar en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#2563eb',    // Color principal
      secondary: '#64748b',  // Color secundario
    }
  }
}
