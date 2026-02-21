"""
ShopSmart ML — Complete MVP
Product classifier + Shop finder + Recommender + Comparator + Orders
Run: python main.py
"""

import numpy as np, pandas as pd, re, logging, uuid, os, pickle
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)


# ╔══════════════════════════════════════════════════════════════╗
# ║  SECTION 1 — DUMMY SHOP DATABASE                           ║
# ╚══════════════════════════════════════════════════════════════╝

SHOPS = [
    # ── 1. Grocery + Dairy ──
    {
        "id": "shop1",
        "name": "Sharma General Store",
        "type": "Grocery & Dairy",
        "icon": "🏪",
        "cats": ["grocery", "dairy"],
        "addr": "12 MG Road, Connaught Place",
        "city": "Delhi",
        "phone": "9811001001",
        "lat": 28.6315,
        "lng": 77.2167,
        "rating": 4.5,
        "reviews": 142,
        "open": True,
        "fee": 20,
        "quality": "premium",
        "products": [
            {"n": "Basmati Rice 5kg",     "p": 460, "mrp": 520, "u": "kg",    "c": "grocery",  "brand": "India Gate", "quality": 5, "stock": True},
            {"n": "Toor Dal 1kg",         "p": 145, "mrp": 165, "u": "kg",    "c": "grocery",  "brand": "Tata",       "quality": 5, "stock": True},
            {"n": "Sunflower Oil 1L",     "p": 135, "mrp": 155, "u": "liter", "c": "grocery",  "brand": "Fortune",    "quality": 4, "stock": True},
            {"n": "Sugar 1kg",            "p": 46,  "mrp": 50,  "u": "kg",    "c": "grocery",  "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Wheat Atta 5kg",       "p": 225, "mrp": 260, "u": "kg",    "c": "grocery",  "brand": "Aashirvaad", "quality": 5, "stock": True},
            {"n": "Tea 250g",             "p": 155, "mrp": 175, "u": "gram",  "c": "grocery",  "brand": "Tata Tea",   "quality": 4, "stock": True},
            {"n": "Salt 1kg",             "p": 20,  "mrp": 22,  "u": "kg",    "c": "grocery",  "brand": "Tata",       "quality": 4, "stock": True},
            {"n": "Coffee 200g",          "p": 195, "mrp": 220, "u": "gram",  "c": "grocery",  "brand": "Nescafe",    "quality": 5, "stock": True},
            {"n": "Maggi Noodles 4pk",    "p": 55,  "mrp": 60,  "u": "pack",  "c": "grocery",  "brand": "Maggi",      "quality": 4, "stock": True},
            {"n": "Full Cream Milk 1L",   "p": 65,  "mrp": 68,  "u": "liter", "c": "dairy",    "brand": "Amul",       "quality": 5, "stock": True},
            {"n": "Curd 400g",            "p": 42,  "mrp": 48,  "u": "gram",  "c": "dairy",    "brand": "Mother Dairy","quality": 4, "stock": True},
            {"n": "Paneer 200g",          "p": 82,  "mrp": 95,  "u": "gram",  "c": "dairy",    "brand": "Amul",       "quality": 5, "stock": True},
            {"n": "Butter 100g",          "p": 52,  "mrp": 58,  "u": "gram",  "c": "dairy",    "brand": "Amul",       "quality": 5, "stock": True},
            {"n": "Ghee 500ml",           "p": 290, "mrp": 320, "u": "ml",    "c": "dairy",    "brand": "Amul",       "quality": 5, "stock": True},
        ]
    },
    # ── 2. Electricals ──
    {
        "id": "shop2",
        "name": "Gupta Electricals",
        "type": "Electrical Shop",
        "icon": "⚡",
        "cats": ["electrical"],
        "addr": "45 Karol Bagh Market",
        "city": "Delhi",
        "phone": "9811002002",
        "lat": 28.6519,
        "lng": 77.1905,
        "rating": 4.2,
        "reviews": 88,
        "open": True,
        "fee": 30,
        "quality": "standard",
        "products": [
            {"n": "Copper Wire 10m",      "p": 255, "mrp": 310, "u": "meter", "c": "electrical", "brand": "Havells",  "quality": 5, "stock": True},
            {"n": "LED Bulb 9W",          "p": 89,  "mrp": 125, "u": "piece", "c": "electrical", "brand": "Philips",  "quality": 5, "stock": True},
            {"n": "Switch Board 6way",    "p": 185, "mrp": 230, "u": "piece", "c": "electrical", "brand": "Anchor",   "quality": 4, "stock": True},
            {"n": "Extension Board 4+1",  "p": 360, "mrp": 420, "u": "piece", "c": "electrical", "brand": "Belkin",   "quality": 5, "stock": True},
            {"n": "Ceiling Fan",          "p": 1250,"mrp": 1550,"u": "piece", "c": "electrical", "brand": "Crompton", "quality": 4, "stock": True},
            {"n": "MCB 32A",              "p": 185, "mrp": 210, "u": "piece", "c": "electrical", "brand": "Havells",  "quality": 5, "stock": True},
            {"n": "Electrical Tape",      "p": 28,  "mrp": 35,  "u": "piece", "c": "electrical", "brand": "3M",       "quality": 4, "stock": True},
            {"n": "Tube Light 20W",       "p": 155, "mrp": 190, "u": "piece", "c": "electrical", "brand": "Philips",  "quality": 5, "stock": True},
            {"n": "Table Fan",            "p": 920, "mrp": 1150,"u": "piece", "c": "electrical", "brand": "Bajaj",    "quality": 4, "stock": True},
            {"n": "Voltage Stabilizer",   "p": 1850,"mrp": 2300,"u": "piece", "c": "electrical", "brand": "V-Guard",  "quality": 5, "stock": True},
        ]
    },
    # ── 3. Medical ──
    {
        "id": "shop3",
        "name": "LifeCare Pharmacy",
        "type": "Medical Store",
        "icon": "💊",
        "cats": ["medical"],
        "addr": "78 Lajpat Nagar",
        "city": "Delhi",
        "phone": "9811003003",
        "lat": 28.5700,
        "lng": 77.2400,
        "rating": 4.8,
        "reviews": 215,
        "open": True,
        "fee": 0,
        "quality": "premium",
        "products": [
            {"n": "Paracetamol 500mg",    "p": 14,  "mrp": 18,  "u": "strip",  "c": "medical", "brand": "Crocin",    "quality": 5, "stock": True},
            {"n": "Dolo 650mg",           "p": 26,  "mrp": 32,  "u": "strip",  "c": "medical", "brand": "Dolo",      "quality": 5, "stock": True},
            {"n": "Cough Syrup 100ml",    "p": 82,  "mrp": 100, "u": "bottle", "c": "medical", "brand": "Benadryl",  "quality": 5, "stock": True},
            {"n": "Bandage Roll",         "p": 28,  "mrp": 35,  "u": "piece",  "c": "medical", "brand": "Johnson",   "quality": 4, "stock": True},
            {"n": "Sanitizer 200ml",      "p": 68,  "mrp": 99,  "u": "bottle", "c": "medical", "brand": "Dettol",    "quality": 5, "stock": True},
            {"n": "Digital Thermometer",  "p": 145, "mrp": 200, "u": "piece",  "c": "medical", "brand": "Dr Morepen","quality": 4, "stock": True},
            {"n": "ORS Packets 10pc",     "p": 38,  "mrp": 45,  "u": "pack",   "c": "medical", "brand": "Electral",  "quality": 5, "stock": True},
            {"n": "Vitamin C Tablets",    "p": 115, "mrp": 150, "u": "bottle", "c": "medical", "brand": "Celin",     "quality": 5, "stock": True},
            {"n": "Cotton Roll 50g",      "p": 22,  "mrp": 30,  "u": "piece",  "c": "medical", "brand": "Softouch",  "quality": 3, "stock": True},
            {"n": "N95 Mask 5pc",         "p": 115, "mrp": 150, "u": "pack",   "c": "medical", "brand": "3M",        "quality": 5, "stock": True},
        ]
    },
    # ── 4. Hardware ──
    {
        "id": "shop4",
        "name": "Patel Hardware",
        "type": "Hardware & Tools",
        "icon": "🔨",
        "cats": ["hardware"],
        "addr": "23 Chandni Chowk",
        "city": "Delhi",
        "phone": "9811004004",
        "lat": 28.6506,
        "lng": 77.2300,
        "rating": 4.0,
        "reviews": 62,
        "open": True,
        "fee": 50,
        "quality": "standard",
        "products": [
            {"n": "Steel Hammer",         "p": 210, "mrp": 260, "u": "piece", "c": "hardware", "brand": "Stanley",    "quality": 5, "stock": True},
            {"n": "Screwdriver Set 6pc",  "p": 310, "mrp": 360, "u": "set",   "c": "hardware", "brand": "Taparia",    "quality": 4, "stock": True},
            {"n": "Nails 1kg",            "p": 85,  "mrp": 105, "u": "kg",    "c": "hardware", "brand": "Local",      "quality": 3, "stock": True},
            {"n": "White Paint 1L",       "p": 360, "mrp": 420, "u": "liter", "c": "hardware", "brand": "Asian Paint","quality": 5, "stock": True},
            {"n": "Door Lock",            "p": 465, "mrp": 520, "u": "piece", "c": "hardware", "brand": "Godrej",     "quality": 5, "stock": True},
            {"n": "Drill Bit Set",        "p": 260, "mrp": 310, "u": "set",   "c": "hardware", "brand": "Bosch",      "quality": 5, "stock": True},
            {"n": "Measuring Tape 5m",    "p": 105, "mrp": 130, "u": "piece", "c": "hardware", "brand": "Freemans",   "quality": 4, "stock": True},
            {"n": "PVC Pipe 1inch 1m",    "p": 65,  "mrp": 80,  "u": "meter", "c": "hardware", "brand": "Supreme",    "quality": 4, "stock": True},
            {"n": "Plier Heavy Duty",     "p": 185, "mrp": 230, "u": "piece", "c": "hardware", "brand": "Taparia",    "quality": 4, "stock": True},
        ]
    },
    # ── 5. Bakery ──
    {
        "id": "shop5",
        "name": "Daily Fresh Bakery",
        "type": "Bakery",
        "icon": "🍞",
        "cats": ["bakery"],
        "addr": "56 Sarojini Nagar",
        "city": "Delhi",
        "phone": "9811005005",
        "lat": 28.5750,
        "lng": 77.2000,
        "rating": 4.6,
        "reviews": 155,
        "open": True,
        "fee": 15,
        "quality": "premium",
        "products": [
            {"n": "White Bread",          "p": 35,  "mrp": 42,  "u": "pack",  "c": "bakery", "brand": "Fresh",       "quality": 4, "stock": True},
            {"n": "Brown Bread",          "p": 48,  "mrp": 55,  "u": "pack",  "c": "bakery", "brand": "Fresh",       "quality": 5, "stock": True},
            {"n": "Multigrain Bread",     "p": 58,  "mrp": 65,  "u": "pack",  "c": "bakery", "brand": "Fresh",       "quality": 5, "stock": True},
            {"n": "Chocolate Cake 500g",  "p": 310, "mrp": 360, "u": "piece", "c": "bakery", "brand": "Fresh",       "quality": 5, "stock": True},
            {"n": "Butter Croissant",     "p": 48,  "mrp": 55,  "u": "piece", "c": "bakery", "brand": "Fresh",       "quality": 5, "stock": True},
            {"n": "Cookies 200g",         "p": 62,  "mrp": 75,  "u": "pack",  "c": "bakery", "brand": "Fresh",       "quality": 4, "stock": True},
            {"n": "Muffin Blueberry",     "p": 42,  "mrp": 55,  "u": "piece", "c": "bakery", "brand": "Fresh",       "quality": 5, "stock": True},
            {"n": "Pav Bun 8pc",          "p": 32,  "mrp": 38,  "u": "pack",  "c": "bakery", "brand": "Fresh",       "quality": 4, "stock": True},
        ]
    },
    # ── 6. Electronics ──
    {
        "id": "shop6",
        "name": "TechWorld Electronics",
        "type": "Electronics",
        "icon": "📱",
        "cats": ["electronics"],
        "addr": "Nehru Place IT Market",
        "city": "Delhi",
        "phone": "9811006006",
        "lat": 28.5480,
        "lng": 77.2520,
        "rating": 4.1,
        "reviews": 178,
        "open": True,
        "fee": 0,
        "quality": "premium",
        "products": [
            {"n": "USB-C Charger",        "p": 260, "mrp": 360, "u": "piece", "c": "electronics", "brand": "Samsung", "quality": 5, "stock": True},
            {"n": "Wired Earphones",      "p": 155, "mrp": 210, "u": "piece", "c": "electronics", "brand": "JBL",     "quality": 4, "stock": True},
            {"n": "Bluetooth Speaker",    "p": 820, "mrp": 1250,"u": "piece", "c": "electronics", "brand": "JBL",     "quality": 5, "stock": True},
            {"n": "Power Bank 10000mAh",  "p": 620, "mrp": 850, "u": "piece", "c": "electronics", "brand": "Mi",      "quality": 4, "stock": True},
            {"n": "USB Cable 1m",         "p": 85,  "mrp": 130, "u": "piece", "c": "electronics", "brand": "Anker",   "quality": 5, "stock": True},
            {"n": "Screen Guard",         "p": 110, "mrp": 160, "u": "piece", "c": "electronics", "brand": "Spigen",  "quality": 4, "stock": True},
            {"n": "Phone Cover",          "p": 210, "mrp": 320, "u": "piece", "c": "electronics", "brand": "Spigen",  "quality": 5, "stock": True},
            {"n": "Memory Card 32GB",     "p": 360, "mrp": 480, "u": "piece", "c": "electronics", "brand": "SanDisk", "quality": 5, "stock": True},
            {"n": "Wireless Mouse",       "p": 420, "mrp": 580, "u": "piece", "c": "electronics", "brand": "Logitech","quality": 5, "stock": True},
        ]
    },
    # ── 7. Multi-category SuperMart ──
    {
        "id": "shop7",
        "name": "MegaMart Superstore",
        "type": "Supermarket",
        "icon": "🛒",
        "cats": ["grocery", "dairy", "bakery"],
        "addr": "Rajouri Garden Main Road",
        "city": "Delhi",
        "phone": "9811007007",
        "lat": 28.6419,
        "lng": 77.1219,
        "rating": 3.8,
        "reviews": 230,
        "open": True,
        "fee": 25,
        "quality": "budget",
        "products": [
            {"n": "Rice 5kg",             "p": 410, "mrp": 500, "u": "kg",    "c": "grocery",  "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Toned Milk 1L",        "p": 50,  "mrp": 55,  "u": "liter", "c": "dairy",    "brand": "Mother Dairy","quality": 4, "stock": True},
            {"n": "Brown Bread",          "p": 38,  "mrp": 48,  "u": "pack",  "c": "bakery",   "brand": "Harvest",    "quality": 3, "stock": True},
            {"n": "Cooking Oil 1L",       "p": 118, "mrp": 150, "u": "liter", "c": "grocery",  "brand": "Fortune",    "quality": 4, "stock": True},
            {"n": "Maggi Noodles 4pk",    "p": 48,  "mrp": 56,  "u": "pack",  "c": "grocery",  "brand": "Maggi",      "quality": 4, "stock": True},
            {"n": "Butter 200g",          "p": 90,  "mrp": 108, "u": "gram",  "c": "dairy",    "brand": "Amul",       "quality": 4, "stock": True},
            {"n": "Curd 400g",            "p": 36,  "mrp": 44,  "u": "gram",  "c": "dairy",    "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Paneer 200g",          "p": 78,  "mrp": 92,  "u": "gram",  "c": "dairy",    "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Sugar 1kg",            "p": 40,  "mrp": 50,  "u": "kg",    "c": "grocery",  "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Dal 1kg",              "p": 128, "mrp": 158, "u": "kg",    "c": "grocery",  "brand": "Local",      "quality": 3, "stock": True},
            {"n": "White Bread",          "p": 30,  "mrp": 40,  "u": "pack",  "c": "bakery",   "brand": "Local",      "quality": 3, "stock": True},
            {"n": "Tea 250g",             "p": 130, "mrp": 170, "u": "gram",  "c": "grocery",  "brand": "Local",      "quality": 3, "stock": True},
        ]
    },
    # ── 8. Second Pharmacy ──
    {
        "id": "shop8",
        "name": "MedPlus 24x7",
        "type": "Pharmacy",
        "icon": "🏥",
        "cats": ["medical"],
        "addr": "Green Park Main Market",
        "city": "Delhi",
        "phone": "9811008008",
        "lat": 28.5590,
        "lng": 77.2080,
        "rating": 4.6,
        "reviews": 340,
        "open": True,
        "fee": 0,
        "quality": "premium",
        "products": [
            {"n": "Paracetamol 500mg",    "p": 16,  "mrp": 18,  "u": "strip",  "c": "medical", "brand": "Calpol",     "quality": 4, "stock": True},
            {"n": "Dolo 650mg",           "p": 30,  "mrp": 32,  "u": "strip",  "c": "medical", "brand": "Dolo",       "quality": 5, "stock": True},
            {"n": "Cough Syrup 100ml",    "p": 92,  "mrp": 100, "u": "bottle", "c": "medical", "brand": "Benadryl",   "quality": 5, "stock": True},
            {"n": "Vitamin C Tablets",    "p": 125, "mrp": 150, "u": "bottle", "c": "medical", "brand": "Limcee",     "quality": 4, "stock": True},
            {"n": "BP Monitor",           "p": 1180,"mrp": 1500,"u": "piece",  "c": "medical", "brand": "Omron",      "quality": 5, "stock": True},
            {"n": "Pain Relief Spray",    "p": 90,  "mrp": 120, "u": "bottle", "c": "medical", "brand": "Volini",     "quality": 5, "stock": True},
            {"n": "Eye Drops 10ml",       "p": 52,  "mrp": 65,  "u": "bottle", "c": "medical", "brand": "I-Tone",     "quality": 4, "stock": True},
            {"n": "Sanitizer 200ml",      "p": 72,  "mrp": 99,  "u": "bottle", "c": "medical", "brand": "Lifebuoy",   "quality": 4, "stock": True},
            {"n": "Digital Thermometer",  "p": 160, "mrp": 200, "u": "piece",  "c": "medical", "brand": "Omron",      "quality": 5, "stock": True},
        ]
    },
]

