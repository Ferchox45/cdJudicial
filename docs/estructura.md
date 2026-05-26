# Estructura de Carpetas

```
sisGestionPenal/
├── src/
│   ├── app/
│   │   ├── core/                      # Infraestructura global (Singletons)
│   │   │   ├── auth/
│   │   │   ├── models/                # Contratos de datos globales
│   │   │   └── services/              # Comunicación con API + caché
│   │   │
│   │   ├── features/                  # Módulos de negocio independientes
│   │   │   ├── apelaciones/           # Dominio: gestión de apelaciones
│   │   │   │   ├── anexos/
│   │   │   │   ├── busqueda-apelaciones/
│   │   │   │   └── captura-apelaciones/
│   │   │   │       ├── components/
│   │   │   │       ├── data/
│   │   │   │       ├── facades/
│   │   │   │       ├── models/
│   │   │   │       ├── utils/
│   │   │   │       ├── captura-apelaciones.component.html
│   │   │   │       ├── captura-apelaciones.routes.ts
│   │   │   │       └── captura-apelacones.component.ts
│   │   │   │
│   │   │   ├── auth/                  # Dominio: Autenticación
│   │   │   │   ├── login/
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── buscadores/            # Dominio: Búsquedas transversales
│   │   │   │   ├── buscador-historico/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── data/
│   │   │   │   │   ├── facades/
│   │   │   │   │   ├── models/
│   │   │   │   │   ├── utils/
│   │   │   │   │   ├── buscadorHistorico.component.html
│   │   │   │   │   └── buscadorHistorico.component.ts
│   │   │   │   ├── buscador-plano/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── data/
│   │   │   │   │   ├── facades/
│   │   │   │   │   ├── models/
│   │   │   │   │   ├── utils/
│   │   │   │   │   ├── buscadorPlano.component.html
│   │   │   │   │   └── buscadorPlano.component.ts
│   │   │   │   └── buscadores.routes.ts
│   │   │   │
│   │   │   ├── dashboard/             # Shell de la aplicación
│   │   │   │   ├── components/
│   │   │   │   └── data/
│   │   │   │
│   │   │   └── estadisticas/          # Dominio: Reportes y gráficas
│   │   │       └── estadisticas-plana/
│   │   │           ├── components/
│   │   │           ├── data/
│   │   │           ├── facades/
│   │   │           ├── models/
│   │   │           ├── util/
│   │   │           ├── estadisticas.routes.ts
│   │   │           ├── estadisticasPlana.component.html
│   │   │           └── estadisticasPlana.component.ts
│   │   │
│   │   ├── shared/                    # Elementos transversales reutilizables
│   │   │   └── components/
│   │   │       ├── Action-siderbar/
│   │   │       ├── modal-custom/
│   │   │       ├── paginacion/
│   │   │       └── spinner/
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.css
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   └── app.ts
│   │
│   ├── assets/
│   │   └── images/
│   │       └── logo-oaxaca.png
│   ├── environments/
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
│
├── .editorconfig
```

---

## Anatomía de una feature

Cada sub-módulo de negocio sigue esta estructura interna consistente:

```
nombre-feature/
├── components/        # Dumb components — solo inputs/outputs, sin lógica
│   └── nombre-panel/
│       ├── nombre-panel.component.ts
│       └── nombre-panel.component.html
│
├── data/              # HTTP puro — solo HttpClient, sin estado ni lógica
│   └── nombre-api.service.ts
│
├── facades/           # Orquestación — estado (Signals), lógica de negocio
│   ├── busqueda.facade.ts
│   ├── catalogos.facade.ts
│   └── guardar.facade.ts
│
├── models/            # Interfaces TypeScript del dominio local
│   └── nombre.model.ts
│
├── utils/             # Funciones puras sin estado (mappers, helpers)
│   └── nombre.mapper.ts
│
├── nombre.component.ts      # Smart component — orquesta fachadas y paneles
├── nombre.component.html
└── nombre.routes.ts         # Lazy loading standalone
```

