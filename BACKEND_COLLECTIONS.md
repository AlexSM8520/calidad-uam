# Especificación de Colecciones para Backend - Calidad UAM

Este documento describe todas las colecciones (tablas/entidades) necesarias para implementar el backend de la aplicación Calidad UAM.

---

## 1. **users** (Usuarios)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único (MongoDB) o UUID
  username: string,                 // REQUERIDO, ÚNICO, min: 3, max: 50
  password: string,                 // REQUERIDO, hash (bcrypt/argon2), min: 3
  email: string,                    // OPCIONAL, formato email válido, único si existe
  nombre: string,                   // OPCIONAL, max: 100
  apellido: string,                 // OPCIONAL, max: 100
  rol: enum,                         // REQUERIDO, valores: ['Administrador', 'Usuario']
  activo: boolean,                  // REQUERIDO, default: true
  carreraId: ObjectId,              // OPCIONAL, referencia a carreras._id (solo si rol='Usuario')
  areaId: ObjectId,                 // OPCIONAL, referencia a areas._id (solo si rol='Usuario')
  createdAt: Date,                  // REQUERIDO, fecha de creación
  updatedAt: Date                   // REQUERIDO, fecha de última actualización
}
```

### Validaciones:
- `username` debe ser único
- `email` debe ser único si se proporciona
- Si `rol === 'Usuario'`, debe tener `carreraId` O `areaId` (no ambos, no ninguno)
- Si `rol === 'Administrador'`, no debe tener `carreraId` ni `areaId`
- No se puede eliminar el último administrador activo

### Índices:
- `username`: único
- `email`: único (sparse index)
- `carreraId`: índice normal
- `areaId`: índice normal
- `rol`: índice normal

---

## 2. **facultades** (Facultades)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, único, max: 200
  descripcion: string,              // OPCIONAL, max: 1000
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- `nombre` debe ser único
- No se puede eliminar si hay carreras asociadas

### Índices:
- `nombre`: único

---

## 3. **carreras** (Carreras)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, único, max: 200
  descripcion: string,              // OPCIONAL, max: 1000
  facultad: string,                 // REQUERIDO, nombre de la facultad (texto)
  facultadId: ObjectId,             // OPCIONAL, referencia a facultades._id (si se normaliza)
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- `nombre` debe ser único
- Si se usa `facultadId`, debe existir en `facultades`
- No se puede eliminar si hay POAs o usuarios asociados

### Índices:
- `nombre`: único
- `facultadId`: índice normal (si se usa)

---

## 4. **areas** (Áreas)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, único, max: 200
  descripcion: string,              // OPCIONAL, max: 1000
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- `nombre` debe ser único
- No se puede eliminar si hay POAs o usuarios asociados

### Índices:
- `nombre`: único

---

## 5. **lineas** (Líneas Estratégicas)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, único, max: 200
  descripcion: string,              // REQUERIDO, max: 2000
  duracion: number,                 // REQUERIDO, en meses, min: 1
  fechaInicio: Date,                // REQUERIDO, formato ISO 8601
  fechaFin: Date,                   // REQUERIDO, formato ISO 8601, debe ser > fechaInicio
  color: string,                     // REQUERIDO, formato hex (#RRGGBB), default: '#0099a8'
  plan: enum,                        // REQUERIDO, valores: ['Plan institucional', 'Plan nacional']
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- `nombre` debe ser único
- `fechaFin` debe ser mayor que `fechaInicio`
- `duracion` debe coincidir con la diferencia entre fechas (aproximadamente)
- `color` debe ser un hex válido

### Índices:
- `nombre`: único
- `fechaInicio`: índice normal
- `fechaFin`: índice normal

---

## 6. **objetivos** (Objetivos)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, max: 200
  descripcion: string,              // REQUERIDO, max: 2000
  codigoReferencia: string,         // REQUERIDO, único, max: 50
  lineaId: ObjectId,                // REQUERIDO, referencia a lineas._id
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- `codigoReferencia` debe ser único
- `lineaId` debe existir en `lineas`
- No se puede eliminar si hay indicadores asociados

### Índices:
- `codigoReferencia`: único
- `lineaId`: índice normal

---

## 7. **indicadores** (Indicadores)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  nombre: string,                   // REQUERIDO, max: 200
  descripcion: string,             // REQUERIDO, max: 2000
  calculo: string,                 // REQUERIDO, descripción del cálculo, max: 1000
  codigo: string,                  // REQUERIDO, único, max: 50
  frecuencia: enum,                // REQUERIDO, valores: ['Mensual', 'Trimestral', 'Semestral', 'Anual']
  unidad: string,                  // REQUERIDO, max: 50 (ej: 'porcentaje', 'cantidad', 'días')
  meta: number,                    // REQUERIDO, min: 0
  estado: enum,                    // REQUERIDO, valores: ['Activo', 'Inactivo', 'En Revisión', 'Completado'], default: 'Activo'
  lineaId: ObjectId,               // REQUERIDO, referencia a lineas._id
  objetivoId: ObjectId,            // REQUERIDO, referencia a objetivos._id
  createdAt: Date,                 // REQUERIDO
  updatedAt: Date                  // REQUERIDO
}
```