ORDERS = []


# ╔══════════════════════════════════════════════════════════════╗
# ║  SECTION 2 — ML PRODUCT CLASSIFIER                         ║
# ╚══════════════════════════════════════════════════════════════╝

class ProductClassifier:
    def __init__(self):
        self.pipe = None
        self.le = LabelEncoder()
        self.cats = []
        self.ok = False

    def _data(self):
        P = [
            "rice","basmati rice","brown rice","wheat flour","atta","maida","sugar",
            "salt","cooking oil","sunflower oil","mustard oil","olive oil","ghee",
            "dal","toor dal","moong dal","chana dal","urad dal","rajma","chole",
            "pasta","noodles","maggi","oats","cornflakes","tea","tea leaves","coffee",
            "green tea","biscuit","biscuits","chips","namkeen","snacks","pickle",
            "sauce","ketchup","vinegar","jam","honey","turmeric","haldi","chili powder",
            "coriander","cumin","jeera","garam masala","pepper","poha","besan",
            "milk","full cream milk","toned milk","skimmed milk","curd","yogurt",
            "dahi","buttermilk","chaach","lassi","cheese","paneer","cottage cheese",
            "butter","cream","ice cream","milkshake","condensed milk","milk powder",
            "mozzarella","cream cheese","khoya","malai","flavored milk",
            "wire","electric wire","copper wire","cable","switch","socket","plug",
            "extension board","bulb","LED bulb","tube light","CFL","fan","ceiling fan",
            "table fan","exhaust fan","MCB","fuse","circuit breaker","inverter",
            "battery","torch","LED strip","voltage stabilizer","electrical tape","motor",
            "medicine","tablet","capsule","syrup","paracetamol","crocin","dolo",
            "aspirin","ibuprofen","bandage","cotton","antiseptic","dettol","thermometer",
            "BP monitor","oximeter","vitamin","calcium","cough syrup","antacid",
            "pain relief","ointment","eye drops","ear drops","ORS","hand sanitizer",
            "face mask","surgical mask","gloves","first aid","inhaler",
            "hammer","nails","screws","drill","screwdriver","plier","wrench","spanner",
            "paint","cement","sand","bricks","pipe","PVC pipe","tap","valve","lock",
            "padlock","door handle","hinges","sandpaper","putty","primer","rope",
            "chain","measuring tape","saw","blade","cutter",
            "bread","white bread","brown bread","multigrain bread","cake","pastry",
            "muffin","cupcake","donut","croissant","bun","pav","rusk","toast",
            "pizza base","burger bun","cookies","brownie","pie","tart",
            "phone","mobile","smartphone","charger","phone charger","earphone",
            "headphone","speaker","bluetooth speaker","laptop","keyboard","mouse",
            "USB cable","power bank","screen guard","phone case","memory card",
            "pen drive","HDMI cable","router",
            "shirt","t-shirt","tshirt","jeans","trousers","pants","kurta","saree",
            "dress","skirt","jacket","sweater","hoodie","blazer","socks","underwear",
            "shorts","trackpant","pajama","dupatta",
            "pen","pencil","eraser","sharpener","notebook","register","diary","ruler",
            "compass","geometry box","calculator","marker","highlighter","crayon",
            "glue","stapler","scissors","folder","tape","sketch pen",
            "potato","tomato","onion","garlic","ginger","carrot","cabbage",
            "cauliflower","spinach","brinjal","capsicum","cucumber","beans","peas",
            "corn","apple","banana","mango","orange","grapes","watermelon","papaya",
            "guava","lemon","coconut",
        ]
        C = (["grocery"]*50+["dairy"]*25+["electrical"]*26+["medical"]*31+
             ["hardware"]*26+["bakery"]*20+["electronics"]*20+["clothing"]*20+
             ["stationery"]*20+["vegetables"]*25)
        return pd.DataFrame({"p":P[:len(C)],"c":C})

    def _cl(self,t):
        return re.sub(r'\s+',' ',re.sub(r'[^a-z\s]','',str(t).lower())).strip()

    def train(self):
        df=self._data(); df['x']=df['p'].apply(self._cl)
        self.cats=sorted(df['c'].unique().tolist())
        y=self.le.fit_transform(df['c'])
        self.pipe=Pipeline([
            ('tf',TfidfVectorizer(analyzer='char_wb',ngram_range=(2,5),max_features=8000,sublinear_tf=True)),
            ('lr', LogisticRegression(
    max_iter=1000,
    C=10,
    class_weight='balanced',
    solver='lbfgs'
))
        ])
        sc=cross_val_score(self.pipe,df['x'],y,cv=5,scoring='accuracy')
        self.pipe.fit(df['x'],y)
        self.ok=True
        log.info(f"✅ ML Accuracy: {sc.mean():.2%} | Categories: {self.cats}")
        return sc.mean()

    def predict(self,text):
        if not self.ok: self.train()
        pr=self.pipe.predict_proba([self._cl(text)])[0]
        i=np.argmax(pr)
        return {
            "query":text,
            "category":self.cats[i],
            "confidence":round(float(pr[i]),4),
            "scores":{self.cats[j]:round(float(pr[j]),4) for j in np.argsort(pr)[::-1]}
        }

