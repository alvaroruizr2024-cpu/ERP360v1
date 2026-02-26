# ERP360 - INNOVAQ Solutions

Sistema de Gestion Empresarial | Company Manager App

## Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **Base de datos y Auth:** Supabase
- **Estilos:** Tailwind CSS
- **Despliegue:** Vercel (recomendado)

## Estructura del Proyecto

```
src/
  app/
    (auth)/login/       # Pagina de login
    dashboard/          # Layout con sidebar
      ventas/           # Modulo de ventas
      compras/          # Modulo de compras
      inventario/       # Modulo de inventario
      contabilidad/     # Modulo de contabilidad
      rrhh/             # Modulo de RRHH
      crm/              # Modulo de CRM
  components/
    layout/sidebar.tsx  # Sidebar de navegacion
  lib/
    supabase/
      client.ts         # Cliente Supabase (browser)
      server.ts         # Cliente Supabase (server)
      middleware.ts      # Manejo de sesion
  types/
    database.ts         # Tipos de Supabase
```

## Configuracion

1. Clonar el repositorio
2. Copiar `.env.local.example` a `.env.local` y completar las credenciales de Supabase
3. Instalar dependencias: `npm install`
4. Ejecutar en desarrollo: `npm run dev`

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de produccion
npm run start    # Iniciar produccion
npm run lint     # Ejecutar ESLint
```
