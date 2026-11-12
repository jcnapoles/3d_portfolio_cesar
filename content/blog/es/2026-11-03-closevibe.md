---
title: "Closevibe: IA que atiende a tus clientes en WhatsApp, Instagram, Messenger y email"
slug: closevibe-ia-ventas-atencion-cliente
summary: "Qué hace Closevibe, el problema que resuelve a los equipos de e-commerce y la arquitectura que hay detrás: multi-tenant, agentes con RAG y orquestación en tiempo real."
date: 2026-11-03
category: launch
tags: [closevibe, ia, saas]
product:
  name: Closevibe
  url: https://www.closevibe.com/es
  cta: Descubre Closevibe
  pitch: Ventas y atención al cliente con IA para e-commerce, en WhatsApp, Instagram, Messenger y email.
---

Las tiendas online pierden ventas en las conversaciones: una pregunta sobre tallas en Instagram a las 11 de la
noche, el estado de un pedido por WhatsApp en plena campaña, un email que nadie contesta hasta el lunes.
Closevibe es la empresa que cofundé para resolverlo, y donde soy CTO.

## Qué hace

Closevibe automatiza las conversaciones de venta y atención al cliente de negocios de e-commerce en los canales
que sus clientes ya usan: **WhatsApp, Instagram, Messenger y email**. Responde con el conocimiento de la propia
tienda, detecta qué quiere el cliente y mantiene la conversación en tiempo real.

Puedes verlo funcionando en esta web: el asistente de chat de la esquina funciona con Closevibe.

## Cómo está construido

Diseñé la arquitectura de la plataforma desde cero. Las piezas que más importan:

- **Multi-tenant desde el primer día.** Los datos, el conocimiento y las conversaciones de cada tienda están
  aislados.
- **Agentes basados en RAG.** Las respuestas se apoyan en el contenido de cada negocio, recuperado con búsqueda
  vectorial semántica sobre **PostgreSQL con pgvector**, en lugar de depender de lo que un modelo recuerde.
- **Detección de intención y orquestación en tiempo real**, para que el sistema sepa si tiene delante una
  pregunta de preventa, un problema con un pedido o algo que debe pasar a una persona.
- **Integraciones de canal** a través de las APIs de Meta Business (WhatsApp, Instagram, Messenger) y email.
- **El stack:** Python y FastAPI, React, PostgreSQL con pgvector, Docker en GCP y Railway.

## Qué he aprendido construyéndolo

El modelo es la parte fácil. Lo difícil es lo aburrido: meter el contexto adecuado en cada respuesta, saber
cuándo no responder, pasar la conversación a una persona sin fricción y conseguir que todos los canales se
comporten igual aunque cada API tenga sus reglas. Ahí se va la mayor parte de nuestro tiempo de ingeniería, y
es lo que separa una demo de algo a lo que una tienda confía sus clientes.

## Pruébalo

Si vendes online y tu equipo pasa el día respondiendo las mismas preguntas, échale un vistazo.