### Validaciones:
- `codigo` debe ser único
- `lineaId` debe existir en `lineas`
- `objetivoId` debe existir en `objetivos`
- El `objetivoId` debe pertenecer a la misma `lineaId`
- No se puede eliminar si hay actividades asociadas

### Índices:
- `codigo`: único
- `lineaId`: índice normal
- `objetivoId`: índice normal
- `estado`: índice normal

---

## 8. **poas** (Plan Operativo Anual)

### Campos:
```typescript
{
  _id: ObjectId,                    // ID único
  tipo: enum,                       // REQUERIDO, valores: ['carrera', 'area']
  areaId: ObjectId,                 // OPCIONAL, referencia a areas._id (si tipo='area')
  carreraId: ObjectId,              // OPCIONAL, referencia a carreras._id (si tipo='carrera')
  periodo: number,                  // REQUERIDO, año (ej: 2024), min: 2000, max: 2100
  fechaInicio: Date,                // REQUERIDO, formato ISO 8601
  fechaFin: Date,                   // REQUERIDO, formato ISO 8601, debe ser > fechaInicio
  actividades: Array<Actividad>,    // REQUERIDO, array de subdocumentos (ver abajo)
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date,                  // REQUERIDO
  createdBy: ObjectId,              // OPCIONAL, referencia a users._id (quien creó)
  updatedBy: ObjectId               // OPCIONAL, referencia a users._id (quien actualizó)
}
```

### Subdocumento: Actividad
```typescript
{
  _id: ObjectId,                    // ID único del subdocumento
  nombre: string,                   // REQUERIDO, max: 200
  descripcion: string,              // REQUERIDO, max: 2000
  fechaInicio: Date,                // REQUERIDO, debe estar entre fechaInicio y fechaFin del POA
  fechaFin: Date,                   // REQUERIDO, debe estar entre fechaInicio y fechaFin del POA, debe ser >= fechaInicio
  responsable: string,              // REQUERIDO, max: 200
  estado: enum,                     // REQUERIDO, valores: ['Pendiente', 'En Progreso', 'Completada', 'Cancelada'], default: 'Pendiente'
  frecuencia: enum,                 // REQUERIDO, valores: ['Mensual', 'Trimestral', 'Semestral', 'Anual']
  lineaId: ObjectId,                // REQUERIDO, referencia a lineas._id
  objetivoId: ObjectId,             // REQUERIDO, referencia a objetivos._id
  indicadorId: ObjectId,            // REQUERIDO, referencia a indicadores._id
  createdAt: Date,                  // REQUERIDO
  updatedAt: Date                   // REQUERIDO
}
```

