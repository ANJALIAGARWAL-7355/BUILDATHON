from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    events = relationship("CustomerEvent", back_populates="customer")
    carts = relationship("Cart", back_populates="customer")
    agent_decisions = relationship("AgentDecision", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(Text)
    category = Column(String(100), index=True)
    price = Column(Float)
    image_url = Column(Text)
    inventory = Column(Integer, default=100)
    rating = Column(Float, default=4.5)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cart_items = relationship("CartItem", back_populates="product")

class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    status = Column(String(50), default="active")  # active, abandoned, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    abandoned_at = Column(DateTime, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer, default=1)
    price_at_time = Column(Float)  # Price when added to cart
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

class CustomerEvent(Base):
    __tablename__ = "customer_events"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    event_type = Column(String(100), index=True)  # product_view, add_to_cart, etc.
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    event_metadata = Column("metadata", JSON, nullable=True)  # Additional event data
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="events")

class AgentDecision(Base):
    __tablename__ = "agent_decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    intent_score = Column(Float)  # 0-100
    intent_level = Column(String(20))  # LOW, MEDIUM, HIGH
    observations = Column(JSON)  # Array of observed signals
    decision = Column(String(100))  # Action decided by agent
    reason = Column(Text)  # Explanation for decision
    action_taken = Column(Text)  # What action was actually taken
    result_outcome = Column(String(50), nullable=True)  # success, failed, pending
    revenue_impact = Column(Float, nullable=True)  # ₹ amount if successful
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="agent_decisions")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    amount = Column(Float)
    status = Column(String(50), default="pending")  # pending, success, failed
    razorpay_payment_link_id = Column(String(255), nullable=True, index=True)
    razorpay_payment_id = Column(String(255), nullable=True, index=True)
    cart_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="payments")
