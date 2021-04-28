import unittest
import sys
import datetime
import requests
from firebase_admin import firestore
from gooey_server.gallery.controllers import delete_entire_collection
from gooey_server.quiz.controllers import generateGalleryCards
from gooey_server.palette_generator.palette_generator import palette_generator
from gooey_server.palette_generator.color_library import color_library

class Dashboard(unittest.TestCase):

    def setUp(self):
        db = firestore.client()
        # make user in user collection
        # create three new workspace for them
        user_data = {'email': 'test@test.com', 'workspaces': []}
        db.collection(u'users').document('testUser').set(user_data)

        ws1_data = {"emoji": "😀",
                    "title": "workspace 1",
                    "description": "first test file!",
                    "date": datetime.datetime.now(),
                    "quiz": []}
        ws2_data = {"emoji": "😎",
                   "title": "workspace 2",
                   "description": "second test file!",
                   "date": datetime.datetime.now(),
                   "quiz": []}
        ws3_data = {"emoji": "🙏",
                   "title": "workspace 3",
                   "description": "third test file!",
                   "date": datetime.datetime.now(),
                   "quiz": []}
        workspace1 = db.collection(u'workspaces').document(u'testWorkspace1')
        workspace1.set(ws1_data)
        workspace2 = db.collection(u'workspaces').document(u'testWorkspace2')
        workspace2.set(ws2_data)
        workspace3 = db.collection(u'workspaces').document(u'testWorkspace3')
        workspace3.set(ws3_data)

        user_ref = db.collection(u'users').document(u'testUser')
        user_ref.update({u'workspaces': firestore.ArrayUnion([u'testWorkspace1'])})
        user_ref.update({u'workspaces': firestore.ArrayUnion([u'testWorkspace2'])})
        user_ref.update({u'workspaces': firestore.ArrayUnion([u'testWorkspace3'])})

        # only workspace1 has completed quiz
        liked_colors = ["#AF4035", "#AF4D43", "#FFFF99", "#FFFC99", "#1CD3A2", "#1CAC78", "#1F75FE",
                               "#0066CC","#0066FF","#967BB6","#9678B6"]
        for color in liked_colors:
            workspace1.update({u'quiz': firestore.ArrayUnion([color])})
        generator = palette_generator()
        #Retrieves algorithm's output in dictionary form.
        palettes = generator.generate_palettes(liked_colors, None, 30, False)
        gallery_data = generator.output_to_gallery_cards(palettes)
        i=1
        for card in gallery_data:
            card_ref = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document(u'card' + str(i))
            card_ref.set(card)
            i = i +1

    def tearDown(self):
        db = firestore.client()
        gallery_ref = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards')
        delete_entire_collection(gallery_ref, 10)
        stylesheets_ref = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'stylesheets')
        delete_entire_collection(stylesheets_ref, 10)
        db.collection(u'workspaces').document(u'testWorkspace1').delete()
        db.collection(u'workspaces').document(u'testWorkspace2').delete()
        db.collection(u'workspaces').document(u'testWorkspace3').delete()
        db.collection(u'users').document(u'testUser').delete()

    # loading a workspace
    def testLoadingWorkspace(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/dashboard/load/testUser')

        workspaces = response.json()['workspaces']
        existing_workspaces = []
        for row in workspaces:
            existing_workspaces.append(row['title'])

        self.assertTrue("workspace 1" in existing_workspaces)
        self.assertTrue("workspace 2" in existing_workspaces)
        self.assertTrue("workspace 3" in existing_workspaces)

    # creating a workspace
    def testAddandDeleteWorkspace(self):
        db = firestore.client()
        newWorkspace = { "uid": "testUser", "title": "new", "description": "yay", "emoji": "🤣" }
        response = requests.post('http://localhost:5000/dashboard/create', json=newWorkspace)
        success = response.json()['success']
        self.assertTrue(success) # successful server response

        workspaces = db.collection(u'workspaces').stream()
        successfullyAdded = False
        created_id = None
        for w in workspaces:
            if db.collection(u'workspaces').document(w.id).get(field_paths={'title'}).to_dict()['title'] == "new":
                successfullyAdded = True 
                created_id = w.id
        self.assertTrue(successfullyAdded)

        deleteWorkspace = { "uid": "testUser", "workspaceId": created_id }
        response = requests.post('http://localhost:5000/dashboard/delete', json=deleteWorkspace)
        success = response.json()['success']
        self.assertTrue(success) # successful server response

        workspaces = db.collection(u'workspaces').stream()
        successfullyDeleted = True
        for w in workspaces:
            if db.collection(u'workspaces').document(w.id).get(field_paths={'title'}).to_dict()['title'] == "new":
                successfullyDeleted = False 
        self.assertTrue(successfullyDeleted)

    # creating a workspace with a duplicate name
    def testCreateWorkspaceDuplicateName(self):
        db = firestore.client()
        newWorkspace = { "uid": "testUser", "title": "workspace 1", "description": "yay", "emoji": "🤣" }
        response = requests.post('http://localhost:5000/dashboard/create', json=newWorkspace)
        success = response.json()['success']
        self.assertFalse(success) #unable to create workspace with same name

    # updating a workspace
    def testUpdatingWorkspace(self):
        db = firestore.client()
        updateWorkspace = { "id": "testWorkspace1", "emoji": "😁", "title": "workspace 1", "description": "hiii" }
        response = requests.post('http://localhost:5000/dashboard/delete', json=updateWorkspace)

        workspaces = db.collection(u'workspaces').stream()
        successfullyUpdated = True
        for w in workspaces:
            if db.collection(u'workspaces').document(w.id).get(field_paths={'title'}).to_dict()['title'] == "workspace 1":
                if db.collection(u'workspaces').document(w.id).get(field_paths={'description'}).to_dict()['description'] == "hiii":
                    successfullyUpdated = False 
        self.assertTrue(successfullyUpdated)

    # check quiz
    def testCheckQuiz(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/dashboard/checkQuiz/testWorkspace1')
        success = response.json()['success']
        self.assertTrue(success) # has already taken the quiz.

        response = requests.get('http://localhost:5000/dashboard/checkQuiz/testWorkspace2')
        success = response.json()['success']
        self.assertFalse(success) # has not taken the quiz yet.
