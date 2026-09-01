from sqlalchemy.orm import Session
from app.models import Product, CustomerEvent, Customer, Cart, CartItem, Payment
from datetime import datetime, timedelta
from typing import List

class ProductService:
    @staticmethod
    def get_all_products(db: Session, limit: int = 100):
        return db.query(Product).limit(limit).all()
    
    @staticmethod
    def get_product(db: Session, product_id: int):
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def search_products(db: Session, query: str):
        """Search products by name or description."""
        query_lower = query.lower()
        return db.query(Product).filter(
            (Product.name.ilike(f"%{query}%")) | 
            (Product.description.ilike(f"%{query}%"))
        ).all()
    
    @staticmethod
    def create_product(db: Session, product_data):
        if hasattr(product_data, "dict"):
            data = product_data.dict()
        else:
            data = dict(product_data)
        product = Product(**data)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(db: Session, product_id: int, product_data):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        
        update_data = product_data.dict(exclude_unset=True) if hasattr(product_data, "dict") else dict(product_data)
        for key, value in update_data.items():
            if value is not None and hasattr(product, key):
                setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product_image(db: Session, product_id: int, image_url: str):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        product.image_url = image_url
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True


class EventService:
    @staticmethod
    def record_event(db: Session, customer_id: int, event_type: str, product_id=None, metadata=None):
        """Record a customer event."""
        event = CustomerEvent(
            customer_id=customer_id,
            event_type=event_type,
            product_id=product_id,
            event_metadata=metadata
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    
    @staticmethod
    def get_customer_events(db: Session, customer_id: int, limit: int = 100):
        return db.query(CustomerEvent).filter(
            CustomerEvent.customer_id == customer_id
        ).order_by(CustomerEvent.timestamp.desc()).limit(limit).all()
    
    @staticmethod
    def get_customer_events_in_timeframe(db: Session, customer_id: int, hours: int = 24):
        """Get customer events in the last N hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return db.query(CustomerEvent).filter(
            (CustomerEvent.customer_id == customer_id) &
            (CustomerEvent.timestamp >= cutoff_time)
        ).order_by(CustomerEvent.timestamp.desc()).all()


class PurchaseIntentAnalyzer:
    """Analyzes customer behavior and calculates purchase intent score."""
    
    @staticmethod
    def calculate_intent(db: Session, customer_id: int) -> dict:
        """Calculate purchase intent for a customer (0-100)."""
        
        # Get recent events (last 7 days)
        cutoff_time = datetime.utcnow() - timedelta(days=7)
        events = db.query(CustomerEvent).filter(
            (CustomerEvent.customer_id == customer_id) &
            (CustomerEvent.timestamp >= cutoff_time)
        ).all()
        
        # Get current cart
        active_carts = db.query(Cart).filter(
            (Cart.customer_id == customer_id) &
            (Cart.status == "active")
        ).all()
        
        # Calculate cart value
        cart_value = 0
        if active_carts:
            for cart in active_carts:
                for item in cart.items:
                    cart_value += item.price_at_time * item.quantity
        
        # Initialize score
        score = 0
        observations = []
        
        # Count event types
        event_counts = {}
        for event in events:
            event_type = event.event_type
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        # Product view score
        product_views = event_counts.get("product_view", 0)
        if product_views >= 3:
            score += 20
            observations.append(f"Viewed products {product_views} times")
        elif product_views >= 1:
            score += 10
            observations.append(f"Viewed products {product_views} time(s)")
        
        # Add to cart score
        add_to_cart_count = event_counts.get("add_to_cart", 0)
        if add_to_cart_count > 0:
            score += 25
            observations.append(f"Added {add_to_cart_count} product(s) to cart")
        
        # Checkout started score
        checkout_started = event_counts.get("checkout_started", 0)
        if checkout_started > 0:
            score += 30
            observations.append("Initiated checkout")
        
        # Cart value score
        if cart_value > 5000:
            score += 10
            observations.append(f"High cart value: ₹{cart_value}")
        elif cart_value > 1000:
            score += 5
            observations.append(f"Cart value: ₹{cart_value}")
        
        # Abandoned cart (previous)
        cart_abandoned = event_counts.get("cart_abandoned", 0)
        if cart_abandoned > 0 and checkout_started > 0:
            score += 10  # Shows serious intent, just abandoned
            observations.append("Abandoned checkout (high intent signal)")
        
        # Previous purchase
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer:
            purchase_events = db.query(CustomerEvent).filter(
                (CustomerEvent.customer_id == customer_id) &
                (CustomerEvent.event_type == "purchase_completed")
            ).all()
            if len(purchase_events) > 0:
                score += 5
                observations.append("Has previous purchase history")
        
        # Cap score at 100
        score = min(score, 100)
        
        # Determine intent level
        if score >= 70:
            intent_level = "HIGH"
        elif score >= 40:
            intent_level = "MEDIUM"
        else:
            intent_level = "LOW"
        
        return {
            "score": score,
            "level": intent_level,
            "observations": observations,
            "cart_value": cart_value
        }
    
    @staticmethod
    def get_behavior_summary(db: Session, customer_id: int) -> dict:
        """Get a summary of customer behavior for the AI agent."""
        
        # Get all events
        events = db.query(CustomerEvent).filter(
            CustomerEvent.customer_id == customer_id
        ).order_by(CustomerEvent.timestamp.desc()).all()
        
        # Get customer
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return None
        
        # Get active cart
        active_cart = db.query(Cart).filter(
            (Cart.customer_id == customer_id) &
            (Cart.status == "active")
        ).first()
        
        cart_items = []
        cart_value = 0
        if active_cart:
            for item in active_cart.items:
                if item.product:
                    cart_items.append({
                        "product_id": item.product_id,
                        "product_name": item.product.name,
                        "quantity": item.quantity,
                        "price": item.price_at_time
                    })
                    cart_value += item.price_at_time * item.quantity
        
        # Count events
        event_counts = {}
        for event in events:
            event_type = event.event_type
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        return {
            "customer_id": customer_id,
            "customer_name": customer.name,
            "customer_email": customer.email,
            "cart_value": cart_value,
            "cart_items": cart_items,
            "events": event_counts,
            "recent_events": [
                {
                    "type": e.event_type,
                    "product_id": e.product_id,
                    "timestamp": e.timestamp.isoformat()
                } for e in events[:10]
            ]
        }
