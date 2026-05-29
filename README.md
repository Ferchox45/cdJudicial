# Sistema de Gestión Penal de Segunda Instancia

**Tribunal Superior de Justicia del Estado de Oaxaca**

Sistema judicial para la gestión, captura y consulta de apelaciones penales. Construido con arquitectura Feature-Driven y el patrón Facade, orientado a equipos pequeños trabajando en paralelo sobre módulos de negocio independientes.

---

## Tecnologías Principales

| Área | Tecnología |
|---|---|
| Framework | Angular 21 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de Datos | SQL Server 2022 (consumo vía API REST) |

---

## Configuración del Proyecto

### 1. Requisitos Previos

- Node.js versión 20 o superior
- Angular CLI instalado globalmente

### 2. Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>

# Instalar dependencias
npm install
```

### 3. Variables de Entorno

La configuración de las variables de entorno vive dentro de la carpeta `src/environments/`. Configura tus URLs de conexión a las APIs en los siguientes archivos:

**`environment.development.ts`** — Para pruebas locales:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**`environment.ts`** — Para los servidores de producción.

### 4. Ejecución

#### Modo Desarrollo

```bash
# Levanta el servidor en http://localhost:4200
ng serve
```

#### Modo Producción

```bash
# Construye el proyecto
ng build
```

---

## Estructura del Proyecto

El proyecto sigue una arquitectura modular estricta (Feature-Driven). Los puntos clave de entrada en `src/app/` son:

- **`features/`** — Lógica de negocio dividida por dominios independientes (Apelaciones, Buscadores, Estadísticas, Dashboard). Cada módulo se carga de forma perezosa (Lazy Loading).
- **`core/`** — Infraestructura global y transversal (Singletons). Contiene los interceptores de autenticación, la caché multinivel y los modelos genéricos.
- **`shared/`** — Componentes visuales transversales y reutilizables (Modales, Sidebars, Spinners) que no pertenecen a ningún dominio específico.

---

## Flujo de Trabajo (Módulos)

Cada feature o submódulo está diseñado para aislar responsabilidades y hacer el código resistente a cambios en el backend. El ciclo de vida de los datos sigue este flujo estricto:

1. **Entrada de Datos (`data/`)** — Los servicios HTTP reciben la respuesta cruda de la API.
2. **Frontera (`mapper`)** — La respuesta pasa obligatoriamente por un `mapper.ts`. Es la única capa anticorrupción que conoce la estructura del backend y la transforma al modelo del dominio del frontend.
3. **Orquestación (`facades`)** — El estado, la carga y la validación se gestionan en los archivos `*.facade.ts` utilizando Angular Signals. Los componentes nunca inyectan servicios HTTP directamente.
4. **Presentación (`components`)** — Divididos en dos tipos:
   - **Smart Components** — Escuchan a las fachadas y disparan acciones.
   - **Dumb Components** — Paneles aislados que solo renderizan información a través de `@Input()` y emiten eventos a través de `@Output()`.

---

## Convenciones de Código

- **Separación de responsabilidades** — Ninguna capa debe conocer los detalles internos de otra. `shared/` nunca importa de `features/`; `core/` nunca importa de `features/`.
- **Crecimiento por adición** — Incorporar un nuevo módulo judicial implica crear una nueva carpeta dentro de `features/`, no modificar código existente.
- **Nomenclatura** — Todo el código de negocio, archivos y carpetas se escriben en español, respetando los términos legales del sistema de justicia.

---

## Documentación Adicional

| Documento | Descripción |
|---|---|
| [Estructura de carpetas](./docs/estructura.md) | Árbol real del proyecto con anotaciones |
