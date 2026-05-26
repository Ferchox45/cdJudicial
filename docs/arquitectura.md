# Arquitectura del Sistema

## Filosofía

El sistema opera en un entorno gubernamental con requisitos específicos: múltiples módulos de negocio independientes, equipos pequeños trabajando en paralelo, conectividad de red variable y necesidad de auditoría y trazabilidad de datos.

Estas condiciones dictaron tres principios:

**Separación estricta de responsabilidades.**
Ninguna capa debe conocer los detalles internos de otra. Los componentes no hablan directamente con la API; las fachadas no conocen el DOM; los servicios no conocen la UI.

**Crecimiento por adición, no por modificación.**
Incorporar un nuevo módulo judicial (amparos, sentencias) debe implicar crear una nueva carpeta en `features/`, no modificar código existente.

**Resistencia a cambios del backend.**
Los `mapper.ts` de cada feature actúan como frontera explícita, absorbiendo el impacto de cambios en la API antes de que lleguen a los componentes.

---

## Flujo de datos

```
API Response
    ↓
[mapper.ts]          ← única pieza que conoce la estructura del backend
    ↓
Domain Model
    ↓
[*.facade.ts]        ← orquesta servicios, estado y lógica de negocio
    ↓
Smart Component      ← escucha signals, dispara acciones
    ↓
Dumb Components      ← renderizan props, emiten outputs
```

---

## Capas

### `core/` — Infraestructura global

Todo lo que vive aquí es un Singleton (`providedIn: 'root'`) y no conoce ningún módulo de negocio específico.

| Subcarpeta | Responsabilidad |
|---|---|
| `auth/` | Interceptor JWT para peticiones HTTP salientes |
| `models/` | Interfaces TypeScript compartidas entre múltiples features |
| `services/` | Comunicación con la API REST e implementación de caché multinivel |

**Regla:** si un archivo de `core/` necesita importar algo de `features/`, no pertenece a `core/`.

#### Caché Multinivel

Los servicios implementan una estrategia de dos niveles:

- **Nivel 1 — Memoria RAM:** resultados de la sesión activa, acceso instantáneo.
- **Nivel 2 — `sessionStorage`:** catálogos pesados que sobreviven a la navegación dentro de la misma pestaña pero se limpian al cerrar el navegador.

Esta estrategia reduce peticiones al servidor en entornos con conectividad limitada o inestable.

---

### `features/` — Módulos de negocio

Cada feature es autónoma: tiene sus propios componentes, fachadas, mappers y modelos locales. No debe importar directamente de otras features.

#### `apelaciones/`

Dominio central del sistema, dividido en tres sub-módulos:

- **`anexos/`** — Gestión documental adjunta a las apelaciones.
- **`busqueda-apelaciones/`** — Consulta y visualización de apelaciones existentes.
- **`captura-apelaciones/`** — Registro de nuevas apelaciones. El formulario se divide en paneles especializados (`panel-formulario`, `panel-partes`, `panel-relaciones`, `modal-anexo`) para permitir desarrollo paralelo sin conflictos.

#### `buscadores/`

Motores de consulta especializados que operan sobre distintas fuentes de datos:

- **`buscador-historico/`** — Consultas sobre el registro histórico judicial.
- **`buscador-plano/`** — Búsqueda por número de expediente o datos básicos.

Ambos replican la misma estructura interna (`components/`, `facades/`, `mapper.ts`), garantizando coherencia y facilitando el onboarding.

#### `dashboard/`

Shell visual de la aplicación: `header`, `menu-lateral`, `dashmain` y `home`. Al estar dentro de `features/` con Lazy Loading, el bundle inicial es mínimo.

---

### `shared/` — Presentación transversal

Componentes visuales utilizados por más de una feature y que no pertenecen a ningún dominio específico.

| Componente | Uso |
|---|---|
| `action-sidebar/` | Panel lateral contextual reutilizable entre módulos |
| `modal-custom/` | Modal genérico configurable vía inputs |

**Regla:** los componentes de `shared/` no importan nada de `features/`. La dependencia siempre fluye en sentido contrario.

---

### `facades/` — Orquestación (dentro de cada feature)

Las fachadas desacoplan los componentes visuales de los servicios de datos. Cada sub-módulo tiene su propio directorio `facades/` con archivos por responsabilidad:

