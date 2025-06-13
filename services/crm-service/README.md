# NextCore ERP - CRM Service

This service manages customer relationship management functionality for the NextCore ERP platform.

## Features

- Contact management
- Lead tracking and scoring
- Opportunity pipeline management
- Campaign management and analytics
- Activity tracking
- Email integration
- Customer segmentation
- Reporting and analytics

## API Endpoints

### Contacts

- `GET /api/crm/contacts` - List contacts with filtering and pagination
- `GET /api/crm/contacts/{id}` - Get contact details
- `POST /api/crm/contacts` - Create new contact
- `PATCH /api/crm/contacts/{id}` - Update contact
- `DELETE /api/crm/contacts/{id}` - Delete contact

### Leads

- `GET /api/crm/leads` - List leads with filtering and pagination
- `GET /api/crm/leads/{id}` - Get lead details
- `POST /api/crm/leads` - Create new lead
- `PATCH /api/crm/leads/{id}` - Update lead
- `DELETE /api/crm/leads/{id}` - Delete lead
- `POST /api/crm/leads/{id}/convert` - Convert lead to opportunity

### Opportunities

- `GET /api/crm/opportunities` - List opportunities with filtering and pagination
- `GET /api/crm/opportunities/{id}` - Get opportunity details
- `POST /api/crm/opportunities` - Create new opportunity
- `PATCH /api/crm/opportunities/{id}` - Update opportunity
- `DELETE /api/crm/opportunities/{id}` - Delete opportunity
- `PATCH /api/crm/opportunities/{id}/stage` - Update opportunity stage

### Campaigns

- `GET /api/crm/campaigns` - List campaigns with filtering and pagination
- `GET /api/crm/campaigns/{id}` - Get campaign details
- `POST /api/crm/campaigns` - Create new campaign
- `PATCH /api/crm/campaigns/{id}` - Update campaign
- `DELETE /api/crm/campaigns/{id}` - Delete campaign
- `GET /api/crm/campaigns/{id}/leads` - Get campaign leads
- `GET /api/crm/campaigns/{id}/metrics` - Get campaign performance metrics

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis
- NATS

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in the `.env` file
5. Start the service:
   ```bash
   npm run start:dev
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the service on | 3001 |
| NODE_ENV | Environment (development, production) | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USERNAME | PostgreSQL username | nextcore |
| DB_PASSWORD | PostgreSQL password | nextcore |
| DB_DATABASE | PostgreSQL database | nextcore |
| DB_SYNC | Synchronize database schema | true |
| DB_LOGGING | Enable database query logging | true |
| JWT_ACCESS_SECRET | JWT access token secret | - |
| JWT_REFRESH_SECRET | JWT refresh token secret | - |
| NATS_URL | NATS server URL | nats://localhost:4222 |

## Documentation

API documentation is available at `/api/crm/docs` when running in development mode.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```