# EduMerge Student Support and Ticket Management System

EduMerge is a full-stack campus support portal for submitting, assigning, tracking, and resolving student support tickets.

The project includes role-based dashboards for students, support staff, and administrators; JWT authentication; SLA monitoring; ticket activity history; duplicate-ticket detection; comments and internal notes; analytics; and SQLite persistence through Prisma.

## Documentation

The complete project explanation is available in [PROJECT_DOCUMENTATION.pdf](PROJECT_DOCUMENTATION.pdf). It covers:

- What the project is
- Main features and user roles
- Technology stack
- Frontend architecture and request flow
- Backend architecture and request flow
- Database storage and Prisma models
- SLA processing and audit logging
- API overview
- Project structure
- Local and Docker setup

## Quick Start

### Backend

```bash
cd server
npm install
npx prisma db push
npm run db:seed
npm start
```

The backend runs on `http://localhost:5000` by default.

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on the Vite development port configured in `client/vite.config.js`.

### Build

```bash
cd client
npm run build
```

### Docker

```bash
docker-compose up --build
```

## Data Storage

The application uses a local SQLite database managed by Prisma. After database setup, the database is normally stored at:

```text
server/prisma/dev.db
```

Use `cd server && npm run db:studio` to inspect the database with Prisma Studio.
