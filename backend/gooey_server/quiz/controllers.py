import datetime
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from firebase_admin import firestore
from backend.gooey_server.gallery.models import GalleryCard
from backend.gooey_server.palette_generator.palette_generator import palette_generator
from backend.gooey_server.palette_generator.color_library import color_library
import json

quiz = Blueprint('quiz', __name__)
CORS(quiz)

# Handles post request when a user submits the color quiz. This triggers the algorithm to generate gallery
# cards based on the quiz results.
@quiz.route('/result', methods=["POST","GET"])
def create_new_workspace():
    workspaceID = ""
    try:
        if request.method == "POST":
            quiz_data = request.json
            workspaceID = quiz_data['workspaceid']
            selected_colors = quiz_data['colors']
            db = firestore.client()
            workspace_ref = db.collection(u'workspaces').document(workspaceID)
            # Calls the algorithm to generate gallery cards.
            # Stores quiz results to the database.
            for color in selected_colors:
                workspace_ref.update({u'quiz': firestore.ArrayUnion([color])})
            
            ifGeneratedColors = generateGalleryCards(selected_colors, workspaceID)
            if ifGeneratedColors:
                return jsonify(success=True, workspaceID = workspaceID)
    except Exception as ex:
        return jsonify(success=False, workspaceId = workspaceID)
    # return jsonify(success=True, workspaceId = workspaceID)

# Helper function that runs the algorithm. Makes sure the newly generated gallery cards are stored in the database.
def generateGalleryCards(liked_colors, workspaceId):
    generator = palette_generator()
    #Retrieves algorithm's output in dictionary form.
    palettes = generator.generate_palettes(liked_colors, None, 30, False)
    data = generator.output_to_gallery_cards(palettes)
    db = firestore.client()
    try:
        for card in data:
            card_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards').document()
            card_ref.set(card)
    except Exception as ex:
        return False
    return True