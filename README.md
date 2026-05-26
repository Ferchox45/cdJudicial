# Sistema de Gestión Penal de Segunda Instancia

> **Tribunal Superior de Justicia**  
> Stack: Angular 21 · Tailwind CSS v4 · TypeScript · SQL Server 2022

Sistema judicial para la gestión, captura y consulta de apelaciones penales. Construido con arquitectura Feature-Driven y el patrón Facade, orientado a equipos pequeños trabajando en paralelo sobre módulos de negocio independientes.

---

## Documentación

| Documento | Descripción |
|---|---|
| [Arquitectura](./docs/arquitectura.md) | Filosofía, capas, patrones y justificación de decisiones |
| [Estructura de carpetas](./docs/estructura.md) | Árbol real del proyecto con anotaciones |
---

## Inicio rápido

```bash
npm install
ng serve
```

> Requiere Node 20+. La configuración de entorno vive en `src/environments/`.

---

## Principios no negociables

- **Separación estricta de responsabilidades** — ninguna capa conoce los detalles internos de otra.
- **Crecimiento por adición** — un módulo nuevo es una carpeta nueva en `features/`, sin tocar código existente.
- **Resistencia a cambios del backend** — los `mapper.ts` de cada feature absorben ese impacto antes de que llegue a los componentes.

---

*Última revisión: Mayo 2026*
