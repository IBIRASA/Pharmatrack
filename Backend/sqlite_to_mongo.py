import sqlite3
from pymongo import MongoClient

# 1️⃣ Connect to SQLite
sqlite_conn = sqlite3.connect("db.sqlite3")
cursor = sqlite_conn.cursor()

# 2️⃣ Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
mongo_db = client["pharmatrack_db"]  # Database name in MongoDB

# 3️⃣ Example: Transfer 'accounts_user' table to MongoDB
cursor.execute("SELECT id, username, email FROM accounts_user")
users_collection = mongo_db["users"]  # Collection name

for row in cursor.fetchall():
    users_collection.insert_one({
        "id": row[0],
        "username": row[1],
        "email": row[2]
    })

print("Data transfer complete!")
