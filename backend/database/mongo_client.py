import pymongo
import mongomock
from backend.config import MONGO_URI, DB_NAME, USE_MOCK_MONGO

_client = None
_db = None

def get_database():
    global _client, _db
    if _db is not None:
        try:
            # Quick connectivity test
            _db.command("ping")
            return _db
        except Exception:
            _db = None

    if USE_MOCK_MONGO:
        _client = mongomock.MongoClient()
        _db = _client[DB_NAME]
        print(f"[Database] Connected to in-memory Mock MongoDB ({DB_NAME})")
    else:
        try:
            _client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
            _client.admin.command("ping")
            _db = _client[DB_NAME]
            print(f"[Database] Connected to MongoDB at {MONGO_URI} ({DB_NAME})")
        except Exception as e:
            print(f"[Database Warning] Could not connect to real Mongo ({e}). Falling back to in-memory mock Mongo.")
            _client = mongomock.MongoClient()
            _db = _client[DB_NAME]
            
    return _db