### Validaciones:
- Si `tipo === 'area'`, debe tener `areaId` y NO `carreraId`
- Si `tipo === 'carrera'`, debe tener `carreraId` y NO `areaId`
- `fechaFin` debe ser mayor que `fechaInicio`
- Las fechas de las actividades deben estar dentro del rango del POA
- `objetivoId` debe pertenecer a la misma `lineaId` de la actividad
- `indicadorId` debe pertenecer al mismo `objetivoId` y `lineaId` de la actividad
- No se puede tener dos POAs del mismo tipo para la misma área/carrera en el mismo período

### Índices:
- `tipo`: índice normal
- `areaId`: índice normal
- `carreraId`: índice normal
- `periodo`: índice normal
- `fechaInicio`: índice normal
- `fechaFin`: índice normal
- Índice compuesto: `{ tipo: 1, areaId: 1, periodo: 1 }` (único)
- Índice compuesto: `{ tipo: 1, carreraId: 1, periodo: 1 }` (único)

---

## Relaciones entre Colecciones

### Diagrama de Relaciones:

```
users
  ├── carreraId → carreras._id (opcional, si rol='Usuario')
  └── areaId → areas._id (opcional, si rol='Usuario')

carreras
  └── facultadId → facultades._id (opcional, si se normaliza)

poas
  ├── areaId → areas._id (si tipo='area')
  ├── carreraId → carreras._id (si tipo='carrera')
  └── actividades[]
      ├── lineaId → lineas._id
      ├── objetivoId → objetivos._id
      └── indicadorId → indicadores._id

objetivos
  └── lineaId → lineas._id

indicadores
  ├── lineaId → lineas._id
  └── objetivoId → objetivos._id
```

---

## Reglas de Negocio Importantes

### 1. **Integridad Referencial:**
- No se puede eliminar una entidad si hay referencias a ella
- Ejemplos:
  - No eliminar `facultad` si hay `carreras` asociadas
  - No eliminar `linea` si hay `objetivos` o `indicadores` asociados
  - No eliminar `objetivo` si hay `indicadores` asociados
  - No eliminar `indicador` si hay `actividades` en POAs que lo usan
  - No eliminar `area` o `carrera` si hay `poas` o `users` asociados

### 2. **Validaciones de Usuario:**
- Usuarios con rol "Usuario" solo pueden ver POAs de su `carreraId` o `areaId`
- Usuarios con rol "Administrador" pueden ver y gestionar todo
- No se puede eliminar el último administrador activo

### 3. **Validaciones de POA:**
- Un POA no puede tener actividades con fechas fuera de su rango
- Las relaciones línea-objetivo-indicador deben ser consistentes
- No puede haber dos POAs del mismo tipo para la misma entidad en el mismo período

### 4. **Validaciones de Indicadores:**
- El `objetivoId` de un indicador debe pertenecer a la misma `lineaId` del indicador

---

## Campos de Auditoría Recomendados

Todas las colecciones deberían incluir (ya están en la especificación):
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

Opcionalmente se pueden agregar:
- `createdBy`: Usuario que creó el registro
- `updatedBy`: Usuario que actualizó el registro
- `deletedAt`: Para soft delete (si se implementa)
- `deletedBy`: Usuario que eliminó (soft delete)

---

## Tipos de Datos Recomendados (MongoDB)

- `ObjectId`: Para IDs y referencias
- `String`: Para textos
- `Number`: Para números
- `Date`: Para fechas
- `Boolean`: Para valores booleanos
- `Array`: Para arrays de subdocumentos (actividades en POA)
- `Enum`: Validar en aplicación, almacenar como String

---

## Endpoints Sugeridos por Colección

### users
- `GET /api/users` - Listar usuarios (solo admin)
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario (solo admin)
- `PUT /api/users/:id` - Actualizar usuario (solo admin)
- `DELETE /api/users/:id` - Eliminar usuario (solo admin)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### facultades
- `GET /api/facultades` - Listar facultades
- `GET /api/facultades/:id` - Obtener facultad
- `POST /api/facultades` - Crear facultad (solo admin)
- `PUT /api/facultades/:id` - Actualizar facultad (solo admin)
- `DELETE /api/facultades/:id` - Eliminar facultad (solo admin)

