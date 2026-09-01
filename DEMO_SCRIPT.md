# RazorGrowth AI - MVP Documentation

Complete step-by-step guide to run, test, and demo the RazorGrowth AI platform.

## 🎯 Quick Links

- **Backend Setup**: See `backend/README.md`
- **Frontend Setup**: See `frontend/README.md`
- **Full Project README**: See `README.md`

## ⚡ 5-Minute Quick Start

### Terminal 1: Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py  # Populate database with demo data
python -m uvicorn app.main:app --reload
```

Backend runs on: **http://localhost:8000**

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🚀 Complete Demo Flow (3 Minutes)

### Step 1: Navigate to Store

1. Open browser to: `http://localhost:5173`
2. You'll see the RazorGrowth AI store homepage

### Step 2: Select Demo Customer

1. Look for "Select Customer" section
2. Click on **"Anjali Kumar"** (HIGHEST INTENT)
   - This customer has abandoned a cart with high purchase intent
   - Perfect for demonstrating AI agent recovery

**Expected Behavior:**
- ✓ Customer #1 selected
- ✓ Green confirmation badge appears

### Step 3: Browse Products

1. Click on a product or view details
2. Notice the product information and rating
3. The demo is seeded with a Black Evening Dress (₹2,499)

### Step 4: Add to Cart

1. Select quantity (default is 1)
2. Click "Add to Cart"
3. Notice event is recorded (product_view logged to backend)
4. Navigate to cart

### Step 5: Proceed to Checkout

1. Click "Proceed to Checkout"
2. You'll see the order confirmation

### Step 6: Trigger AI Agent Analysis

1. On checkout page, click "Proceed to AI Analysis"
2. **The AI Agent immediately:**
   - ✓ Analyzes customer behavior
   - ✓ Calculates purchase intent (should be ~87%)
   - ✓ Detects high-intent signals
   - ✓ Makes autonomous decision: **CREATE_PAYMENT_LINK**

3. **AI Analysis Shows:**
   - Purchase Intent: 87% (HIGH)
   - Observations: Product views, cart abandonment, checkout signals
   - Decision: CREATE_PAYMENT_LINK
   - Reason: High purchase intent detected + checkout abandonment

### Step 7: Generate Payment Link

1. AI agent automatically creates Razorpay payment link
2. Click "Generate Razorpay Payment Link"
3. Payment link appears with:
   - Mock payment link URL
   - Exact cart amount: ₹2,499
   - Payment link ID

### Step 8: Complete Mock Payment

1. Click "Complete Payment (Mock)"
2. Payment is processed immediately
3. Success confirmation appears
4. You're redirected to Dashboard

### Step 9: View Dashboard

1. **Merchant Dashboard shows:**
   - ✓ Total Revenue: ₹2,499
   - ✓ Revenue Recovered by AI: ₹2,499
   - ✓ Customers Re-engaged: 1
   - ✓ AI Success Rate: 100%

2. **Recent AI Agent Activity shows:**
   - Customer: Anjali Kumar
   - Decision: CREATE_PAYMENT_LINK
   - Status: success
   - Revenue Impact: ₹2,499

3. **Revenue Chart:** Shows daily revenue trend

---

## 🧪 Complete Test Scenario

### Pre-Demo Setup (Once)

```bash
# Backend terminal
cd backend
python seed.py
```

This creates:
- ✓ 16 fashion products
- ✓ 5 demo customers
- ✓ Abandoned cart scenario (Anjali Kumar)
- ✓ Completed purchase scenario (Priya Sharma)

### Demo Execution

#### Scenario A: Abandoned Cart Recovery (HIGH IMPACT)

**Customer:** Anjali Kumar
**Expected Result:** Revenue Recovery ₹2,499

```
Customer Behavior:
├── Viewed product 4 times
├── Added to cart
├── Started checkout
└── Abandoned (30 min ago)

AI Agent Decision:
├── Intent Score: 87/100 (HIGH)
├── Action: CREATE_PAYMENT_LINK
├── Reason: High intent + checkout abandonment
└── Result: Payment link generated

Outcome:
├── Payment link created
├── Customer completes payment
├── Revenue recovered: ₹2,499
└── Dashboard updates in real-time
```

