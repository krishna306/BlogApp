# Inkline

Inkline is an editorial blog for engineering notes: short, readable stories with a magazine-style layout. Readers browse by topic; writers publish, edit, and manage their own work.

This repository is the **server**.

## What it does

- Stores users and stories
- Serves the public feed and individual articles
- Handles sign up, sign in, and sign out
- Lets authors create, update, and delete only their own stories
- Caches popular reads so the feed stays responsive
- Protects sessions so a signed-out token cannot be reused

## Features

### Stories

- Paginated home feed (not an unbounded dump of every post)
- Optional filter by category: technology, travel, web design, programming, AI, or other
- List responses include a short excerpt, not the full body
- Full article (including author details) is loaded when someone opens a story
- Cover image, title, body, and category on each post
- Ownership checks on edit and delete

### Accounts

- Email and password registration
- Sign in with hashed passwords
- Signed-in sessions with an expiry
- Sign out removes the current session and rejects that token afterward
- User records in cache do not include password hashes

### Performance and reliability

- Redis cache for feed pages, a reader’s own articles, and opened stories
- Cache is refreshed when a story is created, updated, or deleted
- Cache lookups time out quickly and fall back to the database
- The process waits for the database before it accepts traffic
- Redis being down does not take the server down

### Data

- MongoDB for users and posts
- Redis for short-lived cache and signed-out tokens

## Stack

- Node.js and Express
- Mongoose / MongoDB
- Redis
- JSON Web Tokens and bcrypt

The public site is the [Inkline web app](https://github.com/krishna306/BlogAppFrontend).

## Run locally

```bash
npm install
npm start
```

Configure database, cache, and signing secrets in a local environment file. Do not commit that file or any credentials.
