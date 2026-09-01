import json
import google.generativeai as genai
from app.config import settings
from sqlalchemy.orm import Session
from app.models import AgentDecision, Payment, Cart, CustomerEvent
from app.services import PurchaseIntentAnalyzer, ProductService
from app.razorpay_service import razorpay_service
from datetime import datetime
from typing import Optional, Dict, Any

class AIAgent:
    """Autonomous AI Commerce Growth Agent with tool calling."""
    
    def __init__(self):
        self.use_mock = settings.AI_PROVIDER == "mock" or (not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY)
        
        if not self.use_mock and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self.provider = "gemini"
        else:
            self.provider = "mock"
            self.use_mock = True
    
    def define_tools(self):
        """Define tools available to the AI agent."""
        return [
            {
                "name": "get_customer_behavior",
                "description": "Get customer's browsing and purchase behavior",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "type": "integer",
                            "description": "The customer's ID"
                        }
                    },
                    "required": ["customer_id"]
                }
            },
            {
                "name": "get_cart",
                "description": "Get customer's current cart contents and value",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "type": "integer",
                            "description": "The customer's ID"
                        }
                    },
                    "required": ["customer_id"]
                }
            },
            {
                "name": "calculate_purchase_intent",
                "description": "Calculate purchase intent score for a customer (0-100)",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "type": "integer",
                            "description": "The customer's ID"
                        }
                    },
                    "required": ["customer_id"]
                }
            },
            {
                "name": "create_payment_link",
                "description": "Create a Razorpay payment recovery link",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "type": "integer",
                            "description": "The customer's ID"
                        },
                        "amount": {
                            "type": "number",
                            "description": "Amount in rupees"
                        }
                    },
                    "required": ["customer_id", "amount"]
                }
            }
        ]
    
    def get_system_prompt(self):
        """Get the system prompt for the AI agent."""
        return """You are RazorGrowth AI, an autonomous commerce growth agent.

Your goal: Increase successful purchases and merchant revenue while maintaining excellent customer experience.

You have access to customer behavior data and tools to take action.

DECISION FRAMEWORK:

For each customer, you must:
1. Analyze their behavior using available tools
2. Calculate their purchase intent
3. Decide on the best action

DECISION RULES:

LOW INTENT (0-39%):
- Do nothing. Customer is not ready.

MEDIUM INTENT (40-69%):
- Send a friendly reminder or recommendation
- Decision: SEND_REMINDER

HIGH INTENT (70-100%):
- If checkout was abandoned: CREATE_PAYMENT_LINK (strongest signal of purchase readiness)
- If only browsing: SEND_RECOMMENDATION
- Decision: CREATE_PAYMENT_LINK

IMPORTANT:
- Never be spammy
- Always have evidence before intervening
- Prioritize customer experience
- Be concise in your reasoning

After analyzing, respond with a JSON structure:
{
    "customer_id": <number>,
    "intent_score": <0-100>,
    "intent_level": "<LOW|MEDIUM|HIGH>",
    "observations": [<list of observed signals>],
    "decision": "<SEND_REMINDER|CREATE_PAYMENT_LINK|SEND_RECOMMENDATION|DO_NOTHING>",
    "reason": "<brief explanation>",
    "action_details": {<any additional details>}
}"""
    
    def analyze_customer(self, db: Session, customer_id: int) -> dict:
        """Analyze customer and make decision."""
        
        # Get behavior summary
        intent_data = PurchaseIntentAnalyzer.calculate_intent(db, customer_id)
        behavior_summary = PurchaseIntentAnalyzer.get_behavior_summary(db, customer_id)
        
        if not behavior_summary:
            return {
                "success": False,
                "error": "Customer not found"
            }
        
        # Use mock agent or real AI
        if self.use_mock:
            return self._analyze_with_mock(intent_data, behavior_summary)
        else:
            return self._analyze_with_ai(db, customer_id, intent_data, behavior_summary)
    
    def _analyze_with_mock(self, intent_data: dict, behavior_summary: dict) -> dict:
        """Mock agent analysis using rule-based logic."""
        
        intent_score = intent_data["score"]
        intent_level = intent_data["level"]
        observations = intent_data["observations"]
        cart_value = intent_data["cart_value"]
        
        # Decide action based on intent level and signals
        decision = "DO_NOTHING"
        reason = ""
        action_details = {}
        payment_link = None
        
        if intent_level == "HIGH":
            # Check if checkout was abandoned
            if any("checkout" in obs.lower() for obs in observations):
                decision = "CREATE_PAYMENT_LINK"
                reason = f"High purchase intent detected ({intent_score}%). Customer abandoned checkout with ₹{cart_value} in cart."
                action_details = {
                    "amount": cart_value,
                    "message_type": "payment_recovery"
                }
                payment_link = "payment_link_created"
            else:
                decision = "SEND_RECOMMENDATION"
                reason = f"High purchase intent but no checkout abandonment. Customer browsing with cart value ₹{cart_value}."
                
        elif intent_level == "MEDIUM":
            decision = "SEND_REMINDER"
            reason = f"Medium purchase intent ({intent_score}%). Gentle reminder might help."
            
        else:
            decision = "DO_NOTHING"
            reason = f"Low purchase intent ({intent_score}%). No intervention needed."
        
        return {
            "success": True,
            "customer_id": behavior_summary["customer_id"],
            "customer_name": behavior_summary["customer_name"],
            "intent_score": intent_score,
            "intent_level": intent_level,
            "observations": observations,
            "decision": decision,
            "reason": reason,
            "action_details": action_details,
            "payment_link": payment_link,
            "is_mock": True
        }
    
    def _analyze_with_ai(self, db: Session, customer_id: int, intent_data: dict, behavior_summary: dict) -> dict:
        """Use real AI API for analysis."""
        try:
            intent_text = f"""
Customer ID: {customer_id}
Customer Name: {behavior_summary['customer_name']}
Cart Value: ₹{behavior_summary['cart_value']}
Cart Items: {json.dumps(behavior_summary['cart_items'])}

Events Summary:
{json.dumps(behavior_summary['events'])}

Recent Events:
{json.dumps(behavior_summary['recent_events'])}

Purchase Intent Score: {intent_data['score']}/100
Intent Level: {intent_data['level']}
Observed Signals: {', '.join(intent_data['observations'])}

Based on this data, analyze the customer and decide the best action."""

            response = self.model.generate_content(
                intent_text,
                tools=self.define_tools()
            )
            
            # Parse response
            response_text = response.text
            
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                result["is_mock"] = False
                return result
            
            # Fallback if no JSON found
            return self._analyze_with_mock(intent_data, behavior_summary)
            
        except Exception as e:
            print(f"AI API error: {e}. Falling back to mock.")
            return self._analyze_with_mock(intent_data, behavior_summary)
    
    def execute_decision(self, db: Session, analysis: dict) -> dict:
        """Execute the agent's decision."""
        
        customer_id = analysis["customer_id"]
        decision = analysis.get("decision", "DO_NOTHING")
        
        # Create agent decision record
        agent_decision = AgentDecision(
            customer_id=customer_id,
            intent_score=analysis["intent_score"],
            intent_level=analysis["intent_level"],
            observations=analysis.get("observations", []),
            decision=decision,
            reason=analysis["reason"],
            action_taken=f"Decision: {decision}",
            result_outcome="pending"
        )
        
        db.add(agent_decision)
        db.commit()
        db.refresh(agent_decision)
        
        result = {
            "agent_decision_id": agent_decision.id,
            "decision": decision,
            "status": "executed"
        }
        
        # Execute specific actions
        if decision == "CREATE_PAYMENT_LINK":
            amount = analysis.get("action_details", {}).get("amount", 0)
            if amount > 0:
                payment_link_data = razorpay_service.create_payment_link(
                    customer_id,
                    amount,
                    "Cart Recovery - Complete Your Purchase"
                )
                
                # Save payment record
                payment = Payment(
                    customer_id=customer_id,
                    amount=amount,
                    status="pending",
                    razorpay_payment_link_id=payment_link_data.get("payment_link_id"),
                    cart_id=None
                )
                db.add(payment)
                db.commit()
                
                result["payment_link"] = payment_link_data
                agent_decision.action_taken = f"Payment link created: {payment_link_data.get('payment_link_url')}"
                db.commit()
        
        return result


# Global instance
ai_agent = AIAgent()