| Archivo | Responsabilidad |
|---|---|
| `busqueda.facade.ts` | Estado de búsqueda y resultados |
| `catalogos.facade.ts` | Carga y caché de catálogos |
| `guardar.facade.ts` | Flujo de validación y guardado |

Un componente Angular **nunca** llama directamente a un servicio de `core/`. Siempre pasa por su fachada.

Las fachadas usan **Angular Signals** para exponer estado reactivo:

```typescript
@Injectable()
export class BusquedaFacade {
  private readonly _service = inject(ApelacionApiService);

  readonly resultados    = signal<Apelante[]>([]);
  readonly cargando      = signal(false);
  readonly error         = signal<string | null>(null);
  readonly tieneResultados = computed(() => this.resultados().length > 0);

  buscar(criterios: BusquedaCriterios): void {
    this.cargando.set(true);
    this._service.buscar(criterios).subscribe({
      next:     (data) => this.resultados.set(data),
      error:    (err)  => this.error.set(err.message),
      complete: ()     => this.cargando.set(false),
    });
  }
}
```

---

### `mapper.ts` — Capa anticorrupción (dentro de cada feature)

Cada sub-módulo expone exactamente un archivo mapper que transforma la respuesta cruda del backend al modelo de dominio del frontend. Es la única pieza del sistema que conoce la estructura de la API.

```
API Response  →  [mapper.ts]  →  Domain Model  →  Facade  →  Component
```

Si el backend cambia un campo, el único archivo modificado es el mapper. Los componentes y fachadas no se enteran del cambio.

---

### Capa `data/` — HTTP puro (dentro de cada feature)

Cada feature organiza sus servicios HTTP en una subcarpeta `data/`. Los archivos aquí solo hacen peticiones HTTP, sin lógica de negocio ni estado.

```typescript
// data/apelacion-api.service.ts
@Injectable({ providedIn: 'root' })
export class ApelacionApiService {
  private readonly http = inject(HttpClient);

  buscarPorFolio(folio: string): Observable<BusquedaRapida> {
    return this.http.get<{ data: BusquedaRapida }>(`${API}/apelaciones/detalle`, {
      params: { folioOficialia: folio.trim() }
    }).pipe(timeout(15000), map(res => res.data));
  }
}
```

---

## Patrones aplicados

| Patrón | Dónde | Propósito |
|---|---|---|
| **Facade** | `*/facades/*.facade.ts` | Desacopla componentes de servicios y lógica de negocio |
| **Data Mapper** | `*.mapper.ts` | Transforma datos del backend; actúa como capa anticorrupción |
| **Smart / Dumb Components** | Componente raíz + paneles | El "smart" orquesta el estado; los "dumb" solo renderizan |
| **Singleton** | `core/services/` | Una instancia global para servicios de infraestructura |
| **Lazy Loading** | `app.routes.ts` | Cada feature se carga solo cuando el usuario navega a ella |
| **Caché Multinivel** | `core/services/` | RAM + `sessionStorage` para minimizar peticiones al servidor |

---

## Justificaciones clave

### ¿Por qué Feature-Based y no por tipo de archivo?

Con una arquitectura por tipo (`/components`, `/services`, `/models` en la raíz), archivos relacionados quedan dispersos. El desarrollador que trabaja en `captura-apelaciones` navega a tres ubicaciones distintas. Con Feature-Based, todo lo relacionado vive en una sola carpeta. Borrar o refactorizar ese módulo implica tocar una sola ubicación.

### ¿Por qué Fachadas y no inyectar servicios directamente?

Sin fachadas, un componente con formulario complejo inyecta 4 o 5 servicios, mezclando carga, validación, caché y guardado en el mismo archivo. La fachada centraliza esa orquestación. Dos desarrolladores pueden trabajar simultáneamente: uno en la fachada y otro en el template, sin conflictos de merge.

### ¿Por qué `core/` debe ser agnóstico al negocio?

Si `core/` contiene lógica de dominio específica, se convierte en una dependencia implícita que todo el sistema arrastra. Mantenerlo limitado a infraestructura permite que las features sean verdaderamente independientes entre sí.

### ¿Por qué Lazy Loading en todas las features?

Un capturista usa `captura-apelaciones` pero nunca toca `buscador-historico`. Sin Lazy Loading, el navegador descarga el JavaScript de todos los módulos al arrancar. Con `loadComponent`, el tiempo de arranque permanece constante independientemente de cuántos módulos se agreguen.
