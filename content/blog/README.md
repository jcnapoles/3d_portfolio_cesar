# Blog: cómo publicar

Cada post es un archivo Markdown. Al hacer merge a `main`, Netlify construye el sitio y genera las páginas
estáticas del blog (más RSS y sitemap). No hay base de datos ni CMS que mantener.

## Idiomas

```
content/blog/en/2026-11-04-modular-monolith-first.md   →  /blog/modular-monolith-first/
content/blog/es/2026-11-04-modular-monolith-first.md   →  /es/blog/monolito-modular-primero/
```

- La carpeta decide el idioma (`en/` o `es/`). No hace falta el campo `lang`.
- **Mismo nombre de archivo = traducción.** Así se enlazan las dos versiones (botón "Read in English" /
  "Leer en español", selector EN/ES y `hreflang` para Google).
- Cada versión tiene su propio `slug` (pon el slug en el idioma del post, ayuda al SEO).
- Un post puede existir solo en un idioma: aparece solo en ese blog.

## Flujo

1. Copia `_template.md` a `en/` y/o `es/` como `AAAA-MM-DD-nombre.md` (la fecha del nombre es solo para
   ordenar).
2. Escribe con `draft: true` y míralo en local: `npm run dev` → http://localhost:5173/blog/ o /es/blog/
   (en local se ven los borradores con la etiqueta DRAFT).
3. Cuando esté listo, pon `draft: false`, abre un PR (Netlify te da una URL de preview, que también muestra los
   borradores) y haz merge.

Programar un post: pon una `date` futura. Se publica en el primer deploy a partir de ese día
(para que salga solo, un build hook diario de Netlify).

## Categorías (`category`)

| Valor     | Sección   | Para qué                                                          | Bloque obligatorio |
|-----------|-----------|-------------------------------------------------------------------|--------------------|
| `cto-log` | CTO Log / Bitácora CTO | Lo que te pasa como CTO: decisiones, equipos, incidentes, lecciones | —                  |
| `launch`  | Launches / Lanzamientos | Publicidad de tus productos: lanzamientos, features               | `product`          |
| `signal`  | Signals / Señales | Comentar noticias del sector                                      | `source`           |

## Frontmatter

```yaml
title: "Título"                 # obligatorio
summary: "1-2 frases."          # obligatorio: tarjeta, meta description y RSS
date: 2026-11-12                # obligatorio
updated: 2026-11-20             # opcional
category: cto-log               # cto-log | launch | signal
tags: [arquitectura, equipos]   # opcional
slug: mi-post                   # opcional, si no sale del nombre del archivo (sin la fecha)
featured: false                 # destacado en la portada del blog
draft: true                     # no se publica mientras sea true
cover: /blog/mi-post/cover.jpg  # opcional, en public/blog/<slug>/
coverAlt: "Descripción"
product:                        # obligatorio en launch
  name: CalendaVibe
  url: https://calendavibe.com/en
  cta: Try CalendaVibe free
  pitch: Una frase de venta.
source:                         # obligatorio en signal: cita siempre la noticia
  title: Título de la noticia
  url: https://...
  publisher: Medio
```

El build falla con un mensaje claro si falta un campo obligatorio, la categoría no existe o un slug se repite.

## Reglas editoriales

- Nada confidencial de clientes (auditorías, proveedores, volúmenes) sin su aprobación.
- Cifras solo si las puedes defender (mismas reglas que el resto del sitio).
- En `signal`, comenta y enlaza; no copies párrafos de la noticia.
