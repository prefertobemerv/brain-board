from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os, secrets

app = Flask(__name__)
CORS(app)  # for school demo; later you can restrict it

DB = "brainboard.db"

def init_db():
    with sqlite3.connect(DB) as con:
        cur = con.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                firstName TEXT,
                lastName TEXT
            )
        """)
        con.commit()

init_db()

@app.get("/health")
def health():
    return {"ok": True}

def tokens():
    return {
        "access_token": secrets.token_hex(24),
        "refresh_token": secrets.token_hex(32),
        "expires_in": 3600
    }

@app.post("/auth/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first = (data.get("firstName") or "").strip()
    last = (data.get("lastName") or "").strip()

    if not email or len(password) < 6:
        return jsonify({"message": "Invalid input"}), 400

    with sqlite3.connect(DB) as con:
        cur = con.cursor()
        try:
            cur.execute(
                "INSERT INTO users(email,password,firstName,lastName) VALUES(?,?,?,?)",
                (email, password, first, last)
            )
            con.commit()
        except sqlite3.IntegrityError:
            return jsonify({"message": "Email already exists"}), 409

        user_id = cur.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()[0]

    return jsonify({**tokens(), "user": {"id": user_id, "email": email, "firstName": first, "lastName": last}}), 201

@app.post("/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    with sqlite3.connect(DB) as con:
        cur = con.cursor()
        row = cur.execute(
            "SELECT id, email, firstName, lastName, password FROM users WHERE email=?",
            (email,)
        ).fetchone()

    if not row or row[4] != password:
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({**tokens(), "user": {"id": row[0], "email": row[1], "firstName": row[2], "lastName": row[3]}}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))