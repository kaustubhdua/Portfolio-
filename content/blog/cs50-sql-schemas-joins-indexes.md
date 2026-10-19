---
title: Schemas, joins and indexes: what Harvard's CS50 SQL course drills
date: 2026-10-18
summary: A walkthrough of the three skills at the heart of CS50's Introduction to Databases with SQL, with a small example of each.
tags: SQL, Databases, CS50, Backend
---

I completed Harvard's **CS50 Introduction to Databases with SQL**: seven problem sets and a final project. Almost everything in the course comes back to three skills, and each is easier to remember with a small example. The tables below are my own illustration of a club events list, not course material.

## 1. Schema design

A good schema stores each fact once and lets tables point at each other. A member can register for many events and an event has many members, so the link gets its own table.

```sql
CREATE TABLE members (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE events (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  starts_on DATE NOT NULL
);

CREATE TABLE registrations (
  member_id INTEGER NOT NULL REFERENCES members (id),
  event_id  INTEGER NOT NULL REFERENCES events (id),
  PRIMARY KEY (member_id, event_id)
);
```

The `UNIQUE`, `NOT NULL` and `REFERENCES` rules matter as much as the columns: they let the database refuse bad data so the application does not have to.

## 2. Joins

A join puts the pieces back together. To list who registered for each event:

```sql
SELECT events.title, members.name
FROM registrations
JOIN events  ON events.id  = registrations.event_id
JOIN members ON members.id = registrations.member_id
ORDER BY events.starts_on, members.name;
```

## 3. Indexes and query plans

An index is a sorted shortcut. Without one, finding every registration for an event means reading the whole table. With one, the database jumps straight to the matching rows.

```sql
CREATE INDEX registrations_by_event ON registrations (event_id);
```

The course uses SQLite, where `EXPLAIN QUERY PLAN` shows whether a query used the index or scanned the table. Checking the plan before and after adding an index is the habit worth keeping: measure first, then optimise.

## Why it matters

Whatever the app, the database is usually where the truth lives. A clear schema, correct joins and a sensible index are the difference between a backend that stays fast and correct as data grows and one that quietly does not. These are the foundations I want under every backend I build.
