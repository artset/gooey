import datetime
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from firebase_admin import firestore
from backend.gooey_server.dashboard.models import Workspace

dashboard = Blueprint('dashboard', __name__)
CORS(dashboard)

# Handles post request for creating a new workspace.
@dashboard.route('/create', methods=["POST","GET"])
def create_new_workspace():
    try:
        if request.method == "POST":
            workspace_info = request.json
            userUID = workspace_info['uid']

            # Checks if the title of the workspace already exists
            if not checkDuplicateName(userUID, workspace_info['title']):
                return jsonify(success=False, workspaceid="")

            # Create new instance of workspace to add to database
            workspace = Workspace(workspace_info['title'],
            workspace_info['description'],
            workspace_info['emoji'],
            datetime.datetime.now(),[])

            db = firestore.client()
            # Add workspace to workspaces collection
            new_workspace = db.collection(u'workspaces').document()
            new_workspace.set(workspace.to_dict())
            new_workspace_id = new_workspace.id
            # Add workspace ID under the user
            user_ref = db.collection(u'users').document(userUID)
            user_ref.update({u'workspaces': firestore.ArrayUnion([new_workspace_id])})
    except Exception as ex:
        print(str(ex))
        return jsonify(success=False, workspaceid="")
    return jsonify(success=True, workspaceid=new_workspace_id)

# Handles post request for an update in the workspace
@dashboard.route('/update', methods=["POST","GET"])
def update_workspace():
    try:
        if request.method == "POST":
            workspace_info = request.json
            db = firestore.client()
            workspace_ref = db.collection(u'workspaces').document(workspace_info['id'])
            # Making appropriate updates if necessary
            workspace_ref.update({u'emoji': workspace_info['emoji']})
            workspace_ref.update({u'title': workspace_info['title']})
            workspace_ref.update({u'description': workspace_info['description']})
    except Exception as ex:
        print(str(ex))
        return jsonify(success=False)
    return jsonify(success=True)

# Handles post request for deleting a workspace
@dashboard.route('/delete', methods=["POST","GET"])
def delete_workspace():
    try:
        if request.method == "POST":
            workspace_info = request.json
            userUID = workspace_info['uid']
            workspaceId = workspace_info['workspaceId']
            db = firestore.client()
            #delete the entire workspace collection, if it exists
            gallery_ref = db.collection(u'workspaces').document(workspaceId).collection(u'galleryCards')
            if len(list(gallery_ref.stream())) > 0:
                delete_entire_collection(gallery_ref, 10)
            #delete the entire stylesheets collection, if it exists
            stylesheets_ref = db.collection(u'workspaces').document(workspaceId).collection(u'stylesheets')
            if len(list(stylesheets_ref.stream())) > 0:
                delete_entire_collection(stylesheets_ref, 10)
            # Delete workspace and reference under the user
            db.collection(u'workspaces').document(workspaceId).delete()
            user_ref = db.collection(u'users').document(userUID)
            user_ref.update({u'workspaces': firestore.ArrayRemove([workspaceId])})
    except Exception as ex:
        print(str(ex))
        print("something went wrong?")
        return jsonify(success=False)
    return jsonify(success=True)

# Handles get request of loading all the workspaces to the dashboard page.
@dashboard.route('/load/<string:id>', methods=["POST","GET"])
def load_workspaces(id):
    data = []
    try:
        if request.method == "GET":
            workspaces = []
            db = firestore.client()
            userUID = id
            user_ref = db.collection(u'users').document(id)
            # Retrieve workspace ids under the current user and access them in the workspaces collection.
            workspaces_ids = user_ref.get({u'workspaces'}).to_dict().get('workspaces')
            for ws in workspaces_ids:
                ws_ref = db.collection(u'workspaces').document(ws)
                workspace_dict = ws_ref.get().to_dict()
                id_info = {'id': ws, 'uid': userUID}
                workspace_dict.update(id_info)
                data.append(workspace_dict)
    except Exception as ex:
        print(str(ex))
    return jsonify(workspaces=data)

# Handles get request to make sure users take the quiz only once per workspace.
@dashboard.route('/checkQuiz/<string:id>', methods=["POST","GET"])
def check_quiz(id):
    try:
       if request.method == "GET":
            db = firestore.client()
            ws_ref = db.collection(u'workspaces').document(id)
            quiz_results = ws_ref.get({u'quiz'}).to_dict()
            quiz_results = quiz_results.get('quiz')
            if (quiz_results is None or len(quiz_results) == 0) :
                return jsonify(success=False)
            else:
                return jsonify(success=True)
    except Exception as ex:
            return jsonify(success=False)
    return jsonify(success=True)

# Deletes an entire collection or subcollection given a reference and the max number per round.
def delete_entire_collection(collection, max_num):
    db = firestore.client()
    documents = collection.limit(max_num).stream()
    delete_num = 0

    for document in documents:
        document.reference.delete()
        delete_num = delete_num + 1

    # If there are more documents than the max number, it will run this command until the collection is empty.
    if delete_num >= max_num:
        return delete_entire_collection(collection, max_num)

# Checks for duplicate titles when a user tries to create a new workspace.
def checkDuplicateName(uid, workspace_name):
    db = firestore.client()
    # Get all the workspace ids
    user_ref = db.collection(u'users').document(uid)
    workspaces_list = user_ref.get({u'workspaces'})
    workspaces_ids = workspaces_list.get('workspaces')
    if (len(workspaces_ids) == 0):
        return True
    # Check if the name of the workspaces match the name newly created
    for ws in workspaces_ids:
        ws_ref = db.collection(u'workspaces').document(ws)
        if (workspace_name == ws_ref.get({u'title'}).get('title')):
            return False
    return True
