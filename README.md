# EquipmentAI Finance Tracker

A comprehensive financial management system for tracking startup expenses, revenue, and business metrics.

## Features

### Phase 1 - Expense Tracking (Current)
- Track expenses with detailed categorization
- Upload and manage receipts (AWS S3)
- Bank account integration (Plaid)
- Real-time analytics dashboard
- Burn rate and runway calculations
- Mobile-responsive interface

### Phase 2 - Revenue Management (Planned)
- Client and contract management
- Subscription tracking (MRR/ARR)
- Invoice generation and email
- Revenue analytics

### Phase 3 - Advanced Analytics (Planned)
- P&L statements
- Cash flow projections
- SaaS metrics (CAC, LTV, churn)
- Budget management

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, React Query, Recharts
- **Backend:** Node.js, Express, PostgreSQL, Redis
- **Storage:** AWS S3
- **Authentication:** JWT
- **Bank Integration:** Plaid

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional for caching)
- Docker (optional for local development)

### Local Development with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Install backend dependencies
cd backend
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start backend server
npm run dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

### Manual Setup

1. **Database Setup:**
```bash
createdb aiga_finance_dev
```

2. **Backend Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run migrate
npm run seed
npm run dev
```

3. **Frontend Setup:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

## Project Structure

```
aiga_finance/
├── backend/          # Node.js/Express API
├── frontend/         # React application
├── infrastructure/   # Docker, deployment configs
└── docs/            # Documentation
```

## Environment Variables

See `.env.example` files in backend/ and frontend/ directories.

## API Documentation

API documentation available at `/docs/API.md`

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

See `/docs/DEPLOYMENT.md` for deployment instructions.

## Security

- All sensitive data encrypted at rest and in transit
- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- Audit logging for financial transactions

## License

Proprietary - EquipmentAI Inspector

## Support

For issues and questions, contact the development team.
