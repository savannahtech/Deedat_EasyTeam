## Project Readme

This document provides an overview of the project structure and how to run it locally.

**Project Structure:**

* **backend:** This directory contains the Node.js/Express app backend with Prisma integration.
* **frontend:** This directory contains the Next.js frontend application.
* **docker-compose.yml:** This file defines the docker configuration for running the database, backend, and frontend services together.

**Backend:**

* The backend uses Node.js and Express for server-side logic.
* Prisma is used as the ORM (Object-Relational Mapper) for interacting with the database.
* To seed the database with initial data, run the command `npm prisma db seed`.
* To start the backend server in development mode, run the command `npm run dev`.

**Frontend:**

* The frontend is built using Next.js for a smooth and performant user experience.
* You can learn more about Next.js on their website: [https://nextjs.org/](https://nextjs.org/).

**Docker Compose:**

* Docker Compose orchestrates the backend, frontend, and database services in separate containers.
* To run all services in development mode, simply run the command `docker-compose up`.
