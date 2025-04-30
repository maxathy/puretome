# PureTome

## Project Overview
PureTome is a collaborative memoir monorepo application where real-life stories come to life. 
Authors can write their life journeys, invite characters to validate events, 
and serialize chapters for a growing audience. 
With built-in tools for monetization and a publishing pipeline on the horizon, 
PureTome turns lived experience into legacy — and income.
```md
puretome/
├── .yarn/             # Yarn package manager files
├── apps/              # Application packages
│   ├── api/           # Backend Express API
│   │   ├── middleware/  # API middleware
│   │   ├── models/      # MongoDB data models
│   │   └── routes/      # API endpoints
│   ├── e2e/           # E2E tests
│   │   ├── tests/       # E2E test files
│   │   └── utils/       # E2E test utilities
│   └── web/           # Frontend React application
│       ├── src/         # Source files
│       │   ├── components/ # React components
│       │   ├── pages/      # Page components
│       │   └── store/      # Redux store
├── docker/            # Docker configuration
└── k8s/               # Kubernetes deployment files
```
## Local development
```
cd docker
docker-compose up - start all containers and watch for changes
```

### Supported yarn commands
```
docker-compose run {e2e|api|web} yarn test - runs tests in specified container
```

### API configurable env vars (place .env file at root)
```
MONGO_URI
JWT_SECRET
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
```
