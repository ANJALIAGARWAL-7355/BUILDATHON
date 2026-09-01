# RazorGrowth AI - Backend

Autonomous AI Commerce Growth Platform - Backend API

## Quick Start

### 1. Setup Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Database connection (SQLite by default)
- `AI_PROVIDER`: Set to "mock" for demo mode (default)
- `USE_MOCK_PAYMENTS`: Set to "true" for demo mode (default)

### 3. Seed Database

```bash
python seed.py
```

This creates:
- 16 demo fashion products
- 5 demo customers
- Sample browsing events
- Abandoned cart scenario ready for AI agent testing

### 4. Run Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products/search` - Search products
- `POST /api/products` - Create product

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer details

### Events
- `POST /api/events` - Record customer event
- `GET /api/events/customer/{customer_id}` - Get events for customer

### Cart
- `GET /api/cart/{customer_id}` - Get customer's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/{customer_id}/checkout` - Start checkout

### AI Agent
- `POST /api/agent/analyze/{customer_id}` - Analyze customer
- `POST /api/agent/recover/{customer_id}` - Analyze and execute recovery
- `GET /api/agent/decisions` - List agent decisions
- `GET /api/agent/decisions/{id}` - Get decision details

### Payments
- `POST /api/payments/create-link` - Create payment link
- `GET /api/payments/{id}` - Get payment status
- `POST /api/payments/mock-success/{link_id}` - Mark mock payment as success

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/activity` - Get recent AI activities
- `GET /api/dashboard/revenue-chart` - Get revenue chart
- `GET /api/dashboard` - Get full dashboard

### Health
- `GET /api/health` - Health check

## Demo Scenario

The seeded database includes a high-intent customer ready for demo:

**Customer**: Anjali Agarwal (anjali@example.com)
**Product**: Black Evening Dress (₹2,499)
**Behavior**:
- Viewed product 4 times
- Added to cart
- Started checkout
- Abandoned

**Expected AI Decision**: HIGH INTENT → CREATE_PAYMENT_LINK

## Configuration

### AI Provider Options
- `mock` - Rule-based decisions (no API required, fast)
- `gemini` - Google Gemini API (requires GEMINI_API_KEY)
- `openai` - OpenAI API (requires OPENAI_API_KEY)

### Payment Mode
- `USE_MOCK_PAYMENTS=true` - Mock payment links (no API required)
- `USE_MOCK_PAYMENTS=false` - Real Razorpay API (requires credentials)

## Technology Stack
- **Framework**: FastAPI
- **Database**: SQLAlchemy ORM
- **AI**: Google Gemini / OpenAI (optional)
- **Payments**: Razorpay (optional - mock fallback)

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app and routes
│   ├── config.py            # Configuration
│   ├── database.py          # Database setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── services.py          # Business logic
│   ├── ai_agent.py          # AI agent implementation
│   ├── razorpay_service.py  # Payment integration
│   └── __init__.py
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── seed.py                 # Database seeding
└── README.md
```
