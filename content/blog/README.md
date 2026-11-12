# Blog: cómo publicar

Cada post es un archivo Markdown en esta carpeta. Al hacer merge a `main`, Netlify construye el sitio y
genera las páginas estáticas de `/blog` (más RSS y sitemap). No hay base de datos ni CMS que mantener.

## Flujo

1. Copia `_template.md` como `AAAA-MM-DD-slug-del-post.md` (la fecha del nombre es solo para ordenar; el slug
   de la URL es lo que va después).
2. Escribe con `draft: true` y míralo en local: `npm run dev` → http://localhost:5173/blog/
   (en local se ven los borradores con la etiqueta DRAFT).
3. Cuando esté listo, pon `draft: false`, abre un PR (Netlify te da una URL de preview) y haz merge.

Programar un post: pon una `date` futura. Se publica en el primer deploy a partir de ese día
(para que salga solo, un build hook diario de Netlify).

## Categorías (`category`)

| Valor     | Sección   | Para qué                                                          | Bloque obligatorio |
|-----------|-----------|-------------------------------------------------------------------|--------------------|
| `cto-log` | CTO Log   | Lo que te pasa como CTO: decisiones, equipos, incidentes, lecciones | —                  |
| `launch`  | Launches  | Publicidad de tus productos: lanzamientos, features               | `product`          |
| `signal`  | Signals   | Comentar noticias del sector                                      | `source`           |

## Frontmatter

```yaml
title: "Título"                 # obligatorio
summary: "1-2 frases."          # obligatorio: tarjeta, meta description y RSS
date: 2026-11-12                # obligatorio
updated: 2026-11-20             # opcional
category: cto-log               # cto-log | launch | signal
tags: [arquitectura, equipos]   # opcional
lang: es                        # en (por defecto) | es
featured: false                 # destacado en la portada del blog
draft: true                     # no se publica mientras sea true
cover: /blog/mi-post/cover.jpg  # opcional, en public/blog/<slug>/
coverAlt: "Descripción"
slug: otro-slug                 # opcional, si no sale del nombre del archivo
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