### carreras
- `GET /api/carreras` - Listar carreras
- `GET /api/carreras/:id` - Obtener carrera
- `GET /api/carreras?facultad=nombre` - Filtrar por facultad
- `POST /api/carreras` - Crear carrera (solo admin)
- `PUT /api/carreras/:id` - Actualizar carrera (solo admin)
- `DELETE /api/carreras/:id` - Eliminar carrera (solo admin)

### areas
- `GET /api/areas` - Listar áreas
- `GET /api/areas/:id` - Obtener área
- `POST /api/areas` - Crear área (solo admin)
- `PUT /api/areas/:id` - Actualizar área (solo admin)
- `DELETE /api/areas/:id` - Eliminar área (solo admin)

### lineas
- `GET /api/lineas` - Listar líneas estratégicas
- `GET /api/lineas/:id` - Obtener línea
- `POST /api/lineas` - Crear línea (solo admin)
- `PUT /api/lineas/:id` - Actualizar línea (solo admin)
- `DELETE /api/lineas/:id` - Eliminar línea (solo admin)

### objetivos
- `GET /api/objetivos` - Listar objetivos
- `GET /api/objetivos/:id` - Obtener objetivo
- `GET /api/objetivos?lineaId=xxx` - Filtrar por línea
- `POST /api/objetivos` - Crear objetivo (solo admin)
- `PUT /api/objetivos/:id` - Actualizar objetivo (solo admin)
- `DELETE /api/objetivos/:id` - Eliminar objetivo (solo admin)

### indicadores
- `GET /api/indicadores` - Listar indicadores
- `GET /api/indicadores/:id` - Obtener indicador
- `GET /api/indicadores?objetivoId=xxx` - Filtrar por objetivo
- `GET /api/indicadores?lineaId=xxx` - Filtrar por línea
- `POST /api/indicadores` - Crear indicador (solo admin)
- `PUT /api/indicadores/:id` - Actualizar indicador (solo admin)
- `DELETE /api/indicadores/:id` - Eliminar indicador (solo admin)

### poas
- `GET /api/poas` - Listar POAs (filtrado por usuario si no es admin)
- `GET /api/poas/:id` - Obtener POA
- `POST /api/poas` - Crear POA (solo admin)
- `PUT /api/poas/:id` - Actualizar POA (solo admin)
- `DELETE /api/poas/:id` - Eliminar POA (solo admin)
- `POST /api/poas/:id/actividades` - Agregar actividad a POA (solo admin)
- `PUT /api/poas/:poaId/actividades/:actividadId` - Actualizar actividad (solo admin)
- `DELETE /api/poas/:poaId/actividades/:actividadId` - Eliminar actividad (solo admin)

---

## Notas Adicionales

1. **Autenticación y Autorización:**
   - Implementar JWT o sesiones para autenticación
   - Middleware de autorización basado en roles
   - Validar que usuarios "Usuario" solo accedan a sus POAs relacionados

2. **Validación de Datos:**
   - Usar un validador como Joi, Yup, o class-validator
   - Validar formatos de fecha, email, etc.
   - Validar relaciones entre entidades

3. **Performance:**
   - Usar paginación en listados
   - Implementar caché para datos frecuentemente consultados
   - Optimizar queries con índices apropiados

4. **Seguridad:**
   - Hash de contraseñas (bcrypt, argon2)
   - Validar y sanitizar inputs
   - Proteger contra SQL/NoSQL injection
   - Rate limiting en endpoints de autenticación

5. **Soft Delete (Opcional):**
   - Considerar implementar soft delete en lugar de eliminación física
   - Agregar campo `deletedAt` y `deletedBy`
   - Filtrar registros eliminados en queries normales

