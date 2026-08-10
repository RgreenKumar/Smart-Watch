"""
tests/test_rag.py
=================
Automated RAG system test suite.
Tests retrieval quality, hallucination prevention,
answer accuracy, and edge cases.

Run:
    conda activate rag
    cd Desktop\claud_rag-chat-bot\rag_system
    python tests/test_rag.py

Run with detailed output:
    python tests/test_rag.py --verbose

Run specific category:
    python tests/test_rag.py --category price

Run and save report:
    python tests/test_rag.py --report
"""

import sys
import os
import json
import time
import argparse
import requests
from datetime import datetime
from typing import List, Dict, Optional

# ── Add project root to path ──────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Configuration ─────────────────────────────────────────────────────────────
API_URL     = "http://localhost:5000/chat"
TIMEOUT     = 60       # seconds per request
PASS_SCORE  = 60       # minimum % to pass overall


# ══════════════════════════════════════════════════════════════════════════════
# TEST CASES
# Each test case:
#   question    : what the user asks
#   must_contain: at least ONE of these strings must be in the answer
#   must_not    : NONE of these strings should be in the answer
#   category    : test group name
#   note        : what this test checks
# ══════════════════════════════════════════════════════════════════════════════

TEST_CASES = [

    # ── PRICE QUESTIONS ───────────────────────────────────────────────────────
    {
        "question":     "What is the price of cashews?",
        "must_contain": ["275", "300", "8%"],
        "must_not":     ["pista", "walnut"],
        "category":     "price",
        "note":         "Direct price lookup"
    },
    {
        "question":     "How much does badam cost?",
        "must_contain": ["250", "275", "9%"],
        "must_not":     ["cashew", "honey"],
        "category":     "price",
        "note":         "Direct price lookup - badam"
    },
    {
        "question":     "What is the price of kismish?",
        "must_contain": ["75", "100", "25%"],
        "must_not":     [],
        "category":     "price",
        "note":         "Highest discount product"
    },
    {
        "question":     "How much is honey?",
        "must_contain": ["125", "150", "17%"],
        "must_not":     [],
        "category":     "price",
        "note":         "Honey price lookup"
    },
    {
        "question":     "What is the price of dates?",
        "must_contain": ["95", "100", "5%"],
        "must_not":     [],
        "category":     "price",
        "note":         "Dates price lookup"
    },
    {
        "question":     "Pista price?",
        "must_contain": ["275", "300", "8%"],
        "must_not":     [],
        "category":     "price",
        "note":         "Short form question"
    },
    {
        "question":     "Walnuts cost?",
        "must_contain": ["275", "300"],
        "must_not":     [],
        "category":     "price",
        "note":         "Very short question"
    },
    {
        "question":     "What is the MRP of apricot?",
        "must_contain": ["300", "290", "3%"],
        "must_not":     [],
        "category":     "price",
        "note":         "MRP vs sale price distinction"
    },
    {
        "question":     "How much does atthipalam cost?",
        "must_contain": ["275", "300"],
        "must_not":     [],
        "category":     "price",
        "note":         "Tamil product name"
    },
    {
        "question":     "What is black dates price?",
        "must_contain": ["275", "300", "8%"],
        "must_not":     [],
        "category":     "price",
        "note":         "Black dates price"
    },

    # ── HINDI NAME QUESTIONS ──────────────────────────────────────────────────
    {
        "question":     "Kaju price?",
        "must_contain": ["275", "cashew"],
        "must_not":     [],
        "category":     "hindi_names",
        "note":         "Hindi: kaju = cashew"
    },
    {
        "question":     "Akhrot kitne ka hai?",
        "must_contain": ["275", "walnut"],
        "must_not":     [],
        "category":     "hindi_names",
        "note":         "Hindi: akhrot = walnut"
    },
    {
        "question":     "Khajoor price?",
        "must_contain": ["95", "dates"],
        "must_not":     [],
        "category":     "hindi_names",
        "note":         "Hindi: khajoor = dates"
    },
    {
        "question":     "Kishmish ka rate?",
        "must_contain": ["75", "raisin"],
        "must_not":     [],
        "category":     "hindi_names",
        "note":         "Hindi: kishmish = raisins"
    },
    {
        "question":     "Badam ka price kya hai?",
        "must_contain": ["250", "almond"],
        "must_not":     [],
        "category":     "hindi_names",
        "note":         "Hindi question format"
    },

    # ── DISCOUNT QUESTIONS ────────────────────────────────────────────────────
    {
        "question":     "Which product has the highest discount?",
        "must_contain": ["kismish", "25%", "raisin"],
        "must_not":     [],
        "category":     "discount",
        "note":         "Kismish has highest 25% discount"
    },
    {
        "question":     "Which product has the lowest discount?",
        "must_contain": ["apricot", "3%"],
        "must_not":     [],
        "category":     "discount",
        "note":         "Apricot has lowest 3% discount"
    },
    {
        "question":     "What is the discount on honey?",
        "must_contain": ["17%", "17"],
        "must_not":     [],
        "category":     "discount",
        "note":         "Honey discount percentage"
    },
    {
        "question":     "How much do I save on kismish?",
        "must_contain": ["25", "75", "100"],
        "must_not":     [],
        "category":     "discount",
        "note":         "Saving calculation"
    },
    {
        "question":     "Is there any offer on badam?",
        "must_contain": ["9%", "250", "275"],
        "must_not":     [],
        "category":     "discount",
        "note":         "Offer/discount question"
    },

    # ── HEALTH BENEFIT QUESTIONS ──────────────────────────────────────────────
    {
        "question":     "What are the benefits of almonds?",
        "must_contain": ["vitamin", "heart", "cholesterol"],
        "must_not":     [],
        "category":     "health",
        "note":         "Almond health benefits"
    },
    {
        "question":     "Which nut has the most protein?",
        "must_contain": ["pista", "pistachio", "6g", "protein"],
        "must_not":     [],
        "category":     "health",
        "note":         "Protein content comparison"
    },
    {
        "question":     "What nut is best for brain?",
        "must_contain": ["walnut", "omega", "brain"],
        "must_not":     [],
        "category":     "health",
        "note":         "Brain health recommendation"
    },
    {
        "question":     "Which nuts reduce cholesterol?",
        "must_contain": ["walnut", "almond", "cholesterol", "ldl"],
        "must_not":     [],
        "category":     "health",
        "note":         "Cholesterol reduction"
    },
    {
        "question":     "Is honey good for health?",
        "must_contain": ["antioxidant", "immune", "antimicrobial"],
        "must_not":     [],
        "category":     "health",
        "note":         "Honey health benefits"
    },
    {
        "question":     "What are benefits of eating walnuts daily?",
        "must_contain": ["omega", "brain", "heart", "cholesterol"],
        "must_not":     [],
        "category":     "health",
        "note":         "Walnut daily benefits"
    },
    {
        "question":     "Is pista good for diabetics?",
        "must_contain": ["blood sugar", "pistachio", "pista"],
        "must_not":     [],
        "category":     "health",
        "note":         "Diabetes and pistachios"
    },
    {
        "question":     "Are dates good for energy?",
        "must_contain": ["energy", "fiber", "dates"],
        "must_not":     [],
        "category":     "health",
        "note":         "Dates energy benefit"
    },
    {
        "question":     "Which nuts are good for heart patients?",
        "must_contain": ["almond", "walnut", "heart"],
        "must_not":     [],
        "category":     "health",
        "note":         "Heart health nuts"
    },
    {
        "question":     "How many nuts should I eat per day?",
        "must_contain": ["28g", "1 oz", "handful", "serving"],
        "must_not":     [],
        "category":     "health",
        "note":         "Serving size recommendation"
    },
    {
        "question":     "Is apricot good for eyes?",
        "must_contain": ["beta-carotene", "vitamin a", "eye"],
        "must_not":     [],
        "category":     "health",
        "note":         "Apricot eye health"
    },
    {
        "question":     "What are benefits of figs?",
        "must_contain": ["fiber", "calcium", "bone", "fig"],
        "must_not":     [],
        "category":     "health",
        "note":         "Fig health benefits"
    },
    {
        "question":     "Are raisins good for digestion?",
        "must_contain": ["fiber", "digest", "raisin", "kismish"],
        "must_not":     [],
        "category":     "health",
        "note":         "Raisin digestion benefit"
    },
    {
        "question":     "Which nut has omega 3?",
        "must_contain": ["walnut", "omega"],
        "must_not":     [],
        "category":     "health",
        "note":         "Omega-3 source"
    },

    # ── ABOUT STORE QUESTIONS ─────────────────────────────────────────────────
    {
        "question":     "Where is RGreenMart located?",
        "must_contain": ["madurai", "tamil nadu", "625005"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Store location"
    },
    {
        "question":     "What is RGreenMart phone number?",
        "must_contain": ["96555", "62772"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Contact number"
    },
    {
        "question":     "What is RGreenMart email?",
        "must_contain": ["sales@rgreenmart.com"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Email address"
    },
    {
        "question":     "When was RGreenMart established?",
        "must_contain": ["1995"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Establishment year"
    },
    {
        "question":     "What is the tagline of RGreenMart?",
        "must_contain": ["fresh", "pure", "premium"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Brand tagline"
    },
    {
        "question":     "Is RGreenMart a certified store?",
        "must_contain": ["licensed", "certified", "quality"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Certification status"
    },
    {
        "question":     "What brand of products does RGreenMart sell?",
        "must_contain": ["nalan"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Brand name"
    },
    {
        "question":     "Is RGreenMart available on WhatsApp?",
        "must_contain": ["whatsapp", "96555", "62772"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "WhatsApp support"
    },
    {
        "question":     "What are RGreenMart support hours?",
        "must_contain": ["24/7", "support"],
        "must_not":     [],
        "category":     "store_info",
        "note":         "Support availability"
    },

    # ── DELIVERY QUESTIONS ────────────────────────────────────────────────────
    {
        "question":     "Is there free delivery?",
        "must_contain": ["499", "free delivery", "free"],
        "must_not":     ["not available", "do not have"],
        "category":     "delivery",
        "note":         "Free delivery threshold"
    },
    {
        "question":     "How many days for delivery?",
        "must_contain": ["3", "7", "business days"],
        "must_not":     [],
        "category":     "delivery",
        "note":         "Delivery time"
    },
    {
        "question":     "Do you deliver across India?",
        "must_contain": ["india", "deliver"],
        "must_not":     [],
        "category":     "delivery",
        "note":         "Delivery coverage"
    },
    {
        "question":     "What is minimum order for free shipping?",
        "must_contain": ["499"],
        "must_not":     [],
        "category":     "delivery",
        "note":         "Free shipping threshold"
    },
    {
        "question":     "Is same day delivery available?",
        "must_contain": ["not available", "standard", "3"],
        "must_not":     [],
        "category":     "delivery",
        "note":         "Same day delivery - should say not available"
    },
    {
        "question":     "Can I track my order?",
        "must_contain": ["track", "email", "whatsapp"],
        "must_not":     [],
        "category":     "delivery",
        "note":         "Order tracking"
    },

    # ── RETURN & REFUND QUESTIONS ─────────────────────────────────────────────
    {
        "question":     "What is the return policy?",
        "must_contain": ["48 hours", "damaged", "return"],
        "must_not":     [],
        "category":     "return",
        "note":         "Return policy"
    },
    {
        "question":     "Can I cancel my order?",
        "must_contain": ["cancel", "ship", "before"],
        "must_not":     [],
        "category":     "return",
        "note":         "Cancellation policy"
    },
    {
        "question":     "How do I return a damaged product?",
        "must_contain": ["48 hours", "email", "whatsapp", "contact"],
        "must_not":     [],
        "category":     "return",
        "note":         "Damaged product return"
    },
    {
        "question":     "Can I return after 1 week?",
        "must_contain": ["48 hours", "no"],
        "must_not":     [],
        "category":     "return",
        "note":         "Return time limit - should say no"
    },
    {
        "question":     "How do I get a refund?",
        "must_contain": ["48 hours", "contact", "sales@rgreenmart"],
        "must_not":     [],
        "category":     "return",
        "note":         "Refund process"
    },

    # ── HALLUCINATION TRAP QUESTIONS ──────────────────────────────────────────
    {
        "question":     "Do you sell peanuts?",
        "must_contain": ["not", "information", "available"],
        "must_not":     ["yes", "rs.", "price"],
        "category":     "hallucination",
        "note":         "Peanuts not in catalog - should say not available"
    },
    {
        "question":     "What is your GST number?",
        "must_contain": ["not", "information"],
        "must_not":     ["gst", "number is"],
        "category":     "hallucination",
        "note":         "GST not in knowledge file"
    },
    {
        "question":     "Do you have a mobile app?",
        "must_contain": ["not", "information"],
        "must_not":     ["yes", "download", "play store"],
        "category":     "hallucination",
        "note":         "Mobile app not mentioned"
    },
    {
        "question":     "What is your annual revenue?",
        "must_contain": ["not", "information"],
        "must_not":     ["crore", "lakh", "million"],
        "category":     "hallucination",
        "note":         "Revenue not in knowledge file"
    },
    {
        "question":     "Do you sell chocolate?",
        "must_contain": ["not", "information", "available"],
        "must_not":     ["yes", "rs.", "price"],
        "category":     "hallucination",
        "note":         "Chocolate not in catalog"
    },
    {
        "question":     "Is there a loyalty program?",
        "must_contain": ["not", "information"],
        "must_not":     ["points", "reward", "yes"],
        "category":     "hallucination",
        "note":         "Loyalty program not mentioned"
    },
    {
        "question":     "What time does the office open?",
        "must_contain": ["not", "information", "24/7"],
        "must_not":     ["9am", "10am", "morning"],
        "category":     "hallucination",
        "note":         "Office hours not in file"
    },
    {
        "question":     "Do you sell protein powder?",
        "must_contain": ["not", "information", "available"],
        "must_not":     ["yes", "rs.", "whey"],
        "category":     "hallucination",
        "note":         "Protein powder not in catalog"
    },
    {
        "question":     "What is the CEO name?",
        "must_contain": ["not", "information"],
        "must_not":     ["ceo is", "founder"],
        "category":     "hallucination",
        "note":         "CEO name not in knowledge file"
    },
    {
        "question":     "Do you deliver outside India?",
        "must_contain": ["no", "only", "india"],
        "must_not":     ["yes", "international"],
        "category":     "hallucination",
        "note":         "International delivery not available"
    },

    # ── COMPARISON QUESTIONS ──────────────────────────────────────────────────
    {
        "question":     "Which is cheaper badam or cashew?",
        "must_contain": ["250", "275", "badam", "cheaper"],
        "must_not":     [],
        "category":     "comparison",
        "note":         "Price comparison"
    },
    {
        "question":     "Which has more discount honey or kismish?",
        "must_contain": ["25%", "kismish", "raisin"],
        "must_not":     [],
        "category":     "comparison",
        "note":         "Discount comparison"
    },
    {
        "question":     "What is difference between dates and black dates?",
        "must_contain": ["premium", "polyphenol", "black"],
        "must_not":     [],
        "category":     "comparison",
        "note":         "Product difference"
    },
    {
        "question":     "Which is better for protein pista or walnuts?",
        "must_contain": ["pista", "pistachio", "6g", "protein"],
        "must_not":     [],
        "category":     "comparison",
        "note":         "Protein comparison"
    },
    {
        "question":     "Almonds vs cashews which is healthier?",
        "must_contain": ["almond", "cashew", "heart", "vitamin"],
        "must_not":     [],
        "category":     "comparison",
        "note":         "Health comparison"
    },

    # ── PRODUCT LIST QUESTIONS ────────────────────────────────────────────────
    {
        "question":     "What products do you sell?",
        "must_contain": ["badam", "cashew", "walnut", "pista"],
        "must_not":     [],
        "category":     "product_list",
        "note":         "Full product list"
    },
    {
        "question":     "List all nuts available",
        "must_contain": ["almond", "cashew", "walnut", "pistachio"],
        "must_not":     [],
        "category":     "product_list",
        "note":         "Nut product list"
    },
    {
        "question":     "What products are under Rs.100?",
        "must_contain": ["kismish", "75", "dates", "95"],
        "must_not":     [],
        "category":     "product_list",
        "note":         "Budget product filter"
    },
    {
        "question":     "What products are available under Rs.150?",
        "must_contain": ["kismish", "dates", "honey"],
        "must_not":     [],
        "category":     "product_list",
        "note":         "Products under 150"
    },
    {
        "question":     "Do you have combo packs?",
        "must_contain": ["combo", "family", "5000"],
        "must_not":     [],
        "category":     "product_list",
        "note":         "Combo pack availability"
    },

    # ── RECOMMENDATION QUESTIONS ──────────────────────────────────────────────
    {
        "question":     "What should I eat for brain health?",
        "must_contain": ["walnut", "omega", "brain"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Brain health recommendation"
    },
    {
        "question":     "I am diabetic what nuts should I eat?",
        "must_contain": ["pistachio", "almond", "blood sugar"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Diabetic recommendation"
    },
    {
        "question":     "What is a good gift idea?",
        "must_contain": ["combo", "gift", "family pack"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Gift recommendation"
    },
    {
        "question":     "What should I buy for gym and muscle building?",
        "must_contain": ["pista", "pistachio", "protein", "almond"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Gym recommendation"
    },
    {
        "question":     "I want something sweet and healthy",
        "must_contain": ["dates", "honey", "raisin", "fig"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Sweet product recommendation"
    },
    {
        "question":     "Best product for kids?",
        "must_contain": ["raisin", "dates", "fig", "almond"],
        "must_not":     [],
        "category":     "recommendation",
        "note":         "Kids recommendation"
    },

    # ── TRICKY EDGE CASES ─────────────────────────────────────────────────────
    {
        "question":     "You said cashew is Rs.300 right?",
        "must_contain": ["275", "300"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Correct wrong assumption - MRP vs sale"
    },
    {
        "question":     "Is honey a nut?",
        "must_contain": ["honey", "nalan"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Honey classification"
    },
    {
        "question":     "How old is RGreenMart?",
        "must_contain": ["1995", "30", "years"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Age calculation from 1995"
    },
    {
        "question":     "rgreenmart sell nuts?",
        "must_contain": ["yes", "nuts", "almond", "cashew"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Broken grammar question"
    },
    {
        "question":     "WHAT IS THE PRICE OF CASHEW",
        "must_contain": ["275", "300"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "All caps question"
    },
    {
        "question":     "price???",
        "must_contain": [],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Vague question - any response acceptable"
    },
    {
        "question":     "tell me everything about rgreenmart",
        "must_contain": ["madurai", "1995", "nuts", "nalan"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Broad overview question"
    },
    {
        "question":     "which is the most expensive product?",
        "must_contain": ["apricot", "290", "combo", "5000"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Most expensive product"
    },
    {
        "question":     "which is cheapest?",
        "must_contain": ["kismish", "75", "raisin"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Cheapest product"
    },
    {
        "question":     "do u have walnuts lol",
        "must_contain": ["walnut", "275"],
        "must_not":     [],
        "category":     "edge_case",
        "note":         "Casual slang question"
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# TEST RUNNER
# ══════════════════════════════════════════════════════════════════════════════

class Colors:
    GREEN  = "\033[92m"
    RED    = "\033[91m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    BOLD   = "\033[1m"
    RESET  = "\033[0m"
    WHITE  = "\033[97m"


def check_server() -> bool:
    """Check if the RAG server is running."""
    try:
        resp = requests.get(
            "http://localhost:5000/health",
            timeout=5
        )
        return resp.status_code == 200
    except Exception:
        return False


def ask_question(question: str) -> Optional[str]:
    """Send question to RAG API and return answer."""
    try:
        resp = requests.post(
            API_URL,
            json={"message": question, "session_id": "test_session"},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("response") or data.get("answer") or ""
    except requests.exceptions.Timeout:
        return "TIMEOUT"
    except Exception as e:
        return f"ERROR: {e}"


def evaluate_answer(answer: str, test: dict) -> tuple:
    """
    Evaluate answer against must_contain and must_not rules.
    Returns (passed: bool, details: str)
    """
    answer_lower = answer.lower()
    fails = []

    # Check must_contain — at least ONE must match
    if test["must_contain"]:
        found_any = any(
            kw.lower() in answer_lower
            for kw in test["must_contain"]
        )
        if not found_any:
            fails.append(
                f"Missing keywords: {test['must_contain']}"
            )

    # Check must_not — NONE should match
    for kw in test["must_not"]:
        if kw.lower() in answer_lower:
            fails.append(f"Contains forbidden: '{kw}'")

    # Check for error/timeout
    if answer.startswith("TIMEOUT"):
        fails.append("Request timed out")
    if answer.startswith("ERROR:"):
        fails.append(answer)

    passed = len(fails) == 0
    details = " | ".join(fails) if fails else "OK"
    return passed, details


def run_tests(
    category_filter: Optional[str] = None,
    verbose: bool = False,
    save_report: bool = False,
) -> dict:
    """Run all test cases and return results."""

    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("=" * 65)
    print("   RGREENMART RAG SYSTEM — AUTOMATED TEST SUITE")
    print("=" * 65)
    print(f"{Colors.RESET}")

    # Filter by category
    tests = TEST_CASES
    if category_filter:
        tests = [t for t in TEST_CASES
                 if t["category"] == category_filter]
        if not tests:
            print(f"{Colors.RED}No tests found for "
                  f"category: {category_filter}{Colors.RESET}")
            categories = list(set(t["category"] for t in TEST_CASES))
            print(f"Available: {', '.join(sorted(categories))}")
            return {}

    total      = len(tests)
    passed     = 0
    failed     = 0
    errors     = 0
    results    = []
    categories = {}

    print(f"{Colors.WHITE}Server : http://localhost:5000")
    print(f"Tests  : {total}")
    if category_filter:
        print(f"Filter : {category_filter}")
    print(f"{'─' * 65}{Colors.RESET}\n")

    for i, test in enumerate(tests, 1):
        question = test["question"]
        category = test["category"]
        note     = test["note"]

        # Progress indicator
        print(
            f"{Colors.CYAN}[{i:03d}/{total}]{Colors.RESET} "
            f"{Colors.BOLD}{question[:55]:<55}{Colors.RESET} ",
            end="", flush=True
        )

        # Time the request
        start  = time.time()
        answer = ask_question(question)
        elapsed = time.time() - start

        # Evaluate
        ok, details = evaluate_answer(answer, test)

        # Track results
        status = "PASS" if ok else "FAIL"
        if answer.startswith("ERROR") or answer.startswith("TIMEOUT"):
            status = "ERROR"
            errors += 1
        elif ok:
            passed += 1
        else:
            failed += 1

        # Category tracking
        if category not in categories:
            categories[category] = {"pass": 0, "fail": 0, "total": 0}
        categories[category]["total"] += 1
        if ok:
            categories[category]["pass"] += 1
        else:
            categories[category]["fail"] += 1

        # Print result
        if status == "PASS":
            color = Colors.GREEN
            icon  = "✅"
        elif status == "ERROR":
            color = Colors.YELLOW
            icon  = "⚠️ "
        else:
            color = Colors.RED
            icon  = "❌"

        print(
            f"{color}{icon} {status}{Colors.RESET} "
            f"{Colors.WHITE}({elapsed:.1f}s){Colors.RESET}"
        )

        # Verbose output
        if verbose or status != "PASS":
            print(f"    {Colors.CYAN}Note    :{Colors.RESET} {note}")
            print(f"    {Colors.CYAN}Category:{Colors.RESET} {category}")
            if answer:
                preview = answer[:120].replace("\n", " ")
                print(f"    {Colors.CYAN}Answer  :{Colors.RESET} {preview}...")
            if status != "PASS":
                print(f"    {Colors.RED}Reason  : {details}{Colors.RESET}")
            print()

        results.append({
            "id":       i,
            "question": question,
            "answer":   answer,
            "category": category,
            "note":     note,
            "status":   status,
            "elapsed":  round(elapsed, 2),
            "details":  details,
        })

    # ── Summary ───────────────────────────────────────────────────────────────
    score_pct = (passed / total * 100) if total > 0 else 0
    overall   = "PASS ✅" if score_pct >= PASS_SCORE else "FAIL ❌"

    print(f"\n{Colors.BOLD}{'═' * 65}{Colors.RESET}")
    print(f"{Colors.BOLD}  RESULTS SUMMARY{Colors.RESET}")
    print(f"{'─' * 65}")
    print(f"  Total Tests  : {total}")
    print(
        f"  Passed       : "
        f"{Colors.GREEN}{passed}{Colors.RESET}"
    )
    print(
        f"  Failed       : "
        f"{Colors.RED}{failed}{Colors.RESET}"
    )
    if errors:
        print(
            f"  Errors       : "
            f"{Colors.YELLOW}{errors}{Colors.RESET}"
        )
    print(
        f"  Score        : "
        f"{Colors.BOLD}{score_pct:.1f}%{Colors.RESET}"
    )
    print(
        f"  Result       : "
        f"{Colors.BOLD}{overall}{Colors.RESET}"
    )

    # ── Category breakdown ────────────────────────────────────────────────────
    print(f"\n{'─' * 65}")
    print(f"  {Colors.BOLD}CATEGORY BREAKDOWN{Colors.RESET}")
    print(f"{'─' * 65}")
    print(
        f"  {'Category':<20} {'Pass':>5} {'Fail':>5} "
        f"{'Total':>6} {'Score':>7}"
    )
    print(f"  {'─'*20} {'─'*5} {'─'*5} {'─'*6} {'─'*7}")
    for cat, stats in sorted(categories.items()):
        cat_score = (
            stats["pass"] / stats["total"] * 100
            if stats["total"] > 0 else 0
        )
        color = Colors.GREEN if cat_score >= 70 else Colors.RED
        print(
            f"  {cat:<20} "
            f"{Colors.GREEN}{stats['pass']:>5}{Colors.RESET} "
            f"{Colors.RED}{stats['fail']:>5}{Colors.RESET} "
            f"{stats['total']:>6} "
            f"{color}{cat_score:>6.0f}%{Colors.RESET}"
        )

    # ── Failed tests list ─────────────────────────────────────────────────────
    failed_tests = [r for r in results if r["status"] != "PASS"]
    if failed_tests:
        print(f"\n{'─' * 65}")
        print(f"  {Colors.BOLD}{Colors.RED}FAILED TESTS{Colors.RESET}")
        print(f"{'─' * 65}")
        for r in failed_tests:
            print(
                f"  [{r['id']:03d}] {r['question'][:50]}"
            )
            print(
                f"        {Colors.RED}{r['details']}{Colors.RESET}"
            )
            print(
                f"        Answer: "
                f"{r['answer'][:80].replace(chr(10),' ')}..."
            )

    print(f"{'═' * 65}\n")

    # ── Save report ───────────────────────────────────────────────────────────
    if save_report:
        timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = f"tests/report_{timestamp}.json"
        report = {
            "timestamp":  datetime.now().isoformat(),
            "total":      total,
            "passed":     passed,
            "failed":     failed,
            "errors":     errors,
            "score_pct":  round(score_pct, 2),
            "overall":    overall,
            "categories": categories,
            "results":    results,
        }
        os.makedirs("tests", exist_ok=True)
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(
            f"{Colors.GREEN}Report saved: {report_path}"
            f"{Colors.RESET}\n"
        )

    return {
        "total":     total,
        "passed":    passed,
        "failed":    failed,
        "score_pct": score_pct,
        "results":   results,
    }


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="RGreenMart RAG System Test Suite"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show detailed output for every test"
    )
    parser.add_argument(
        "--category", "-c",
        type=str,
        default=None,
        help=(
            "Run only a specific category: "
            "price | hindi_names | discount | health | "
            "store_info | delivery | return | "
            "hallucination | comparison | product_list | "
            "recommendation | edge_case"
        )
    )
    parser.add_argument(
        "--report", "-r",
        action="store_true",
        help="Save results to tests/report_TIMESTAMP.json"
    )
    args = parser.parse_args()

    # Check server is running
    print(f"\n{Colors.CYAN}Checking server...{Colors.RESET}", end=" ")
    if not check_server():
        print(f"{Colors.RED}OFFLINE{Colors.RESET}")
        print(
            f"\n{Colors.RED}ERROR: RAG server is not running.{Colors.RESET}"
        )
        print("Start it first:")
        print("  conda activate rag")
        print(
            "  cd Desktop\\claud_rag-chat-bot\\rag_system"
        )
        print("  python run.py\n")
        sys.exit(1)

    print(f"{Colors.GREEN}ONLINE ✅{Colors.RESET}")

    # Run tests
    run_tests(
        category_filter=args.category,
        verbose=args.verbose,
        save_report=args.report,
    )