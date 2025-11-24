# Calidad UAM

Sistema de gestión de calidad para la Universidad Autónoma de Manizales (UAM). Esta aplicación permite gestionar líneas estratégicas, objetivos, indicadores, POAs (Plan Operativo Anual), áreas, carreras y facultades.

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd calidad-uam
```

2. Instala las dependencias:
```bash
npm install
```

### Ejecutar el Proyecto

#### Modo Desarrollo
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

#### Compilar para Producción
```bash
npm run build
```

#### Previsualizar Build de Producción
```bash
npm run preview
```

## 📁 Arquitectura del Proyecto

Este proyecto sigue una arquitectura basada en **MVVM (Model-View-ViewModel)** con React y TypeScript.

### Estructura de Carpetas

```
calidad-uam/
├── public/                 # Archivos estáticos (imágenes, favicon)
│   ├── logo.png
│   └── vite.svg
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── ActividadForm/  # Formulario modal para actividades
│   │   ├── AreaForm/       # Formulario modal para áreas
│   │   ├── CarreraForm/    # Formulario modal para carreras
│   │   ├── FacultadForm/   # Formulario modal para facultades
│   │   ├── IndicadorForm/   # Formulario modal para indicadores
│   │   ├── Layout/         # Layout principal con Sidebar
│   │   ├── LineaForm/      # Formulario modal para líneas estratégicas
│   │   ├── ObjetivoForm/   # Formulario modal para objetivos
│   │   ├── ProtectedRoute/ # Componente para rutas protegidas
│   │   ├── Sidebar/        # Barra lateral de navegación
│   │   └── UAMLogo/        # Componente del logo UAM
│   ├── models/             # Modelos de datos (TypeScript interfaces)
│   │   ├── Area.ts
│   │   ├── Carrera.ts
│   │   ├── Facultad.ts
│   │   ├── Indicador.ts
│   │   ├── Linea.ts
│   │   ├── Objetivo.ts
│   │   ├── POA.ts
│   │   └── User.ts
│   ├── viewmodels/         # ViewModels (lógica de negocio)
│   │   ├── AuthViewModel.ts      # Gestión de autenticación
│   │   ├── IndicadorViewModel.ts # Gestión de indicadores
│   │   ├── LineaViewModel.ts     # Gestión de líneas estratégicas
│   │   ├── LoginViewModel.ts      # Lógica del login
│   │   ├── ObjetivoViewModel.ts   # Gestión de objetivos
│   │   └── POAViewModel.ts        # Gestión de POAs, áreas, carreras y facultades
│   ├── views/              # Vistas/páginas principales
│   │   ├── Area/           # Gestión de áreas
│   │   ├── Carrera/        # Gestión de carreras
│   │   ├── CreatePOA/      # Crear nuevo POA
│   │   ├── EditPOA/        # Editar POA existente
│   │   ├── Facultades/     # Gestión de facultades
│   │   ├── Home/           # Página de inicio
│   │   ├── Indicadores/    # Gestión de indicadores
│   │   ├── Linea/          # Gestión de líneas estratégicas
│   │   ├── Login/          # Página de login
│   │   ├── Objetivos/      # Gestión de objetivos
│   │   └── POAs/           # Lista de POAs
│   ├── App.tsx             # Componente raíz y configuración de rutas
│   ├── App.css             # Estilos globales de la aplicación
│   ├── index.css           # Variables CSS globales y estilos base
│   └── main.tsx            # Punto de entrada de la aplicación
├── index.html              # HTML principal
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración de Vite
```

## 🏗️ Arquitectura MVVM

### Modelos (`models/`)
Contienen las interfaces TypeScript que definen la estructura de datos:
- **Linea**: Líneas estratégicas con plan, fechas, color
- **Objetivo**: Objetivos relacionados con líneas estratégicas
- **Indicador**: Indicadores con frecuencia, meta, estado
- **POA**: Plan Operativo Anual con actividades
- **Actividad**: Actividades del POA con frecuencia y relaciones
- **Area**: Áreas organizacionales
- **Carrera**: Carreras con facultad asociada
- **Facultad**: Facultades de la universidad
- **User**: Modelo de usuario y autenticación

### ViewModels (`viewmodels/`)
Contienen la lógica de negocio y gestión de estado:
- **Patrón Observer**: Usan suscripciones para notificar cambios
- **Gestión de datos**: CRUD operations para cada entidad
- **Estado centralizado**: Cada ViewModel maneja su propio estado

### Vistas (`views/`)
Componentes de presentación que:
- Muestran datos al usuario
- Capturan interacciones del usuario
- Se suscriben a ViewModels para recibir actualizaciones

### Componentes (`components/`)
Componentes reutilizables:
- **Formularios modales**: Para crear/editar entidades
- **Layout**: Estructura principal con Sidebar
- **ProtectedRoute**: Protección de rutas autenticadas

## 🎨 Sistema de Diseño

### Colores
El proyecto usa un sistema de variables CSS con tema **Celeste y Blanco**:

- **Color Primario**: `#0099a8` (Celeste)
- **Color Secundario**: `#FFFFFF` (Blanco)
- Variables CSS definidas en `src/index.css`:
  - `--color-primary`: Celeste principal
  - `--color-primary-dark`: Celeste oscuro (hover)
  - `--color-primary-light`: Celeste claro
  - `--color-primary-lighter`: Celeste muy claro
  - `--color-secondary`: Blanco
  - `--color-text-primary`: Texto oscuro
  - `--color-text-on-primary`: Texto blanco sobre celeste