CLF = ProductClassifier()


# ╔══════════════════════════════════════════════════════════════╗
# ║  SECTION 3 — DISTANCE + SCORING + SEARCH + COMPARE         ║
# ╚══════════════════════════════════════════════════════════════╝

def haversine(a1,o1,a2,o2):
    R=6371
    a1,o1,a2,o2=map(np.radians,[a1,o1,a2,o2])
    d=a2-a1;e=o2-o1
    return R*2*np.arctan2(np.sqrt(np.sin(d/2)**2+np.cos(a1)*np.cos(a2)*np.sin(e/2)**2),
                          np.sqrt(1-(np.sin(d/2)**2+np.cos(a1)*np.cos(a2)*np.sin(e/2)**2)))

def search_shops(queries, ulat, ulng, max_km=25):
    classes = [CLF.predict(q) for q in queries]
    all_cats = list(set(c["category"] for c in classes))
    qwords = list(set(w for q in queries for w in q.lower().split() if len(w)>2))

    results = []
    for shop in SHOPS:
        dist = round(haversine(ulat,ulng,shop["lat"],shop["lng"]),2)
        if dist > max_km: continue

        matched = []
        for pr in shop["products"]:
            pn = pr["n"].lower()
            direct = any(q.lower() in pn or any(w in pn for w in q.lower().split() if len(w)>2) for q in queries)
            cat_m = pr["c"] in all_cats
            if direct:
                matched.append({**pr,"match":"direct","str":1.0})
            elif cat_m:
                matched.append({**pr,"match":"category","str":0.4})

        if not matched: continue
        matched.sort(key=lambda x:(-x["str"],x["p"]))
        dc = sum(1 for p in matched if p["match"]=="direct")
        prices = [p["p"] for p in matched]
        quals = [p["quality"] for p in matched]

        results.append({
            "id":shop["id"],"name":shop["name"],"type":shop["type"],"icon":shop["icon"],
            "addr":shop["addr"],"phone":shop["phone"],
            "lat":shop["lat"],"lng":shop["lng"],
            "rating":shop["rating"],"reviews":shop["reviews"],
            "open":shop["open"],"fee":shop["fee"],
            "cats":shop["cats"],"quality":shop["quality"],
            "dist":dist,
            "avg_price":round(sum(prices)/len(prices),2),
            "min_price":min(prices),
            "avg_quality":round(sum(quals)/len(quals),1),
            "match_score":min(1.0,dc/max(len(matched),1)+0.3),
            "products":matched,
            "total":len(matched),
            "direct":dc,
        })

    if not results: return results, classes

    # Score
    ap=[s["avg_price"] for s in results if s["avg_price"]>0]
    ac=[s["reviews"] for s in results]
    W={'d':0.25,'r':0.20,'p':0.25,'q':0.15,'rel':0.10,'pop':0.05}

    for s in results:
        ds=float(np.clip(np.exp(-0.15*s["dist"]),0,1))
        r,c=s["rating"],s["reviews"]
        rs=float(np.clip(((5*3.5+c*r)/(5+c)-1)/4,0,1)) if c>0 else 0.3
        mn,mx=(min(ap),max(ap)) if len(ap)>1 else (s["avg_price"],s["avg_price"]+1)
        ps=float(np.clip(1-(s["avg_price"]-mn)/(mx-mn+.01),0,1))
        qs=float(np.clip((s["avg_quality"]-1)/4,0,1))
        rl=float(np.clip(s["match_score"],0,1))
        mc=max(ac) if ac else 1
        pp=float(np.clip(np.log1p(c)/np.log1p(mc),0,1))

        bd={"distance":round(ds,3),"rating":round(rs,3),"price":round(ps,3),
            "quality":round(qs,3),"relevance":round(rl,3),"popularity":round(pp,3)}
        s["breakdown"]=bd
        s["score"]=round(W['d']*bd['distance']+W['r']*bd['rating']+W['p']*bd['price']+
                         W['q']*bd['quality']+W['rel']*bd['relevance']+W['pop']*bd['popularity'],4)

    results.sort(key=lambda x:x["score"],reverse=True)
    for i,s in enumerate(results,1):
        s["rank"]=i
        b=""
        if i==1: b="⭐ Best Overall"
        elif s["dist"]==min(x["dist"] for x in results): b="📍 Nearest"
        elif s["breakdown"]["price"]>=max(x["breakdown"]["price"] for x in results): b="💰 Best Price"
        elif s["breakdown"]["rating"]>=max(x["breakdown"]["rating"] for x in results): b="🌟 Top Rated"
        elif s["breakdown"]["quality"]>=max(x["breakdown"]["quality"] for x in results): b="💎 Best Quality"
        s["badge"]=b

    return results, classes


