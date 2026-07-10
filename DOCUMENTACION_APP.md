# MyRentta — Documento de Producto y Especificación de la Aplicación

> Este documento describe la funcionalidad, los módulos y los aspectos técnicos de **MyRentta** con el fin de servir de base para la creación del sitio web institucional que enlazará con la aplicación.

---

## 1. Descripción general

**MyRentta** es una plataforma web (Progressive Web App) para la **administración de apartamentos en arriendo**. Está dirigida a propietarios, administradores e inmobiliarias que necesitan gestionar de forma centralizada sus propiedades, arrendatarios, contratos y cobros.

El objetivo principal es simplificar la operación diaria del arriendo: saber qué apartamentos están disponibles, quién los ocupa, cuándo vencen los contratos, y llevar el control de los pagos (incluyendo la detección automática de mora).

- **Nombre del producto:** MyRentta
- **Tipo:** PWA (Progressive Web App) instalable en móvil y escritorio
- **Audiencia:** Propietarios de inmuebles, administradores de arriendo
- **Mercado objetivo:** Habla hispana (configuración regional `es-CO`, moneda COP)
- **Acceso:** Aplicación web con autenticación (login requerido para el panel)

---

## 2. Pilares de valor

| Pilar | Descripción |
|-------|-------------|
| Centralización | Propiedades, inquilinos, contratos y pagos en un solo lugar |
| Control financiero | Ingresos del mes, pagos pendientes y mora en tiempo real |
| Visibilidad | Dashboard con métricas clave de ocupación y cobro |
| Movilidad | PWA instalable, con notificaciones push y diseño responsive |
| Autonomía | Suscripción/plan del usuario gestionable desde la app |

---

## 3. Funcionalidades principales

### 3.1 Autenticación y cuenta
- Registro de usuario.
- Inicio de sesión con identificador (email/usuario) y contraseña (JWT).
- Verificación en dos pasos mediante OTP (`/validate-otp`).
- Recuperación de contraseña: solicitud (`/forgot-password`) y restablecimiento (`/reset-password`).
- Cierre de sesión y protección de rutas (rutas privadas tras login).

### 3.2 Dashboard (Panel principal)
Resumen ejecutivo con tarjetas de métricas:
- **Ingresos del mes** (pagos recibidos en el mes calendario actual, en COP).
- **Apartamentos**: total, disponibles y arrendados.
- **Arrendatarios**: total y cuántos tienen contrato activo.
- **Pagos pendientes** y monto total por cobrar.
- **Contratos activos**.
- **Tasa de ocupación** (porcentaje de apartamentos arrendados).
- Listado de **últimos pagos recibidos** y **pagos pendientes/en mora**.

### 3.3 Módulo de Apartamentos
- Gestión (CRUD) del portafolio de propiedades.
- Estados de apartamento: `disponible` / arrendado (u otro estado no disponible).
- Visualización de disponibilidad para toma de decisiones.

### 3.4 Módulo de Arrendatarios
- Registro y gestión de inquilinos (CRUD).
- Relación con contratos y pagos (nombre e email del arrendatario usados en notificaciones y reportes).

### 3.5 Módulo de Contratos
- Creación, edición y eliminación de contratos.
- **Extensión de contrato** (renovación/prórroga).
- Detección de **contratos por vencer** (ventana de 30 días) mostrada en el dashboard.
- Estados del contrato: `activo`, etc.

### 3.6 Módulo de Pagos
- Registro de pagos, edición y confirmación de cobro.
- Métodos de cobro confirmados: `efectivo`, `transferencia`, `cheque`.
- Estados de pago: `pagado`, `pendiente`, `en_mora`.
- **Verificación de mora**: utilidad que identifica contratos en mora, período no pagado, días de mora y datos del inquilino/apartamento para seguimiento.
- Generación/descarga de comprobantes en PDF (`PictureAsPdf`).
- Cálculo del período de cuota (mes/año) y rangos de período para listados.

### 3.7 Suscripción / Plan
- Pantalla "Mi Suscripción" con plan contratado, precio, cantidad, total, tenant, código de cliente.
- Estados: `active`, `trial`, `canceled/cancelled`, `past_due`, `pending`.
- Fechas clave: inicio, fin, fin de prueba y fin de período actual.

### 3.8 Notificaciones push (PWA)
- Suscripción/cancelación a notificaciones push (Web Push, VAPID).
- Control de permisos del navegador y estado de suscripción.

### 3.9 Ayuda y soporte
- Pantalla de ayuda con canales de contacto: correo electrónico y WhatsApp.
- Datos de soporte configurables por variables de entorno.

### 3.10 Compartir (Web Share Target)
- Ruta `/share` que recibe contenido compartido desde el sistema operativo (título/texto/url) y redirige al dashboard. Soporta la instalación como destino de "Compartir" en móviles.

---

## 4. Arquitectura y módulos técnicos

### 4.1 Stack tecnológico
- **React 18** + **Vite** (build tool).
- **React Router DOM v6** — enrutamiento (basename `/myrentta-app`).
- **MUI (Material UI) v6/v9** + **Emotion** — componentes y theming (modo claro/oscuro).
- **TailwindCSS v4** (vía `@tailwindcss/vite`) — utilidades de estilo.
- **Axios** — cliente HTTP con interceptor de token JWT.
- **vite-plugin-pwa** + **web-push** — PWA y notificaciones push.
- **Service Worker** (`pwabuilder-sw.js`) — cacheo offline y share target.

