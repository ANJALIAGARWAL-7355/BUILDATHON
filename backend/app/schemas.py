from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# ============= CUSTOMER SCHEMAS =============
class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= PRODUCT SCHEMAS =============
class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    image_url: str
    inventory: int = 100
    rating: float = 4.5

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    inventory: Optional[int] = None
    rating: Optional[float] = None

class ProductImageUpdate(BaseModel):
    image_url: str

class UploadResponse(BaseModel):
    url: str
    filename: str
    success: bool = True

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float
    image_url: str
    inventory: int
    rating: float
    
    class Config:
        from_attributes = True

# ============= CART SCHEMAS =============
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time: float
    product: Optional[ProductResponse]
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    items: List[CartItemResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AddToCartRequest(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = 1

class RemoveFromCartRequest(BaseModel):
    cart_id: int
    product_id: int

# ============= EVENT SCHEMAS =============
class CustomerEventCreate(BaseModel):
    customer_id: int
    event_type: str
    product_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class CustomerEventResponse(BaseModel):
    id: int
    customer_id: int
    event_type: str
    product_id: Optional[int]
    metadata: Optional[Dict[str, Any]] = Field(None, validation_alias="event_metadata")
    timestamp: datetime
    
    class Config:
        from_attributes = True

# ============= AGENT DECISION SCHEMAS =============
class AgentDecisionResponse(BaseModel):
    id: int
    customer_id: int
    intent_score: float
    intent_level: str
    observations: List[str]
    decision: str
    reason: str
    action_taken: str
    result_outcome: Optional[str]
    revenue_impact: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= PAYMENT SCHEMAS =============
class PaymentResponse(BaseModel):
    id: int
    customer_id: int
    amount: float
    status: str
    razorpay_payment_link_id: Optional[str]
    razorpay_payment_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CreatePaymentLinkRequest(BaseModel):
    customer_id: int
    amount: float
    cart_id: Optional[int] = None

class MockPaymentSuccessRequest(BaseModel):
    payment_id: str

# ============= AGENT REQUEST/RESPONSE =============
class AnalyzeCustomerRequest(BaseModel):
    customer_id: int

class AgentAnalysisResponse(BaseModel):
    customer_id: int
    intent_score: float
    intent_level: str
    observations: List[str]
    decision: str
    reason: str
    action_taken: str
    payment_link: Optional[str] = None

class SearchProductsRequest(BaseModel):
    query: str
    max_results: int = 5

# ============= DASHBOARD SCHEMAS =============
class DashboardMetrics(BaseModel):
    total_revenue: float
    revenue_recovered_by_ai: float
    abandoned_carts_count: int
    customers_reengaged: int
    ai_intervention_success_rate: float
    total_customers: int
    total_products: int

class AgentActivityItem(BaseModel):
    customer_id: int
    customer_name: str
    product_name: str
    cart_value: float
    intent_score: float
    decision: str
    action_taken: str
    status: str
    created_at: datetime

class RevenueChartPoint(BaseModel):
    date: str
    amount: float

class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    recent_activities: List[AgentActivityItem]
    revenue_chart: List[RevenueChartPoint]
