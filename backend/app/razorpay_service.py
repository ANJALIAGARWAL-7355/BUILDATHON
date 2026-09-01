import json
import uuid
import razorpay
from app.config import settings
from sqlalchemy.orm import Session
from app.models import Payment
from datetime import datetime
from typing import Optional

class RazorpayService:
    """Handles Razorpay payment integration with mock fallback."""
    
    def __init__(self):
        self.use_mock = settings.USE_MOCK_PAYMENTS or not (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
        self.mock_payment_links = {}  # In-memory store for mock payments
        
        if not self.use_mock:
            try:
                self.client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
            except Exception as e:
                print(f"Failed to initialize Razorpay client: {e}. Falling back to mock mode.")
                self.use_mock = True
    
    def create_payment_link(self, customer_id: int, amount: float, description: str = "Cart Purchase") -> dict:
        """Create a Razorpay payment link."""
        
        if self.use_mock:
            return self._create_mock_payment_link(customer_id, amount, description)
        
        try:
            # Create payment link via Razorpay API
            response = self.client.invoice.create({
                "amount": int(amount * 100),  # Convert to paise
                "currency": "INR",
                "customer_id": str(customer_id),
                "description": description,
                "notes": {
                    "customer_id": str(customer_id)
                }
            })
            
            return {
                "success": True,
                "payment_link_id": response.get("id"),
                "payment_link_url": response.get("short_url"),
                "amount": amount,
                "is_mock": False
            }
        except Exception as e:
            print(f"Razorpay API error: {e}. Falling back to mock mode.")
            return self._create_mock_payment_link(customer_id, amount, description)
    
    def _create_mock_payment_link(self, customer_id: int, amount: float, description: str) -> dict:
        """Create a mock payment link for testing."""
        
        link_id = f"link_{uuid.uuid4().hex[:12]}"
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        
        self.mock_payment_links[link_id] = {
            "payment_id": payment_id,
            "customer_id": customer_id,
            "amount": amount,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "description": description
        }
        
        return {
            "success": True,
            "payment_link_id": link_id,
            "payment_link_url": f"http://localhost:5173/mock-payment/{link_id}",
            "amount": amount,
            "is_mock": True
        }
    
    def get_payment_status(self, payment_link_id: str) -> dict:
        """Get payment status."""
        
        if self.use_mock:
            return self._get_mock_payment_status(payment_link_id)
        
        try:
            response = self.client.invoice.fetch(payment_link_id)
            return {
                "status": response.get("status"),
                "amount": response.get("amount") / 100,  # Convert from paise
                "is_mock": False
            }
        except Exception as e:
            print(f"Error fetching payment status: {e}")
            return self._get_mock_payment_status(payment_link_id)
    
    def _get_mock_payment_status(self, payment_link_id: str) -> dict:
        """Get mock payment status."""
        
        if payment_link_id in self.mock_payment_links:
            link_data = self.mock_payment_links[payment_link_id]
            return {
                "status": link_data["status"],
                "amount": link_data["amount"],
                "is_mock": True
            }
        
        return {
            "status": "not_found",
            "is_mock": True
        }
    
    def mark_payment_success(self, db: Session, payment_link_id: str, customer_id: int):
        """Mark a payment as successful (mainly for mock mode)."""
        
        if payment_link_id in self.mock_payment_links:
            link_data = self.mock_payment_links[payment_link_id]
            link_data["status"] = "success"
            
            # Update database
            payment = db.query(Payment).filter(
                Payment.razorpay_payment_link_id == payment_link_id
            ).first()
            
            if payment:
                payment.status = "success"
                payment.razorpay_payment_id = link_data["payment_id"]
                payment.completed_at = datetime.utcnow()
                db.commit()
                return True
        
        return False


# Global instance
razorpay_service = RazorpayService()
