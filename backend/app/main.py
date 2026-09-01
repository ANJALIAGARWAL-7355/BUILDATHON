import os
import shutil
import uuid
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db, init_db
from app.config import settings
from app.schemas import (
    ProductResponse, ProductCreate, ProductUpdate, ProductImageUpdate, UploadResponse,
    CustomerResponse, CustomerCreate,
    CartResponse, AddToCartRequest, RemoveFromCartRequest,
    CustomerEventCreate, CustomerEventResponse, AgentAnalysisResponse,
    CreatePaymentLinkRequest, PaymentResponse, DashboardMetrics, DashboardResponse,
    AgentActivityItem, RevenueChartPoint, AgentDecisionResponse, SearchProductsRequest,
    AnalyzeCustomerRequest
)
from app.services import ProductService, EventService, PurchaseIntentAnalyzer
from app.models import Customer, Product, Cart, CartItem, CustomerEvent, Payment, AgentDecision
from app.ai_agent import ai_agent
from app.razorpay_service import razorpay_service

# Upload directory setup
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="RazorGrowth AI",
    description="Autonomous AI Commerce Growth Platform",
    version="1.0.0"
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database initialized")

# ============= UPLOADS =============

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload an image file (PNG, JPG, JPEG, WEBP, GIF, SVG)."""
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(allowed)}"
        )
    
    clean_name = os.path.basename(file.filename or "image.jpg").replace(" ", "_")
    unique_filename = f"{uuid.uuid4().hex[:10]}_{clean_name}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded image: {str(e)}")
    
    url = f"/uploads/{unique_filename}"
    return UploadResponse(url=url, filename=unique_filename, success=True)

# ============= PRODUCTS =============

@app.get("/api/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    """Get all products."""
    return ProductService.get_all_products(db)

@app.get("/api/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product."""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/products/search")
def search_products(request: SearchProductsRequest, db: Session = Depends(get_db)):
    """Search products by name or description."""
    products = ProductService.search_products(db, request.query)
    return {
        "query": request.query,
        "count": len(products),
        "products": [ProductResponse.from_orm(p) for p in products[:request.max_results]]
    }

