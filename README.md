# Customer Intelligence Platform

An enterprise-grade B2B customer intelligence and business opportunity tracking platform. Built with React, TypeScript, Express, and tRPC.

## Features

- **Customer Management**: Track enterprise customers with comprehensive profiles
- **Corporate Family Tree**: Visualize parent companies, subsidiaries, and branches
- **Opportunity Pipeline**: Manage sales opportunities through stages
- **Deal Tracking**: Record and analyze closed deals with revenue metrics
- **News Integration**: AI-powered news search and analysis for customers
- **Data Import**: Import customer data from Excel/CSV files
- **AI Analysis**: Generate insights, product matching, and talking points
- **Multi-language Support**: English, Simplified Chinese, Traditional Chinese
- **Interactive Dashboards**: Recharts-powered visualizations

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Recharts
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL/MariaDB (TiDB compatible)
- **Authentication**: JWT-based authentication
- **AI Integration**: OpenAI API (or compatible endpoints)

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MySQL/MariaDB database
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd customer_intelligence_dashboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
# Create .env file with the following variables:

# Database connection
DATABASE_URL=mysql://user:password@localhost:3306/customer_intelligence

# JWT secret for authentication
JWT_SECRET=your-secret-key-min-32-chars

# OpenAI API (optional, for AI features)
OPENAI_API_KEY=sk-your-api-key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

4. Initialize the database:
```bash
pnpm db:push
```

5. (Optional) Seed sample data:
```bash
node scripts/seed-data.mjs
```

6. Start the development server:
```bash
pnpm dev
```

7. Open http://localhost:3000 in your browser

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Language, Theme)
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and tRPC client
├── server/                 # Backend Express/tRPC server
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   ├── llm.ts             # LLM integration
│   └── auth.ts            # Authentication utilities
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
    └── scripts/               # Utility scripts
    └── ngrok/                 # creates a secure tunnel to your localhost
    └── .env/                  # local environment setting
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | MySQL connection string |
| JWT_SECRET | Yes | Secret for JWT signing (32+ chars) |
| OPENAI_API_KEY | Yes | OpenAI API key for AI features |
| LLM_API_URL | Yes | Custom LLM endpoint URL |
| LLM_MODEL | Yes | LLM model name (default: ds) |
| PORT | Yes | Server port (default: 3000) |

### LLM Configuration

The platform supports any OpenAI-compatible API:

- **OpenAI**: Set `OPENAI_API_KEY`
- **Azure OpenAI**: Set `LLM_API_URL` to your Azure endpoint
- **Ollama**: Set `LLM_API_URL=http://localhost:11434/v1/chat/completions`
- **LocalAI**: Set `LLM_API_URL` to your LocalAI endpoint

## API Overview

The platform uses tRPC for type-safe API calls:

- `customer.*` - Customer CRUD operations
- `subsidiary.*` - Subsidiary management
- `opportunity.*` - Opportunity pipeline
- `deal.*` - Deal tracking
- `news.*` - News management and AI search
- `dataImport.*` - Data import operations
- `ai.*` - AI analysis endpoints

## Development

### Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm db:push      # Push schema changes to database
pnpm check        # TypeScript type checking
```

### Adding New Features

1. Update schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Add query helpers in `server/db.ts`
4. Create tRPC procedures in `server/routers.ts`
5. Build UI components in `client/src/pages/`
6. Add translations in `client/src/contexts/LanguageContext.tsx`

## Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Manual Deployment

1. Build the application:
```bash
pnpm build
```

2. Set production environment variables

3. Start the server:
```bash
NODE_ENV=production node dist/index.js
```

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
# Enterprise_Customer_Intelligence