def compare_product(product, ulat, ulng, max_km=25):
    """Find same/similar product across all shops for comparison."""
    cls = CLF.predict(product)
    cat = cls["category"]
    plow = product.lower()
    pwords = [w for w in plow.split() if len(w)>2]

    entries = []
    for shop in SHOPS:
        dist = round(haversine(ulat,ulng,shop["lat"],shop["lng"]),2)
        if dist > max_km: continue

        for pr in shop["products"]:
            pn = pr["n"].lower()
            direct = plow in pn or any(w in pn for w in pwords)
            cat_m = pr["c"]==cat
            if not (direct or cat_m): continue

            entries.append({
                "shop_id":shop["id"],
                "shop_name":shop["name"],
                "shop_icon":shop["icon"],
                "shop_rating":shop["rating"],
                "shop_reviews":shop["reviews"],
                "shop_dist":dist,
                "shop_fee":shop["fee"],
                "product_name":pr["n"],
                "price":pr["p"],
                "mrp":pr["mrp"],
                "brand":pr["brand"],
                "quality":pr["quality"],
                "unit":pr["u"],
                "match":"direct" if direct else "category",
                "saving":pr["mrp"]-pr["p"],
                "discount":round((pr["mrp"]-pr["p"])/pr["mrp"]*100,1) if pr["mrp"]>0 else 0,
                "value_score":round(pr["quality"]/max(pr["p"],1)*100,1),
            })

    entries.sort(key=lambda x:(-int(x["match"]=="direct"), x["price"]))

    # Mark best values
    if entries:
        direct_entries = [e for e in entries if e["match"]=="direct"]
        pool = direct_entries if direct_entries else entries
        best_price = min(pool, key=lambda x:x["price"])["price"]
        best_quality = max(pool, key=lambda x:x["quality"])["quality"]
        best_dist = min(pool, key=lambda x:x["shop_dist"])["shop_dist"]
        best_value = max(pool, key=lambda x:x["value_score"])["value_score"]
        for e in entries:
            e["is_cheapest"] = e["price"]==best_price
            e["is_best_quality"] = e["quality"]==best_quality
            e["is_nearest"] = e["shop_dist"]==best_dist
            e["is_best_value"] = e["value_score"]==best_value

    return {"product":product,"classification":cls,"comparisons":entries,"total":len(entries)}


