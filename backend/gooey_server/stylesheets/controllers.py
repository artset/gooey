import datetime
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from firebase_admin import firestore
import json

stylesheets = Blueprint('stylesheets', __name__)
CORS(stylesheets)

#Handles get request for loading liked gallery cards to be potential stylesheets.
@stylesheets.route('/loadFavorites/<string:id>', methods=["POST","GET"])
def load_favorites(id):
    data = {}
    try:
       if request.method == "GET":
            db = firestore.client()
            workspaceId = id
            card_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards')
            # Retrieves liked cards in the gallery page, fetch all data and return it to the frontend.
            favs = card_ref.where(u'heart',u'==', True).stream()
            for fav in favs:
                data.update({fav.id: fav.to_dict()})
    except Exception as ex:
            return jsonify(success=False, favorites=None)
    return jsonify(success= True, favorites = data)

#Handles get request for exporting a stylesheet to share.
@stylesheets.route('/get/<string:id>/<string:stylesheetId>', methods=["POST","GET"])
def get_stylesheet(id, stylesheetId):
    result = {}
    try:
       if request.method == "GET":
            db = firestore.client()
            workspaceId = id
            card_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetId)
            card = card_ref.get()
            result.update({stylesheetId: card.to_dict()})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False, data=None)
    return jsonify(success= True, data = result)

#Handles get request to load all stylesheets in the current workspace.
@stylesheets.route('/load/<string:id>', methods=["POST","GET"])
def load_stylesheets(id):
    data = {}
    try:
       if request.method == "GET":
            db = firestore.client()
            workspaceId = id
            stylesheets = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').stream()
            for stylesheet in stylesheets:
                style_dict = stylesheet.to_dict()
                data.update({stylesheet.id: style_dict})
    except Exception as ex:
            return jsonify(success=False, stylesheets=None)
    return jsonify(success= True, stylesheets = data)

# Handles get request for the header drop down that includes current workspace and 3 most recent workspace information.
@stylesheets.route('/getCurrent/<string:uid>/<string:id>', methods=["POST","GET"])
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
            curr_data = {}
            curr_data.update(title)
            curr_data.update(emoji)
            current = {'current': curr_data}
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
            return jsonify(success=False, workspaceData=None)
    return jsonify(success= True, workspaceData = data)

# Handles post request to add a new stylesheets
@stylesheets.route('/add/<string:id>', methods=["POST","GET"])
def add(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            # Generates new id for the stylesheet.
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document()
            stylesheet_ref.set(data)
            stylesheet_ref.update({u'name':"Untitled"})
            stylesheet_id = stylesheet_ref.id
    except Exception as ex:
            return jsonify(success=False, id = None)
    return jsonify(success= True, id = stylesheet_id)

# Handles post request to delete a stylesheet.
@stylesheets.route('/delete/<string:id>', methods=["POST","GET"])
def delete_stylesheet(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId).delete()
    except Exception as ex:
            return jsonify(success=False)
    return jsonify(success= True)

# Handles post request to update a font in the current stylesheet.
@stylesheets.route('/updateFont/<string:id>', methods=["POST","GET"])
def update_font(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            node = data['node']
            type = data['type']
            new_data = data['update']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            # Update font value.
            stylesheet_ref.update({node + u'.' + type: new_data})
    except Exception as ex:
            return jsonify(success=False)
    return jsonify(success= True)

# Handles post request for updating a color of the stylesheets in the background or in text.
@stylesheets.route('/updateNodeColor/<string:id>', methods=["POST","GET"])
def update_node_color(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            node = data['node']
            index = data['index']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            # Handles the case if the color updates in the background.
            if (node == "background"):
                stylesheet_ref.update({u'background': index})
            # Handles all other cases i.e. body or title of text
            else:
                stylesheet_ref.update({node + u'.color': index})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False)
    return jsonify(success= True)

# Handles post request to updating a palette color in a stylesheet.
@stylesheets.route('/updatePalette/<string:id>', methods=["POST","GET"])
def update_palette(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            color = data['color']
            index = data['index']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            # Firebase is unable to handle indexing in arrays, thus the list of colors is retrieved, modified then updated.
            colors_list = stylesheet_ref.get({u'colors'}).to_dict().get('colors')
            colors_list[index] = color
            # Replace original array in the database with the updated version.
            stylesheet_ref.update({u'colors': colors_list})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False)
    return jsonify(success= True)

# Handle post request to add a color to the palette.
@stylesheets.route('/addPaletteColor/<string:id>', methods=["POST","GET"])
def add_palette_color(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            color = data['color']
            index = data['index']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            # Retrieving the list of colors and appending the color to the end of the array.
            colors_list = stylesheet_ref.get({u'colors'}).to_dict().get('colors')
            colors_list.insert(index, color)
            stylesheet_ref.update({u'colors': colors_list})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False)
    return jsonify(success= True)

# Handles post request to delete a color in the palette
@stylesheets.route('/deletePaletteColor/<string:id>', methods=["POST","GET"])
def delete_palette_color(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            index = data['index']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            colors_list = stylesheet_ref.get({u'colors'}).to_dict().get('colors')
            # Retrieve the list of colors to delete the specific element in the given index.
            backgroundNum = stylesheet_ref.get({u'background'}).to_dict().get('background')
            if (index != 0 and backgroundNum >= index):
                stylesheet_ref.update({u'background': (backgroundNum - 1)})
            titleNum = stylesheet_ref.get({u'title.color'}).to_dict().get('title').get('color')
            if (index != 0 and titleNum >= index):
                stylesheet_ref.update({u'title.color': (titleNum - 1)})
            bodyNum = stylesheet_ref.get({u'body.color'}).to_dict().get('body').get('color')
            if (index != 0 and bodyNum >= index):
                stylesheet_ref.update({u'body.color': (bodyNum - 1)})
            del colors_list[index]
            stylesheet_ref.update({u'colors': colors_list})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False)
    return jsonify(success= True)


# Handle post request to update the name of a stylesheet, by default the stylesheet does not have a name.
@stylesheets.route('/updateName/<string:id>', methods=["POST","GET"])
def update_name(id):
    try:
       if request.method == "POST":
            data = request.json
            db = firestore.client()
            workspaceId = id
            stylesheetsId = data['id']
            name = data['name']
            stylesheet_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets').document(stylesheetsId)
            stylesheet_ref.update({u'name': name})
    except Exception as ex:
            print(str(ex))
            return jsonify(success=False)
    return jsonify(success= True)