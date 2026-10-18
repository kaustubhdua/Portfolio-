---
title: Kafka, Spring Boot and a transaction pipeline: notes from the JPMorgan simulation
date: 2026-10-18
summary: What I built and what stuck with me from the JPMorgan Chase Software Engineering job simulation on Forage, and why messaging, databases and APIs have to be designed together.
tags: Java, Spring Boot, Kafka, Backend
---

Between April and June 2026 I completed the JPMorgan Chase & Co. Software Engineering job simulation on Forage. The certificate lists five practical tasks: **project setup, Kafka integration, H2 integration, REST API integration and a REST API controller**. Together they add up to a small backend transaction-processing system written in Java and Spring Boot.

This post is a map of that system and of the ideas each task taught me. It is a student's notes, not a production design.

## The shape of the system

A transaction-processing backend is a chain of small jobs. Something announces that a transaction happened, something stores it, something checks it against other data, and something lets other programs ask about the result. Each task in the simulation built one link of that chain.

## What each task adds

**Kafka integration.** Apache Kafka carries events. A producer publishes a message to a *topic*, and a consumer subscribed to that topic receives it. The two sides never call each other directly, so the sender does not need to know who is listening or how fast they work. In Spring, a method annotated with `@KafkaListener` becomes that consumer.

**H2 integration.** H2 is a lightweight SQL database that runs inside the application. With Spring Data JPA you describe a table as a Java class and read and write it through a repository interface, without hand-writing every query. An in-memory database is ideal while building and testing, because every run starts clean.

**REST API integration.** Real systems call other services. I used Spring's `RestTemplate` to send an HTTP request to another service and read the JSON reply into Java objects. One note for newer projects: `RestTemplate` is in maintenance mode, and recent Spring versions offer `RestClient` and `WebClient` instead.

**REST controller.** The last link exposes the result. A controller maps a URL to a method, so another program can ask the system a question over HTTP.

## What stuck with me

The most valuable lesson was how the pieces depend on each other. A message arrives from Kafka, the database changes, another service is asked a question, and the answer is stored or returned. A bug in one link often shows up in another, so debugging a distributed workflow means following a single transaction through every step instead of staring at one file.

## Where this points

It strengthened my interest in backend engineering, distributed systems and scalable software. It also fits the way I already build: draw clear boundaries between components, test the failure path as well as the happy one, and label honestly what is real and what is simulated. This was a simulation, and I describe it as one.