### 4.2 Estructura de carpetas
```
src/
├── App.jsx                 # Rutas y providers (Auth, ColorMode, Theme)
├── main.jsx                # Punto de entrada
├── theme.js                # Tema MUI (claro/oscuro)
├── index.css / styles/     # Estilos globales
├── components/
│   ├── Layout.jsx          # Layout protegido (barra/navegación)
│   ├── PrivateRoute.jsx    # Guard de rutas privadas
│   ├── Logo.jsx, ArrendatarioIcon.jsx
│   ├── contratos/          # Crear, Editar, Extender contrato
│   ├── pagos/              # Registrar, Editar, Confirmar pago
│   ├── utils/MetricCard.jsx
│   └── VerificarMoraResultModal.jsx
├── context/AuthContext.jsx # Estado de autenticación (JWT en localStorage)
├── hooks/
│   ├── useMode.jsx         # Modo claro/oscuro
│   └── usePushNotifications.js # Suscripción push
├── pages/                  # Login, Register, ValidateOTP, ForgotPassword,
│   │                       #   ResetPassword, Dashboard, Apartamentos,
│   │                       #   Arrendatarios, Contratos, Pagos, Ayuda,
│   │                       #   ShareTarget, Subscriptions
│   ├── ...
├── services/
│   ├── api.js              # Instancia Axios + interceptor JWT
│   └── push.js             # Lógica Web Push (VAPID)
└── utils/
    ├── fechas.js           # Conversión/comparación de fechas (UTC)
    ├── periodoCuota.js     # Cálculo de período/mes de pago
    └── verificarMora.js    # Normalización de respuesta de mora
```

### 4.3 Integración con el backend
- Todas las peticiones usan `VITE_API_URL` como base (API REST).
- El interceptor de Axios inyecta `Authorization: Bearer <token>` en cada request.
- Endpoints consumidos: `/auth/*`, `/apartamentos`, `/arrendatarios`, `/contratos`, `/pagos`, `/subscriptions/user/me`.
- Formato de moneda: **COP** (`es-CO`), sin decimales.

### 4.4 Variables de entorno
| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend API |
| `VITE_PORT` | Puerto de desarrollo (5173) |
| `VITE_VAPID_PUBLIC_KEY` | Clave pública VAPID para push |
| `VITE_SUPPORT_EMAIL` | Correo de soporte |
| `VITE_SUPPORT_PHONE_DISPLAY` | Teléfono de soporte (visual) |
| `VITE_SUPPORT_WHATSAPP` | Número de WhatsApp (dígitos) |

---

## 5. Rutas de la aplicación

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/login` | Pública | Inicio de sesión |
| `/register` | Pública | Registro |
| `/validate-otp` | Pública | Verificación OTP |
| `/forgot-password` | Pública | Recuperar contraseña |
| `/reset-password` | Pública | Restablecer contraseña |
| `/share` | Pública | Destino de contenido compartido |
| `/dashboard` | Privada | Panel principal |
| `/apartamentos` | Privada | Gestión de apartamentos |
| `/arrendatarios` | Privada | Gestión de arrendatarios |
| `/contratos` | Privada | Gestión de contratos |
| `/pagos` | Privada | Gestión de pagos |
| `/ayuda` | Privada | Ayuda y soporte |
| `/suscripcion` | Privada | Mi suscripción |
| `/` | — | Redirección a `/dashboard` |

> La app se sirve bajo el basename `/myrentta-app`.

---

## 6. Requisitos para el sitio web

El sitio web institucional debe cumplir los siguientes propósitos y enlazar correctamente con la app:

### 6.1 Objetivos del sitio
1. **Presentar el producto**: qué es MyRentta y a quién va dirigido.
2. **Explicar los módulos**: apartamentos, arrendatarios, contratos, pagos, mora, suscripción.
3. **Mostrar beneficios/valor**: control financiero, movilidad (PWA), notificaciones.
4. **Llamado a la acción (CTA)**: "Iniciar sesión" / "Registrarse" → apunta a la app.
5. **Canales de soporte**: email y WhatsApp coherentes con la app.

### 6.2 Enlaces sugeridos desde el sitio web
- Botón **Iniciar sesión** → `https://<dominio>/myrentta-app/login`
- Botón **Registrarse** → `https://<dominio>/myrentta-app/register`
- Sección **Ayuda** → `https://<dominio>/myrentta-app/ayuda`
- Enlaces a tiendas/instalación de la PWA (instalar en móvil/escritorio).

### 6.3 Coherencia de marca
- Nombre: **MyRentta**
- Color de marca (theme-color): `#1aa3e1`
- Idioma: **Español**
- Moneda referenciada: **COP**
- Tipografía: Roboto (coincidente con la app)

### 6.4 Contenido recomendado por sección del sitio
- **Inicio / Hero**: título, subtítulo y CTAs.
- **Características**: tarjetas por módulo (ver sección 3).
- **Cómo funciona**: registro → crear apartamentos → dar de alta arrendatarios → crear contratos → registrar pagos → recibir alertas.
- **Precios / Planes**: basado en el módulo de Suscripción.
- **FAQ / Ayuda**: canales de contacto (email y WhatsApp).
- **Footer**: enlaces a la app, soporte y legal.

---

## 7. Notas para desarrolladores del sitio

- La aplicación es una **SPA/PWA** servida bajo `/myrentta-app`; el sitio web puede vivir en la raíz (`/`) del mismo dominio.
- El backend es una API REST externa configurable vía `VITE_API_URL`.
- Para entornos de producción, el build genera la carpeta `dist/` (comando `npm run build`).
- Los datos de soporte (email/WhatsApp) deben coincidir entre sitio web y app para evitar confusión al usuario.

---

*Documento generado como base para la creación del sitio web de MyRentta. Refleja el estado actual del frontend en `main`.*
