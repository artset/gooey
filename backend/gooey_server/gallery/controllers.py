import datetime
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from firebase_admin import firestore
import json
from backend.gooey_server.palette_generator.palette_generator import palette_generator

gallery = Blueprint('gallery', __name__)
CORS(gallery)

# Handles get request to load all the gallery cards of a workspace to the gallery page.
@gallery.route('/load/<string:id>', methods=["POST","GET"])
def load_gallery(id):
    data = {}
    try:
       if request.method == "GET":
            db = firestore.client()
            workspaceId = id
            # Retrieve all the gallery card documents in the collection.
            cards = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards').stream()
            for card in cards:
                card_dict = card.to_dict()
                data.update({card.id: card_dict})
    except Exception as ex:
            return jsonify(success=False, galleryCards="")
    return jsonify(success= True, galleryCards = data)

# Handles post request to update the current gallery card being hearted or un-hearted.
@gallery.route('/heart/<string:id>', methods=["POST","GET"])
def heart(id):
    try:
       if request.method == "POST":
            card_data = request.json
            db = firestore.client()
            workspaceId = id
            cardId = card_data['cardId']
            card_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards').document(cardId)
            bool = card_ref.get(field_paths={'heart'}).to_dict().get('heart')
            # Change the heart status boolean accordingly
            bool = not bool
            card_ref.update({u'heart': bool})
    except Exception as ex:
            return jsonify(success=False)
    return jsonify(success= True)

# Handles post request to delete a gallery cards, removes the instance from database.
@gallery.route('/delete/<string:id>', methods=["POST","GET"])
def delete(id):
    try:
       if request.method == "POST":
            card_data = request.json
            db = firestore.client()
            workspaceId = id
            cardId = card_data['cardId']
            db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards').document(cardId).delete()
    except Exception as ex:
            return jsonify(success=False)
    return jsonify(success= True)

# Handles the refresh gallery cards button, which retains favorited cards and generates new cards via the algorithm.
@gallery.route('/refresh/<string:givenWorkspaceId>', methods=["POST","GET"])
def refresh_cards(givenWorkspaceId):
    try:
        workspaceId = givenWorkspaceId
        db = firestore.client()
        quiz_data = db.collection(u'workspaces').document(workspaceId).get().to_dict().get("quiz")
        gallery_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards')
        # Retrieve all the liked gallery cards.
        favorites = gallery_ref.where(u'heart',u'==',True).stream()
        data = []
        # Result stores all the cards that will be newly loaded to the page after update.
        result = []
        for palette in favorites:
            result.append(palette.to_dict())
            rgb_data = palette.to_dict()['colors']['rgb']
            palette_data = []
            for rgb_string in rgb_data:
                palette_data.append([float(s) for s in rgb_string[1:len(rgb_string)-1].split(", ")])
            data.append(palette_data)
            palette.reference.delete()
        coll_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards')
        # Delete old gallery cards to replace with new ones.
        delete_entire_collection(coll_ref, 10) # delete the entire collection
        # Call algorithm with the quiz data and liked cards.
        generator = palette_generator()
        palettes = generator.generate_palettes(quiz_data, data, 30, False)
        result.extend(generator.output_to_gallery_cards(palettes))
        # Dictionary to load all the data as we add the generated cards from the algorithm to the database.
        final_data = {}
        for card in result:
            card_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards').document()
            card_ref.set(card)
            final_data.update({card_ref.id: card})
    except Exception as ex:
                return jsonify(success=False)
    return jsonify(success= True, data = final_data)

#Handles get request for header data including current workspace title and emoji, and three most recent workspaces.
@gallery.route('/getCurrent/<string:uid>/<string:id>', methods=["POST","GET"])
def get_current_workspace(uid, id):
    data = {}
    try:
       if request.method == "GET":
            userUID = uid
            db = firestore.client()
            workspaceId = id
            workspace_ref = db.collection(u'workspaces').document(workspaceId)
            title = workspace_ref.get({u'title'}).to_dict()
            emoji = workspace_ref.get({u'emoji'}).to_dict()
            # Storing current workspace's title and emoji.
            curr_data = {}
            curr_data.update(title)
            curr_data.update(emoji)
            current = {'current': curr_data}
            # Storing up to 3 most recent workspaces (title and emoji) excluding the current.
            most_recent_data = {}
            user_ref = db.collection(u'users').document(userUID)
            workspaces_list = user_ref.get({u'workspaces'}).to_dict()
            workspaces_ids = workspaces_list.get('workspaces')
            recent_data = []
            for ws in workspaces_ids:
                if (ws == workspaceId):
                    continue
                ws_ref = db.collection(u'workspaces').document(ws)
                workspace_dict = ws_ref.get().to_dict()
                workspace_dict.pop('description', None)
                workspace_dict.pop('quiz', None)
                workspace_dict['workspaceID'] = ws
                recent_data.append(workspace_dict)
            recent_data.sort(key= lambda x:x['date'], reverse =True)
            recent = {'recent':recent_data[:3]}
            data.update(current)
            data.update(recent)
    except Exception as ex:
            print(str(ex))
            print("something went wrong?")
            return jsonify(success=False, workspaceData=None)
    return jsonify(success= True, workspaceData = data)

# Helper function to delete an entire collection, used when the user wants a new set of gallery cards.
# Parameters take reference to the collection needed to be wiped out, and max number of documents
# it will remove at a time.
def delete_entire_collection(collection, max_num):
    db = firestore.client()
    documents = collection.limit(max_num).stream()
    delete_num = 0
    for document in documents:
        document.reference.delete()
        delete_num = delete_num + 1
    # Function recurs if there are documents still remaining in the collection.
    if delete_num >= max_num:
        return delete_entire_collection(collection, max_num)