@app.post("/api/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    return ProductService.create_product(db, product)

@app.put("/api/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product."""
    updated = ProductService.update_product(db, product_id, product_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@app.put("/api/products/{product_id}/image", response_model=ProductResponse)
def update_product_image(product_id: int, image_update: ProductImageUpdate, db: Session = Depends(get_db)):
    """Update product image URL."""
    updated = ProductService.update_product_image(db, product_id, image_update.image_url)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product."""
    success = ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": f"Product {product_id} deleted successfully"}

# ============= SEED RESET =============

@app.post("/api/seed/reset")
def reset_seed_data():
    """Reset and reseed database with fresh demo scenarios."""
    try:
        from seed import seed_database
        seed_database()
        return {"success": True, "message": "Database reset and seeded with fresh demo data"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset database: {str(e)}")

# ============= CUSTOMERS =============

@app.post("/api/customers", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    # Check if customer exists
    existing = db.query(Customer).filter(Customer.email == customer.email).first()
    if existing:
        return existing
    
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/api/customers", response_model=list[CustomerResponse])
def get_all_customers(db: Session = Depends(get_db)):
    """Get all registered customers."""
    return db.query(Customer).all()

@app.get("/api/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get customer details."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

# ============= EVENTS =============

@app.post("/api/events", response_model=CustomerEventResponse)
def record_event(event: CustomerEventCreate, db: Session = Depends(get_db)):
    """Record a customer event."""
    return EventService.record_event(
        db,
        event.customer_id,
        event.event_type,
        event.product_id,
        event.metadata
    )

@app.get("/api/events/customer/{customer_id}")
def get_customer_events(customer_id: int, db: Session = Depends(get_db)):
    """Get events for a customer."""
    events = EventService.get_customer_events(db, customer_id)
    return {
        "customer_id": customer_id,
        "count": len(events),
        "events": events
    }

# ============= CART =============

@app.get("/api/cart/{customer_id}", response_model=CartResponse)
def get_cart(customer_id: int, db: Session = Depends(get_db)):
    """Get customer's cart."""
    # Get or create active cart
    cart = db.query(Cart).filter(
        (Cart.customer_id == customer_id) &
        (Cart.status == "active")
    ).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="No active cart found")
    
    return cart

@app.post("/api/cart/add")
def add_to_cart(request: AddToCartRequest, db: Session = Depends(get_db)):
    """Add item to cart."""
    # Get or create active cart
    cart = db.query(Cart).filter(
        (Cart.customer_id == request.customer_id) &
        (Cart.status == "active")
    ).first()
    
    if not cart:
        cart = Cart(customer_id=request.customer_id, status="active")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Get product
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    cart_item = db.query(CartItem).filter(
        (CartItem.cart_id == cart.id) &
        (CartItem.product_id == request.product_id)
    ).first()
    
    if cart_item:
        cart_item.quantity += request.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=request.product_id,
            quantity=request.quantity,
            price_at_time=product.price
        )
        db.add(cart_item)
    
    db.commit()
    db.refresh(cart)
    
    # Record event
    EventService.record_event(
        db,
        request.customer_id,
        "add_to_cart",
        request.product_id,
        {"quantity": request.quantity}
    )
    
    return {"success": True, "cart": CartResponse.from_orm(cart)}

@app.post("/api/cart/remove")
def remove_from_cart(request: RemoveFromCartRequest, db: Session = Depends(get_db)):
    """Remove item from cart."""
    cart_item = db.query(CartItem).filter(
        (CartItem.cart_id == request.cart_id) &
        (CartItem.product_id == request.product_id)
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Get customer ID from cart
    cart = db.query(Cart).filter(Cart.id == request.cart_id).first()
    
    db.delete(cart_item)
    db.commit()
    
    # Record event
    EventService.record_event(
        db,
        cart.customer_id,
        "remove_from_cart",
        request.product_id
    )
    
    return {"success": True}

@app.post("/api/cart/{customer_id}/checkout")
def checkout(customer_id: int, db: Session = Depends(get_db)):
    """Start checkout process."""
    cart = db.query(Cart).filter(
        (Cart.customer_id == customer_id) &
        (Cart.status == "active")
    ).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="No active cart found")
    
    # Record event
    EventService.record_event(
        db,
        customer_id,
        "checkout_started",
        None,
        {"cart_id": cart.id}
    )
    
    return {
        "success": True,
        "cart_id": cart.id,
        "message": "Checkout started"
    }

# ============= AGENT =============

@app.post("/api/agent/analyze/{customer_id}")
def analyze_customer(customer_id: int, db: Session = Depends(get_db)):
    """Analyze customer for recovery actions."""
    analysis = ai_agent.analyze_customer(db, customer_id)
    
    if not analysis.get("success", True):
        raise HTTPException(status_code=400, detail=analysis.get("error", "Analysis failed"))
    
    return analysis

@app.post("/api/agent/recover/{customer_id}")
def recover_customer(customer_id: int, db: Session = Depends(get_db)):
    """Analyze customer and execute recovery action."""
    # Analyze
    analysis = ai_agent.analyze_customer(db, customer_id)
    
    if not analysis.get("success", True):
        raise HTTPException(status_code=400, detail="Analysis failed")
    
    # Execute decision
    result = ai_agent.execute_decision(db, analysis)
    
    return {
        "analysis": analysis,
        "execution": result
    }

@app.get("/api/agent/decisions")
def get_recent_decisions(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent agent decisions."""
    decisions = db.query(AgentDecision).order_by(
        AgentDecision.created_at.desc()
    ).limit(limit).all()
    
    return {
        "count": len(decisions),
        "decisions": decisions
    }

@app.get("/api/agent/decisions/{decision_id}")
def get_decision(decision_id: int, db: Session = Depends(get_db)):
    """Get a specific agent decision."""
    decision = db.query(AgentDecision).filter(AgentDecision.id == decision_id).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # Get customer and cart info
    customer = db.query(Customer).filter(Customer.id == decision.customer_id).first()
    
    return {
        "decision": decision,
        "customer_name": customer.name if customer else "Unknown",
        "customer_email": customer.email if customer else "Unknown"
    }

# ============= PAYMENTS =============

@app.post("/api/payments/create-link", response_model=PaymentResponse)
def create_payment_link(request: CreatePaymentLinkRequest, db: Session = Depends(get_db)):
    """Create a Razorpay payment link."""
    
    payment_link_data = razorpay_service.create_payment_link(
        request.customer_id,
        request.amount,
        "Cart Recovery - Complete Your Purchase"
    )
    
    # Save payment record
    payment = Payment(
        customer_id=request.customer_id,
        amount=request.amount,
        status="pending",
        razorpay_payment_link_id=payment_link_data.get("payment_link_id"),
        cart_id=request.cart_id
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        "id": payment.id,
        "customer_id": payment.customer_id,
        "amount": payment.amount,
        "status": payment.status,
        "razorpay_payment_link_id": payment.razorpay_payment_link_id,
        "razorpay_payment_id": payment.razorpay_payment_id,
        "created_at": payment.created_at,
        "completed_at": payment.completed_at
    }

@app.get("/api/payments/{payment_id}")
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get payment details."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@app.post("/api/payments/mock-success/{payment_link_id}")
def mock_payment_success(payment_link_id: str, db: Session = Depends(get_db)):
    """Mark a mock payment as successful."""
    
    # Find payment by razorpay_payment_link_id
    payment = db.query(Payment).filter(
        Payment.razorpay_payment_link_id == payment_link_id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Mark as successful
    success = razorpay_service.mark_payment_success(db, payment_link_id, payment.customer_id)
    
    if success:
        # Record purchase event
        EventService.record_event(
            db,
            payment.customer_id,
            "purchase_completed",
            None,
            {"payment_id": payment.id, "amount": payment.amount}
        )
        
        # Mark cart as completed
        if payment.cart_id:
            cart = db.query(Cart).filter(Cart.id == payment.cart_id).first()
            if cart:
                cart.status = "completed"
                db.commit()
        
        # Update agent decision with outcome
        agent_decision = db.query(AgentDecision).filter(
            (AgentDecision.customer_id == payment.customer_id) &
            (AgentDecision.decision == "CREATE_PAYMENT_LINK")
        ).order_by(AgentDecision.created_at.desc()).first()
        
        if agent_decision:
            agent_decision.result_outcome = "success"
            agent_decision.revenue_impact = payment.amount
            db.commit()
        
        return {
            "success": True,
            "payment_id": payment.id,
            "amount": payment.amount,
            "status": "success"
        }
    
    return {"success": False, "error": "Could not mark payment as successful"}

# ============= DASHBOARD =============

@app.get("/api/dashboard/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard metrics."""
    
    # Total revenue
    successful_payments = db.query(Payment).filter(
        Payment.status == "success"
    ).all()
    total_revenue = sum(p.amount for p in successful_payments)
    
    # Revenue recovered by AI
    recovered_decisions = db.query(AgentDecision).filter(
        AgentDecision.result_outcome == "success"
    ).all()
    revenue_recovered = sum(d.revenue_impact or 0 for d in recovered_decisions)
    
    # Abandoned carts
    abandoned_carts = db.query(Cart).filter(
        Cart.status == "abandoned"
    ).count()
    
    # Customers re-engaged
    customers_reengaged = db.query(AgentDecision).filter(
        AgentDecision.result_outcome == "success"
    ).distinct(AgentDecision.customer_id).count()
    
    # Success rate
    total_interventions = db.query(AgentDecision).count()
    success_rate = (customers_reengaged / total_interventions * 100) if total_interventions > 0 else 0
    
    # Total counts
    total_customers = db.query(Customer).count()
    total_products = db.query(Product).count()
    
    return DashboardMetrics(
        total_revenue=total_revenue,
        revenue_recovered_by_ai=revenue_recovered,
        abandoned_carts_count=abandoned_carts,
        customers_reengaged=customers_reengaged,
        ai_intervention_success_rate=success_rate,
        total_customers=total_customers,
        total_products=total_products
    )

@app.get("/api/dashboard/activity")
def get_dashboard_activity(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent agent activity."""
    decisions = db.query(AgentDecision).order_by(
        AgentDecision.created_at.desc()
    ).limit(limit).all()
    
    activities = []
    for decision in decisions:
        customer = db.query(Customer).filter(Customer.id == decision.customer_id).first()
        
        # Get product from cart
        product_name = "Cart"
        cart_value = 0
        
        # Get recent add_to_cart event
        recent_add = db.query(CustomerEvent).filter(
            (CustomerEvent.customer_id == decision.customer_id) &
            (CustomerEvent.event_type == "add_to_cart")
        ).order_by(CustomerEvent.timestamp.desc()).first()
        
        if recent_add and recent_add.product_id:
            product = db.query(Product).filter(Product.id == recent_add.product_id).first()
            if product:
                product_name = product.name
        
        # Calculate cart value
        active_cart = db.query(Cart).filter(
            (Cart.customer_id == decision.customer_id) &
            (Cart.status == "active")
        ).first()
        
        if active_cart:
            for item in active_cart.items:
                cart_value += item.price_at_time * item.quantity
        
        activities.append(AgentActivityItem(
            customer_id=decision.customer_id,
            customer_name=customer.name if customer else "Unknown",
            product_name=product_name,
            cart_value=cart_value,
            intent_score=decision.intent_score,
            decision=decision.decision,
            action_taken=decision.action_taken,
            status=decision.result_outcome or "pending",
            created_at=decision.created_at
        ))
    
    return {
        "count": len(activities),
        "activities": activities
    }

@app.get("/api/dashboard/revenue-chart")
def get_revenue_chart(days: int = 7, db: Session = Depends(get_db)):
    """Get revenue chart data."""
    
    chart_data = []
    
    for i in range(days):
        date = datetime.utcnow() - timedelta(days=days-i-1)
        date_str = date.strftime("%Y-%m-%d")
        
        # Get revenue for this day
        day_start = datetime(date.year, date.month, date.day, 0, 0, 0)
        day_end = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        day_payments = db.query(Payment).filter(
            (Payment.status == "success") &
            (Payment.completed_at >= day_start) &
            (Payment.completed_at <= day_end)
        ).all()
        
        day_revenue = sum(p.amount for p in day_payments)
        
        chart_data.append(RevenueChartPoint(
            date=date_str,
            amount=day_revenue
        ))
    
    return chart_data

@app.get("/api/dashboard")
def get_full_dashboard(db: Session = Depends(get_db)):
    """Get complete dashboard data."""
    metrics = get_dashboard_metrics(db)
    activities = get_dashboard_activity(10, db)
    revenue_chart = get_revenue_chart(7, db)
    
    return DashboardResponse(
        metrics=metrics,
        recent_activities=activities.get("activities", []),
        revenue_chart=revenue_chart
    )

# ============= HEALTH =============

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "debug": settings.DEBUG
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
