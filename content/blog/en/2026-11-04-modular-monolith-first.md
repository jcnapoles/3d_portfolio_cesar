---
title: "Start with a modular monolith (and know when to leave it)"
slug: modular-monolith-first
summary: "Why I recommend a well-structured monolith to most early-stage products, the signals that it's time to split, and how to prepare the code so the split is cheap."
date: 2026-11-04
category: cto-log
tags: [architecture, microservices, startups]
---

I've worked on microservices and event-driven systems with Kafka in large organisations, and I've seen them
work very well. I still recommend almost every early-stage product to start with a **modular monolith**. Here's
why, and how to keep the door open.

## Microservices are an organisational tool

Their main benefit is letting many teams deploy independently without stepping on each other. If you have one
team of five, you don't have that problem. What you do get is the cost: network calls instead of function calls,
distributed transactions, more infrastructure, more pipelines, harder debugging and more on-call surface.

For a small team that's still searching for product-market fit, that cost is paid in the one currency it can't
afford: speed of change.

## What "modular" means in practice

A monolith becomes a mess when everything can call everything. A modular monolith sets boundaries from day one:

- **Modules by business capability** (billing, catalogue, users), not by technical layer.
- **Each module owns its data.** Other modules don't read its tables; they call its public interface.
- **Explicit public interfaces.** Anything not exported is private, and a lint rule or architecture test
  enforces it.
- **Internal events for side effects.** "Order paid" is published inside the process; whoever cares subscribes.
  The day that becomes a message on a broker, the code barely changes.

## The signals that it's time to split a module out

- A module needs to **scale very differently** from the rest (a heavy background job, a spike-prone API).
- **Several teams** are blocked on each other's releases in the same codebase.
- A module has **different requirements** for availability, security or compliance.
- **Deploys are slow or risky** because of the size of the whole, and modular builds no longer help.

None of those is "it's 2026 and microservices are what serious companies do".

## How to split without a rewrite

When a module earns its own service, the boundaries are already there: it owns its data, it has a public
interface and it communicates through events. Extracting it is moving code and replacing in-process calls with
network calls, not a six-month redesign. That's the whole point of starting modular: making the expensive
decision later, when you have the information to make it well.