#### Scenario B: View Previous Transactions

**Dashboard shows:**
- Historical completed purchases
- Agent intervention success rate
- Revenue trend over 7 days

---

## 🔍 Testing Checklist

### Backend Functionality
- [ ] FastAPI server starts without errors
- [ ] Database initializes with seed data
- [ ] Products API returns 16 products
- [ ] Customers API returns 5 customers
- [ ] Event tracking records customer actions
- [ ] AI agent analyzes customer behavior
- [ ] Purchase intent scoring works (0-100)
- [ ] Payment links created successfully
- [ ] Mock payment mode works
- [ ] Dashboard metrics calculate correctly

### Frontend Functionality
- [ ] React app loads at localhost:5173
- [ ] Can select customer
- [ ] Can browse products by category
- [ ] Can add items to cart
- [ ] Can view cart contents
- [ ] Checkout flow works end-to-end
- [ ] AI analysis displays correctly
- [ ] Payment link shows in checkout
- [ ] Mock payment completion works
- [ ] Dashboard updates after purchase
- [ ] Real-time metrics refresh

### User Experience
- [ ] No console errors
- [ ] Smooth page transitions
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Responsive on mobile/tablet/desktop
- [ ] All buttons are clickable
- [ ] Navigation is intuitive

---

## 🎨 Demo Customization

### Change Demo Customer
Edit `backend/seed.py`, modify this section:
```python
customer_1 = customers[0]  # Change index to select different customer
```

### Change Product in Demo
Edit `backend/seed.py`, modify:
```python
product_id=products[0].id,  # Change index to different product
```

### Adjust Purchase Intent Score
Edit `backend/app/services.py`, `calculate_intent()` method to adjust scoring algorithm.

---

## 📊 Key Metrics Explained

### Purchase Intent Score (0-100)
- **0-39 (LOW):** Do nothing
- **40-69 (MEDIUM):** Send reminder
- **70-100 (HIGH):** Create payment link

### Revenue Recovered by AI
Total amount successfully collected through AI-triggered recovery actions.

### Customers Re-engaged
Number of unique customers with successful AI interventions.

### AI Success Rate
Percentage of AI interventions that resulted in completed purchases.

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Clear database
rm razorgrowth.db  # SQLite
# Or drop PostgreSQL database

# Restart
python -m uvicorn app.main:app --reload
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running on :8000
curl http://localhost:8000/api/health

# Update .env if needed
VITE_API_URL=http://localhost:8000/api
```

### Missing Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
npm install recharts lucide-react
```

### Database Already Seeded
```bash
# Simply run seed again - it checks for existing data
python seed.py
```

---

## 📱 Mobile Testing

Frontend is fully responsive. Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

All features work across devices.

---

## 🎯 Buildathon Pitch Highlights

**Problem:**
Online merchants lose billions to abandoned carts. Generic recovery is ineffective.

**Solution:**
RazorGrowth AI - An autonomous agent that observes, analyzes, reasons, decides, and acts.

**Key Demo Points:**
1. **TRUE AGENTIC BEHAVIOR** - Not a chatbot, autonomous decisions
2. **MEASURABLE ROI** - Real revenue recovery in dashboard
3. **TRANSPARENCY** - Every decision explained and logged
4. **RAZORPAY NATIVE** - Seamless payment integration
5. **WORKING MVP** - Complete end-to-end demo

**Demo Time:** 3 minutes with real payment completion

---

## 📝 Notes

- All data is demo/mock - can be reset anytime
- No real payments required (mock mode enabled)
- Backend resets on restart (SQLite)
- Frontend is stateless, refreshable
- Metrics persist during session
- Auto-refresh dashboard every 5 seconds

---

**Last Updated:** 2026-08-30
**Status:** Ready for Demo
