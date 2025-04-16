# StoryNest

## Project Overview
StoryNest is a collaborative memoir monorepo application where real-life stories come to life. 
Authors can write their life journeys, invite characters to validate events, 
and serialize chapters for a growing audience. 
With built-in tools for monetization and a publishing pipeline on the horizon, 
StoryNest turns lived experience into legacy — and income.
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
└── k8s/               # Kubernetes deployment files
```
## Local development
*Prerequisites:* make sure mongo is running and yarn v2 is installed globally
```
cd docker
docker-compose up -d mongo
```

## Supported yarn commands
```
yarn dev - Starts both the web and API applications concurrently
yarn dev:web - Starts only the web application
yarn dev:api - Starts only the API application
yarn format - Runs Prettier to format all code
```