## 🔐 Autenticación

El sistema incluye autenticación básica:
- **Login**: Página de inicio de sesión
- **ProtectedRoute**: Componente que protege rutas
- **AuthViewModel**: Gestión del estado de autenticación

## 📋 Funcionalidades Principales

### Líneas Estratégicas
- Crear, editar y eliminar líneas estratégicas
- Asignar plan (institucional/nacional)
- Configurar fechas y duración
- Asignar colores personalizados

### Objetivos
- Crear objetivos relacionados con líneas estratégicas
- Códigos de referencia únicos
- Filtrado por línea estratégica

### Indicadores
- Crear indicadores relacionados con objetivos
- Configurar frecuencia de reporte (Mensual, Trimestral, Semestral, Anual)
- Definir metas y unidades de medida
- Estados: Activo, Inactivo, En Revisión, Completado

### POAs (Plan Operativo Anual)
- Crear POAs para Áreas o Carreras
- Definir período (año) y fechas
- Gestionar actividades:
  - Agregar actividades con frecuencia de reporte
  - Relacionar con línea estratégica, objetivo e indicador
  - Las fechas de las actividades se toman del POA
- Editar y eliminar POAs

### Áreas, Carreras y Facultades
- CRUD completo para cada entidad
- Filtrado de carreras por facultad
- Validación de eliminación (previene eliminar entidades en uso)

## 🛠️ Tecnologías Utilizadas

- **React 19.2.0**: Biblioteca de UI
- **TypeScript 5.9.3**: Tipado estático
- **Vite 7.1.7**: Build tool y dev server
- **React Router DOM 7.9.5**: Enrutamiento
- **CSS Variables**: Sistema de diseño con variables CSS

## 📝 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Compila el proyecto para producción
- `npm run preview`: Previsualiza el build de producción

## 🎯 Rutas de la Aplicación

- `/login` - Página de login
- `/home` - Página de inicio
- `/linea` - Gestión de líneas estratégicas
- `/objetivos` - Gestión de objetivos
- `/indicadores` - Gestión de indicadores
- `/create-poa` - Crear nuevo POA
- `/poas` - Lista de POAs
- `/edit-poa/:id` - Editar POA
- `/area` - Gestión de áreas
- `/carrera` - Gestión de carreras
- `/facultades` - Gestión de facultades

## 🔄 Flujo de Datos

1. **Usuario interactúa** con la vista
2. **Vista llama** a métodos del ViewModel
3. **ViewModel actualiza** su estado interno
4. **ViewModel notifica** a todos los suscriptores
5. **Vista se actualiza** automáticamente

## 📦 Estado de la Aplicación

El estado se gestiona mediante ViewModels que:
- Mantienen datos en memoria
- Implementan patrón Observer para notificaciones
- Proporcionan métodos CRUD para cada entidad
- Validan operaciones antes de ejecutarlas

## 🎨 Personalización de Colores

Para cambiar los colores del tema, edita las variables CSS en `src/index.css`:

```css
:root {
  --color-primary: #0099a8; /* Cambia este valor */
  --color-primary-dark: #007a86;
  --color-primary-light: #4db8c4;
  /* ... más variables */
}
```

## 📄 Licencia

Este proyecto es privado y pertenece a la Universidad Autónoma de Manizales.

