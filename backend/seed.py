# -*- coding: utf-8 -*-
"""
Database seeding script.
Populates the database with sample products, customers, and events for demo.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, Product, Customer, Cart, CartItem, CustomerEvent, Payment, AgentDecision
from app.config import settings
from datetime import datetime, timedelta
import random

# Create engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_database():
    """Seed database with demo data and relevant high-resolution fashion imagery."""
    
    # Drop and recreate all tables for fresh schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Seeding database with premium demo data and high-definition photography...")
    
    # ============= PRODUCTS =============
    products = [
        # DRESSES
        Product(
            name="Black Evening Dress",
            description="Ultra-luxe floor-length black evening gown tailored with silk-blend fabric and open-back silhouette. Perfect for galas and cocktail parties.",
            category="Dresses",
            price=2499.00,
            image_url="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
            inventory=10,
            rating=4.9
        ),
        Product(
            name="Blue Floral Dress",
            description="Breezy sky-blue floral printed midi dress with ruffled hem and sweetheart neckline. Ideal for summer brunches and garden weddings.",
            category="Dresses",
            price=1899.00,
            image_url="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
            inventory=15,
            rating=4.7
        ),
        Product(
            name="Red Party Dress",
            description="Vibrant crimson off-shoulder party dress with satin finish and contoured bodycon silhouette for unforgettable nights out.",
            category="Dresses",
            price=1799.00,
            image_url="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
            inventory=8,
            rating=4.8
        ),
        Product(
            name="White Summer Dress",
            description="Lightweight ivory bohemian summer sun dress crafted from 100% organic breathable cotton with delicate embroidered lace trim.",
            category="Dresses",
            price=1299.00,
            image_url="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
            inventory=20,
            rating=4.6
        ),
        Product(
            name="Green Silk Dress",
            description="Magnificent emerald green pure mulberry silk slip dress with cowl neck and lustrous liquid-drape texture.",
            category="Dresses",
            price=3299.00,
            image_url="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80",
            inventory=6,
            rating=4.9
        ),

        # TOPS
        Product(
            name="Casual White Top",
            description="Minimalist ribbed white organic cotton t-shirt with crew neck and breathable relaxed fit for elevated daily wear.",
            category="Tops",
            price=599.00,
            image_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            inventory=30,
            rating=4.4
        ),
        Product(
            name="Black Crop Top",
            description="Contemporary sculpted black ribbed knit crop top designed with seamless edge finish and structured stretch profile.",
            category="Tops",
            price=799.00,
            image_url="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
            inventory=25,
            rating=4.5
        ),
        Product(
            name="Blue Denim Jacket",
            description="Vintage-inspired washed denim trucker jacket with matte brass hardware, dual chest pockets, and relaxed oversized cut.",
            category="Tops",
            price=1499.00,
            image_url="https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
            inventory=12,
            rating=4.7
        ),

        # SHOES
        Product(
            name="Black Casual Shoes",
            description="Handcrafted Italian-style black full-grain leather derbies with memory-foam cushioned insole and rugged rubber outsole.",
            category="Shoes",
            price=1999.00,
            image_url="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
            inventory=18,
            rating=4.6
        ),
        Product(
            name="White Sneakers",
            description="Iconic ultra-clean white low-top leather sneakers with sleek perforated detailing and all-day ergonomic arch support.",
            category="Shoes",
            price=2299.00,
            image_url="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
            inventory=22,
            rating=4.8
        ),
        Product(
            name="Gold Heels",
            description="Dazzling metallic champagne-gold stiletto heels with delicate criss-cross ankle straps and cushioned ball support.",
            category="Shoes",
            price=2899.00,
            image_url="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
            inventory=10,
            rating=4.9
        ),

        # ACCESSORIES
        Product(
            name="Brown Leather Bag",
            description="Spacious artisan cognac-brown genuine leather tote handbag with gold-tone zip closure and dedicated tablet sleeve.",
            category="Accessories",
            price=3499.00,
            image_url="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
            inventory=14,
            rating=4.8
        ),
        Product(
            name="Gold Necklace",
            description="Radiant 18K yellow-gold vermeil layered chain necklace adorned with a radiant sunburst coin pendant.",
            category="Accessories",
            price=1599.00,
            image_url="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            inventory=20,
            rating=4.7
        ),
        Product(
            name="Silver Bracelet",
            description="Shimmering 925 sterling silver tennis charm bracelet inlaid with brilliant zircon gemstones and safety clasp.",
            category="Accessories",
            price=1299.00,
            image_url="https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80",
            inventory=18,
            rating=4.6
        ),
        Product(
            name="Black Sunglasses",
            description="Signature oversized square black sunglasses with UV400 polarized dark grey lenses and reinforced acetate frame.",
            category="Accessories",
            price=1099.00,
            image_url="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
            inventory=25,
            rating=4.5
        ),
        Product(
            name="Floral Scarf",
            description="Luxuriously soft 100% pure silk square scarf with hand-rolled edges and intricate watercolor botanical print.",
            category="Accessories",
            price=799.00,
            image_url="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
            inventory=30,
            rating=4.5
        ),
    ]
    
    db.add_all(products)
    db.commit()
    
    print(f"[OK] Created {len(products)} products with relevant photography")
    
    # ============= CUSTOMERS =============
    customers = [
        Customer(
            name="Anjali Agarwal",
            email="anjali@example.com",
            phone="9876543210",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        ),
        Customer(
            name="Priya Sharma",
            email="priya@example.com",
            phone="9876543211",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
        ),
        Customer(
            name="Neha Patel",
            email="neha@example.com",
            phone="9876543212",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
        ),
        Customer(
            name="Isha Gupta",
            email="isha@example.com",
            phone="9876543213",
            avatar_url="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80"
        ),
        Customer(
            name="Riya Singh",
            email="riya@example.com",
            phone="9876543214",
            avatar_url="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80"
        ),
    ]
    
    db.add_all(customers)
    db.commit()
    
    print(f"[OK] Created {len(customers)} customers with profile avatars")
    
    # ============= EVENTS AND CARTS =============
    # Create demo scenario: Customer 1 (Anjali) with abandoned cart
    customer_1 = customers[0]
    
    # Event 1: Product views
    for _ in range(4):
        event = CustomerEvent(
            customer_id=customer_1.id,
            event_type="product_view",
            product_id=products[0].id,  # Black Evening Dress
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 6))
        )
        db.add(event)
    
    # Event 2: Add to cart
    event = CustomerEvent(
        customer_id=customer_1.id,
        event_type="add_to_cart",
        product_id=products[0].id,
        event_metadata={"quantity": 1},
        timestamp=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(event)
    
    # Create active cart with item
    cart_1 = Cart(customer_id=customer_1.id, status="abandoned", abandoned_at=datetime.utcnow() - timedelta(minutes=30))
    db.add(cart_1)
    db.commit()
    db.refresh(cart_1)
    
    cart_item = CartItem(
        cart_id=cart_1.id,
        product_id=products[0].id,
        quantity=1,
        price_at_time=products[0].price
    )
    db.add(cart_item)
    
    # Event 3: Checkout started
    event = CustomerEvent(
        customer_id=customer_1.id,
        event_type="checkout_started",
        timestamp=datetime.utcnow() - timedelta(hours=1)
    )
    db.add(event)
    
    # Event 4: Cart abandoned
    event = CustomerEvent(
        customer_id=customer_1.id,
        event_type="cart_abandoned",
        timestamp=datetime.utcnow() - timedelta(minutes=30)
    )
    db.add(event)
    
    db.commit()
    
    # Customer 2 (Priya): Completed purchase
    customer_2 = customers[1]
    
    event = CustomerEvent(
        customer_id=customer_2.id,
        event_type="product_view",
        product_id=products[1].id,
        timestamp=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(event)
    
    event = CustomerEvent(
        customer_id=customer_2.id,
        event_type="add_to_cart",
        product_id=products[1].id,
        timestamp=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(event)
    
    event = CustomerEvent(
        customer_id=customer_2.id,
        event_type="checkout_started",
        timestamp=datetime.utcnow() - timedelta(hours=1)
    )
    db.add(event)
    
    event = CustomerEvent(
        customer_id=customer_2.id,
        event_type="purchase_completed",
        product_id=products[1].id,
        event_metadata={"amount": products[1].price},
        timestamp=datetime.utcnow() - timedelta(minutes=10)
    )
    db.add(event)
    
    # Create completed cart for Customer 2
    cart_2 = Cart(customer_id=customer_2.id, status="completed")
    db.add(cart_2)
    db.commit()
    db.refresh(cart_2)
    
    cart_item_2 = CartItem(
        cart_id=cart_2.id,
        product_id=products[1].id,
        quantity=1,
        price_at_time=products[1].price
    )
    db.add(cart_item_2)
    
    # Completed payment for customer 2
    payment_2 = Payment(
        customer_id=customer_2.id,
        amount=products[1].price,
        status="success",
        razorpay_payment_link_id="plink_mock_priya_01",
        razorpay_payment_id="pay_mock_priya_01",
        cart_id=cart_2.id,
        completed_at=datetime.utcnow() - timedelta(minutes=10)
    )
    db.add(payment_2)
    
    # Seed historical successful agent decisions for analytics
    decision_demo = AgentDecision(
        customer_id=customer_2.id,
        intent_score=89.5,
        intent_level="HIGH",
        observations=["Viewed product 3 times", "Added to cart", "Initiated checkout", "High price tier"],
        decision="CREATE_PAYMENT_LINK",
        reason="Customer showed high purchase intent (89.5%) with cart abandonment at checkout. Instant payment link recovery recommended.",
        action_taken="Generated Razorpay payment link with 10% instant recovery incentive and dispatched via WhatsApp.",
        result_outcome="success",
        revenue_impact=products[1].price,
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db.add(decision_demo)
    
    db.commit()
    
    print(f"[OK] Created customer events, carts, payments, and decision history")
    print(f"\n[SUCCESS] Seeding completed with relevant fashion photography!")
    print(f"   - Anjali Agarwal: High Intent Cart Abandonment (Rs. {products[0].price})")
    print(f"   - Priya Sharma: Recovered Purchase (Rs. {products[1].price})")
    print(f"   - Ready for live agent recovery demonstration.")
    
    db.close()

if __name__ == "__main__":
    seed_database()
