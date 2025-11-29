import os
from dotenv import load_dotenv

# Explicitly specify path to .env to be sure
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
loaded = load_dotenv(dotenv_path)

print(f"Dotenv loaded: {loaded}")
print(f"Dotenv path: {dotenv_path}")
print(f"GEMINI_API_KEY: {os.environ.get('GEMINI_API_KEY')}")
firebase_key = os.environ.get('VITE_FIREBASE_API_KEY')
print(f"VITE_FIREBASE_API_KEY exists: {bool(firebase_key)}")
if firebase_key:
    print(f"VITE_FIREBASE_API_KEY prefix: {firebase_key[:5]}...")
