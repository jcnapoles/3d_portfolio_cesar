---
title: "Empieza con un monolito modular (y sabe cuándo salir de él)"
slug: monolito-modular-primero
summary: "Por qué recomiendo un monolito bien estructurado a la mayoría de productos en fase temprana, las señales de que toca separar y cómo preparar el código para que separar sea barato."
date: 2026-11-04
category: cto-log
tags: [arquitectura, microservicios, startups]
---

He trabajado con microservicios y sistemas orientados a eventos con Kafka en organizaciones grandes, y los he
visto funcionar muy bien. Aun así, a casi todos los productos en fase temprana les recomiendo empezar con un
**monolito modular**. Te explico por qué y cómo dejar la puerta abierta.

## Los microservicios son una herramienta organizativa

Su gran ventaja es que muchos equipos puedan desplegar de forma independiente sin pisarse. Si tienes un solo
equipo de cinco personas, no tienes ese problema. Lo que sí te llevas es el coste: llamadas de red en lugar de
llamadas a funciones, transacciones distribuidas, más infraestructura, más pipelines, depuración más difícil y
más superficie de guardias.

Para un equipo pequeño que todavía busca encaje producto-mercado, ese coste se paga en la única moneda que no
se puede permitir: la velocidad de cambio.

## Qué significa "modular" en la práctica

Un monolito se convierte en un lío cuando cualquier cosa puede llamar a cualquier cosa. Un monolito modular
pone fronteras desde el primer día:

- **Módulos por capacidad de negocio** (facturación, catálogo, usuarios), no por capa técnica.
- **Cada módulo es dueño de sus datos.** Los demás no leen sus tablas; llaman a su interfaz pública.
- **Interfaces públicas explícitas.** Lo que no se exporta es privado, y una regla de lint o un test de
  arquitectura lo hace cumplir.
- **Eventos internos para los efectos secundarios.** "Pedido pagado" se publica dentro del proceso y quien lo
  necesite se suscribe. El día que eso pase a ser un mensaje en un broker, el código apenas cambia.

## Las señales de que toca sacar un módulo

- Un módulo necesita **escalar de forma muy distinta** al resto (un proceso en segundo plano pesado, una API con
  picos).
- **Varios equipos** se bloquean con los despliegues de los demás en el mismo código.
- Un módulo tiene **requisitos distintos** de disponibilidad, seguridad o cumplimiento normativo.
- **Desplegar es lento o arriesgado** por el tamaño del conjunto, y los builds modulares ya no ayudan.

Ninguna de ellas es "estamos en 2026 y las empresas serias usan microservicios".

## Cómo separar sin reescribir

Cuando un módulo se gana su propio servicio, las fronteras ya existen: es dueño de sus datos, tiene una interfaz
pública y se comunica por eventos. Extraerlo es mover código y cambiar llamadas internas por llamadas de red, no
un rediseño de seis meses. Ese es el sentido de empezar modular: tomar la decisión cara más tarde, cuando tienes
la información para tomarla bien.