# ╔══════════════════════════════════════════════════════════════╗
# ║  SECTION 4 — API                                            ║
# ╚══════════════════════════════════════════════════════════════╝

@asynccontextmanager
async def lifespan(app):
    CLF.train()
    total_products = sum(len(s["products"]) for s in SHOPS)
    log.info(f"🚀 Ready — {len(SHOPS)} shops, {total_products} products, {len(CLF.cats)} categories")
    yield

app = FastAPI(title="ShopSmart ML", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class SearchReq(BaseModel):
    products: List[str] = Field(..., min_length=1)
    lat: float = 28.6139
    lng: float = 77.2090
    max_km: float = 25

class CompareReq(BaseModel):
    product: str
    lat: float = 28.6139
    lng: float = 77.2090

class CartItem(BaseModel):
    name: str
    price: float
    qty: int = 1
    shop_id: str
    shop_name: str

class OrderReq(BaseModel):
    items: List[CartItem]
    name: str = "Guest"
    phone: str = ""
    address: str = ""
    lat: float = 0
    lng: float = 0

@app.get("/health")
async def health():
    return {"ok":True,"cats":CLF.cats,"shops":len(SHOPS),
            "products":sum(len(s["products"]) for s in SHOPS),"orders":len(ORDERS)}

@app.post("/search")
async def api_search(r: SearchReq):
    res, cls = search_shops(r.products, r.lat, r.lng, r.max_km)
    return {"products":r.products,"classifications":cls,"results":res,
            "total":len(res),"loc":{"lat":r.lat,"lng":r.lng}}

@app.post("/compare")
async def api_compare(r: CompareReq):
    return compare_product(r.product, r.lat, r.lng)

@app.post("/order")
async def api_order(r: OrderReq):
    if not r.items: raise HTTPException(400,"Empty cart")
    total = sum(i.price*i.qty for i in r.items)
    order = {"id":str(uuid.uuid4())[:8].upper(),"items":[i.dict() for i in r.items],
             "total":round(total,2),"name":r.name,"phone":r.phone,"address":r.address,
             "status":"confirmed","time":datetime.now().strftime("%d %b %Y, %I:%M %p")}
    ORDERS.append(order)
    log.info(f"📦 Order #{order['id']} — ₹{total:.0f}")
    return {"message":"Order placed!","order":order}

@app.get("/orders")
async def api_orders():
    return {"orders":list(reversed(ORDERS))}

@app.get("/shops")
async def api_shops():
    return {"shops":[{k:v for k,v in s.items() if k!="products"} for s in SHOPS]}

if __name__=="__main__":
    uvicorn.run("main:app",host="0.0.0.0",port=8000,reload=True)