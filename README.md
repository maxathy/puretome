# storynest

## Project Overview
Story Nest is a monorepo application for memoir authoring, collaboration, and publishing. The project enables authors to create memoirs, invite collaborators to validate events, and eventually publish and monetize their work.

```md
storynest/
├── .yarn/             # Yarn package manager files
├── apps/              # Application packages
│   ├── api/           # Backend Express API
│   │   ├── middleware/  # API middleware
│   │   ├── models/      # MongoDB data models
│   │   └── routes/      # API endpoints
│   └── web/           # Frontend React application
│       ├── src/         # Source files
│       │   ├── components/ # React components
│       │   ├── pages/      # Page components
│       │   └── store/      # Redux store
├── docker/            # Docker configuration
├── k8s/               # Kubernetes deployment files
└── packages/          # Shared packages
└── ui/            # Shared UI components
```
## Local development
prerequisite: make sure mongo is running and yarn v2 is installed globally
```
cd docker
docker-compose up -d mongo
```

## Supported yarn commands
- yarn dev: Starts both the web and API applications concurrently
- yarn dev:web: Starts only the web application
- yarn dev:api: Starts only the API application
- yarn format: Runs Prettier to format all code