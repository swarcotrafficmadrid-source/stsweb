# 📱 SWARCO SAT Mobile App

Aplicación móvil para técnicos SAT de SWARCO Traffic Spain.

## 🚀 Características

- ✅ Login con credenciales existentes
- ✅ Dashboard de tickets
- ✅ Crear tickets (incidencias, repuestos, compras, asistencias)
- ✅ Captura de fotos optimizada
- ✅ Escaneo de códigos QR
- ✅ Geolocalización automática
- ✅ Modo offline (próximamente)
- ✅ Notificaciones push (próximamente)

## 🛠️ Tecnologías

- **React Native** con Expo
- **Expo Camera** para fotos
- **Expo Location** para GPS
- **React Navigation** para navegación
- **Axios** para API calls

## 📦 Instalación

### Prerequisitos:

```bash
# Instalar Node.js (si no lo tienes)
# Descargar desde: https://nodejs.org/

# Instalar Expo CLI globalmente
npm install -g expo-cli
```

### Setup:

```bash
cd mobile
npm install
```

## 🏃 Ejecución

### En Desarrollo:

```bash
# Iniciar Expo
npm start

# Escanear QR con Expo Go app (iOS/Android)
# O presionar:
# - a: Android emulator
# - i: iOS simulator
# - w: Web browser
```

### En Expo Go App:

1. Descargar "Expo Go" desde App Store / Play Store
2. Escanear el QR que muestra Expo
3. La app se cargará en tu teléfono

## 📱 Pantallas Disponibles

### 1. LoginScreen
- Login con email/password
- Conecta con backend existente
- Guarda token en AsyncStorage

### 2. DashboardScreen
- Lista de todos los tickets
- Stats: Total, Pendientes, Resueltos
- Pull to refresh
- Navegación a detalles

### 3. CreateTicketScreen
- Formulario para nuevo ticket
- Upload de fotos (desde cámara o galería)
- Escaneo de QR para autocompletar
- Captura de GPS automática

### 4. CameraScreen
- Captura de fotos con cámara nativa
- Flip entre cámara frontal/trasera
- Preview y confirmación

### 5. QRScannerScreen
- Escaneo de QR codes
- Validación de formato SWARCO
- Autocompletar datos del equipo

### 6. TicketDetailScreen
- Detalles completos del ticket
- Timeline de estados
- Comentarios
- Galería de fotos

## 🔧 Configuración

### API URL

Editar en cada pantalla:

```javascript
const API_URL = 'https://stsweb-backend-964379250608.europe-west1.run.app';
```

O mejor, crear archivo `src/config/api.js`:

```javascript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 
  'https://stsweb-backend-964379250608.europe-west1.run.app';
```

## 📲 Build para Producción

### Android (APK):

```bash
# Build para Android
expo build:android

# O con EAS Build (recomendado)
eas build --platform android
```

### iOS (IPA):

```bash
# Requiere cuenta de Apple Developer
eas build --platform ios
```

## 🧪 Testing

### En Emulador Android:

```bash
npm run android
```

### En Simulador iOS (solo Mac):

```bash
npm run ios
```

### En Navegador:

```bash
npm run web
```

## 📝 Estructura del Proyecto

```
mobile/
├── App.js                    # Entry point + Navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js           ✅ Creado
│   │   ├── DashboardScreen.js       ✅ Creado
│   │   ├── CreateTicketScreen.js    ⏳ Por crear
│   │   ├── TicketDetailScreen.js    ⏳ Por crear
│   │   ├── CameraScreen.js          ✅ Creado
│   │   └── QRScannerScreen.js       ✅ Creado
│   ├── components/
│   │   └── (componentes reutilizables)
│   └── utils/
│       └── api.js                   ⏳ Helper de API
└── assets/
    ├── icon.png                     ⏳ Logo SWARCO
    ├── splash.png                   ⏳ Splash screen
    └── adaptive-icon.png            ⏳ Android icon
```

## 🎨 Diseño

### Colores SWARCO:

```javascript
const colors = {
  primary: '#006BAB',    // SWARCO Blue
  secondary: '#F29200',  // SWARCO Orange
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F8FAFC',
  text: '#1E293B',
};
```

## 🔐 Seguridad

- Token JWT almacenado en AsyncStorage
- HTTPS obligatorio
- Validación de inputs
- Permisos de cámara/ubicación

## 📊 Estado Actual

### Completado:
- ✅ Estructura base (Expo + React Native)
- ✅ Navegación configurada
- ✅ LoginScreen
- ✅ DashboardScreen
- ✅ CameraScreen
- ✅ QRScannerScreen

### Pendiente:
- ⏳ CreateTicketScreen (formulario completo)
- ⏳ TicketDetailScreen (timeline + comentarios)
- ⏳ Assets (logos, splash)
- ⏳ Notificaciones push
- ⏳ Modo offline

**Progreso: 60%**

## 📞 Soporte

**Email:** sfr.support@swarco.com  
**Docs Backend:** ../API_REST_DOCUMENTATION.md  

---

**Versión:** 1.0.0  
**Última actualización:** 2026-01-23  
**Estado:** ✅ En Desarrollo
