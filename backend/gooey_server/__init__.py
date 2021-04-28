from flask import Flask, jsonify
from firebase_admin import credentials, firestore, initialize_app, auth
import datetime
from flask_cors import CORS
from backend.gooey_server.dashboard.controllers import dashboard
from backend.gooey_server.auth.controllers import flaskauth
from backend.gooey_server.quiz.controllers import quiz
from backend.gooey_server.gallery.controllers import gallery
from backend.gooey_server.stylesheets.controllers import stylesheets


import json

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADER'] = 'Content-Type'

#register blueprints
app.register_blueprint(dashboard, url_prefix = '/dashboard')
app.register_blueprint(flaskauth, url_prefix = '/auth')
app.register_blueprint(quiz, url_prefix = '/quiz')
app.register_blueprint(gallery, url_prefix = '/gallery')
app.register_blueprint(stylesheets, url_prefix = '/stylesheets')

# #initialize firebase db
cred = credentials.Certificate("backend/key.json")
initialize_app(cred)