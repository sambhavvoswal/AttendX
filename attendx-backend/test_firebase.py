import json
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
if not json_str:
    print("ERROR: FIREBASE_SERVICE_ACCOUNT_JSON not found in env")
    exit(1)

# Pydantic-like cleaning (strip single quotes if present)
if json_str.startswith("'") and json_str.endswith("'"):
    json_str = json_str[1:-1]

try:
    cred_dict = json.loads(json_str)
    print("JSON successfully parsed.")
    
    # Check if we need to manually unescape \n in the private key
    # (Sometimes JSON loaders don't do this if the string was read in a certain way)
    pk = cred_dict.get("private_key", "")
    if "\\n" in pk:
        print("Detected escaped \\n in private key. Fixing...")
        cred_dict["private_key"] = pk.replace("\\n", "\n")

    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    print("Firebase initialized successfully.")
    
    db = firestore.client()
    print("Firestore client created.")
    
    # Try a simple read
    print("Attempting to read 'users' collection...")
    # Using a timeout to prevent absolute hang
    docs = db.collection("users").limit(1).get(timeout=10)
    print(f"Success! Found {len(docs)} documents.")

except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
