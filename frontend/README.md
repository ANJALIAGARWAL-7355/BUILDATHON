# RazorGrowth AI - Frontend

Modern React + Tailwind CSS e-commerce store and merchant dashboard

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create .env File

```bash
cp .env.example .env
```

Configure the API URL:
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Pages

### 1. **Store (Home)**
- Browse products by category
- Select customer for demo
- Add products to cart
- View product details

### 2. **Shopping Cart**
- View cart items
- Remove items
- See order summary
- Proceed to checkout

### 3. **Checkout**
- Order confirmation
- AI Agent analysis of customer
- Purchase intent scoring
- Razorpay payment link generation
- Mock payment completion

### 4. **Merchant Dashboard**
- Total revenue metrics
- AI recovery impact
- Abandoned carts count
- Success rate visualization
- Revenue trend chart
- Real-time agent activity feed

## Features

### E-Commerce Store
- 16 fashion products (Dresses, Tops, Shoes, Accessories)
- Product filtering by category
- Product search
- Shopping cart management
- Responsive design

### AI Integration
- Customer selection with demo data
- AI agent decision transparency
- Purchase intent visualization
- Real-time analytics
- Agent action logging

### Payment System
- Razorpay payment link generation
- Mock payment mode for testing
- Payment status tracking
- Order confirmation

## Architecture

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   ├── CartDrawer.jsx
│   ├── MetricCard.jsx
│   └── AgentActivity.jsx
├── pages/              # Full page components
│   ├── HomePage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   └── DashboardPage.jsx
├── services/           # API client
│   └── api.js
├── context/           # React Context
│   └── CartContext.jsx
├── App.jsx
├── main.jsx
└── index.css

```

## Technology Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Charts and graphs
- **Lucide React** - Icons

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000/api |

## Demo Customers

Pre-seeded customers for testing:
1. Anjali Agarwal (anjali@example.com) - **HIGH INTENT** - Perfect for demo!
2. Priya Sharma (priya@example.com)
3. Neha Patel (neha@example.com)
4. Isha Gupta (isha@example.com)
5. Riya Singh (riya@example.com)

## Notes

- Make sure backend is running on `http://localhost:8000`
- All API calls proxy through Vite dev server
- Mock payment mode is enabled by default
- Dashboard auto-refreshes every 5 seconds
