from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from backend.gooey_server.auth.models import User

flaskauth = Blueprint('flaskauth', __name__)

# Processes post request when a user makes a new Gooey account, and adds user info in the database.
@flaskauth.route('/signin', methods=["POST","GET"])
def signIn_page():
    logged = True
    try:
        if request.method == "POST":
            user_info = request.json
            db = firestore.client()
            db.collection(u'users').document(user_info['uid']).set(User(user_info['email'], []).to_dict())
    except Exception as ex:
        logged = False
    finally:
        return jsonify(success=logged)