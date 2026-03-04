# Doc Connect

**Doc Connect** was originally made for **Codestellation 2025**, a hackathon organized as part of **Udbhavanam 12.0** under **Pyrokinesis 2025**, the annual tech event held at **Assam Engineering College** for the year 2025. I teamed up with [Parashar Deb](https://github.com/ParasharDeb), [Dikshyan Chakraborty](https://github.com/Dikshyan), and Yashuwanta Bungurung.

The original hackathon submission (plain HTML, no React, no proper auth) lives in the [`hackathon-legacy`](https://github.com/poran-dip/doc-connect/tree/hackathon-legacy) branch. What you're looking at now is a complete rewrite — same concept, done properly.

## What It Does

Doc Connect is a healthcare appointment management system with three distinct user roles:

- **Patients** — book appointments by department, flag emergencies, track appointment status, edit or cancel upcoming appointments
- **Doctors** — view assigned appointments, mark them as completed, manage their availability status
- **Admins** — full CRUD access across all patients, doctors, appointments, and other admins; assign available doctors to upcoming appointments

## Tech Stack

Full MERN stack, properly this time:

- **MongoDB** + **Mongoose** — database with discriminator-based user models
- **Express** + **Node.js** — REST API with role-based authentication and authorization
- **React** via **React Router v7** — SSR-enabled frontend with file-based routing
- **TypeScript** — end to end, both client and server
- **bcryptjs** — password hashing
- **jose** + **jsonwebtoken** — JWT-based auth with HTTP-only cookie persistence
- **Tailwind CSS v4** — styling
- **Vite** — frontend build tool
- **Docker** — containerized deployment

## Project Structure

```bash
doc-connect/
├── server/   # Express REST API
└── web/      # React Router v7 SSR frontend
```

## Getting Started

Make sure you have Node.js and MongoDB running locally.

```bash
# Clone the repo
git clone https://github.com/poran-dip/doc-connect
cd doc-connect

# Install dependencies
cd server && npm install
cd ../web && npm install

# Set up environment variables
cp server/.env.example server/.env
cp web/.env.example web/.env

# Seed the database
cd server && npm run seed

# Start both services
cd server && npm run dev   # runs on http://localhost:3000
cd web && npm run dev      # runs on http://localhost:5173
```

Or with Docker:

```bash
docker compose up --build
```

Web will be available at `http://localhost:4000`, API at `http://localhost:3000`.

## Seed Credentials

After running `npm run seed`, you can sign in with:

| Role    | Email                          | Password      |
|---------|--------------------------------|---------------|
| Patient | john.doe@example.com           | password123   |
| Doctor  | sarah.smith@example.com        | doctor123     |
| Admin   | admin@example.com              | admin123      |

## Comparison with Eazydoc

[Eazydoc](https://github.com/poran-dip/eazy-doc) was built for the GDG On Campus Solution Challenge 2025 and is the spiritual successor to this project. It has a more impressive UI. That said, Doc Connect v2 holds its own in several ways:

- Proper JWT authentication with HTTP-only cookies — Eazydoc's auth is more ad-hoc
- MongoDB access controls and role-based authorization baked in at the API level — Eazydoc’s database layer was optimized for rapid hackathon iteration (not as secure)
- Fully containerized with Docker — Eazydoc has none of that
- Clean client/server separation with a proper REST API — Eazydoc mixes concerns
- Every feature that exists actually works — no mock data or unimplemented stubs

They're different projects solving the same problem at different levels of polish and in different directions. Doc Connect v2 prioritizes correctness and architecture; Eazydoc prioritizes UI and feature breadth. Both are works in progress.

Licensed under Apache 2.0 — build something cool with it.

— Poran Dip
