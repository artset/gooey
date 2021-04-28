import unittest
import sys
import datetime
import requests
from firebase_admin import firestore
from gooey_server.gallery.controllers import delete_entire_collection
from gooey_server.quiz.controllers import generateGalleryCards
from gooey_server.palette_generator.palette_generator import palette_generator
from gooey_server.palette_generator.color_library import color_library

class TestStylesheets(unittest.TestCase):

    def setUp(self):
        db = firestore.client()
        # make user in user collection
        user_data = {'email': 'test@gmail.com', 'workspaces': []}
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
        card1 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card1')
        card1.update({u'heart': True})
        card2 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card2')
        card2.update({u'heart': True})
        card3 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card3')
        card3.update({u'heart': True})

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

    #Testing to retrieve all the liked gallery cards in stylesheets page. 
    def testLoadFavorites(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/stylesheets/loadFavorites/testWorkspace1')
        success = response.json()['success']
        favorites = response.json()['favorites']
        self.assertTrue(success)
        self.assertEquals(len(favorites), 3)
        self.assertTrue('card1' in favorites)
        self.assertTrue('card2' in favorites)
        self.assertTrue('card3' in favorites)
        response1 = requests.get('http://localhost:5000/stylesheets/loadFavorites/testWorkspace3')
        noFavorites = response1.json()['favorites']
        self.assertEquals(len(noFavorites), 0)

    #Testing information needed for header drop down.
    def testGetCurrent(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/stylesheets/getCurrent/testUser/testWorkspace1')
        success = response.json()['success']
        data = response.json()['workspaceData']
        current = data['current']
        self.assertEquals(current['title'], 'workspace 1')
        recent = data['recent']
        self.assertEquals(len(recent), 2)

    #Testing all the various stylesheets functions such as updating, deleting, and adding and deleting nodes.
    def testStyleSheetFunctions(self):
        db = firestore.client()
        stylesheet1_data = {'colors': ['#3b6383', '#d4cacf'],
        'title': {'color': 1, 'font': 'Sen', 'type': 'sans-serif', 'size': '16px', 'style': 'Regular', 'alignment': 'left', 'text': 'Sen Lorem Ipsum'},
        'body': {'color': 1, 'font': 'Karla', 'type': 'sans-serif', 'size': '12px', 'style': 'Regular', 'alignment': 'left', 'text': 'Karla Lorem ipsum'},
        'background': 0,
        'name': 'Untitled',
        'date': '4/30/2020, 11:56:07 PM'}
        response = requests.post('http://localhost:5000/stylesheets/add/testWorkspace1', json=stylesheet1_data)
        success = response.json()['success']
        stylesheetId = response.json()['id']
        self.assertTrue(success)
        self.assertTrue(stylesheetId != None)
        #testing update font
        font_data = {'id': stylesheetId, 'node': 'title', 'type': 'size', 'update': '18px'}
        fontResponse = requests.post('http://localhost:5000/stylesheets/updateFont/testWorkspace1', json=font_data)
        self.assertTrue(fontResponse.json()['success'])
        #testing updateNodeColor
        nodeColor_data = {'id': stylesheetId, 'node': 'background', 'index': 1}
        nodeColorResponse = requests.post('http://localhost:5000/stylesheets/updateNodeColor/testWorkspace1', json=nodeColor_data)
        self.assertTrue(nodeColorResponse.json()['success'])
        #testing updatePalette
        updatePalette_data = {'id': stylesheetId, 'color': '#3283a8', 'index': 0}
        updatePaletteResponse = requests.post('http://localhost:5000/stylesheets/updatePalette/testWorkspace1', json=updatePalette_data)
        self.assertTrue(updatePaletteResponse.json()['success'])
        #testing addPaletteColor
        addPalette_data = {'id': stylesheetId, 'color': '#bfbfbf', 'index': 2}
        addPaletteResponse = requests.post('http://localhost:5000/stylesheets/addPaletteColor/testWorkspace1', json=addPalette_data)
        self.assertTrue(addPaletteResponse.json()['success'])
        #testing deletePaletteColor
        deletePalette_data = {'id': stylesheetId, 'index': 1}
        deletePaletteResponse = requests.post('http://localhost:5000/stylesheets/deletePaletteColor/testWorkspace1', json=deletePalette_data)
        self.assertTrue(deletePaletteResponse.json()['success'])
        #testing updateName
        updateName_data = {'id': stylesheetId, 'name': 'testStylesheet'}
        updateNameResponse = requests.post('http://localhost:5000/stylesheets/updateName/testWorkspace1', json=updateName_data)
        self.assertTrue(updateNameResponse.json()['success'])
        stylesheet_ref = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'stylesheets').document(stylesheetId)
        stylesheet = stylesheet_ref.get().to_dict()
        self.assertEquals(stylesheet['background'], 1)
        self.assertEquals(stylesheet['name'], 'testStylesheet')
        self.assertEquals(len(stylesheet['colors']), 2)
        self.assertEquals(stylesheet['colors'][1], '#bfbfbf')
        self.assertEquals(stylesheet['title']['size'], '18px')
        #test loading
        loadResponse = requests.get('http://localhost:5000/stylesheets/load/testWorkspace1')
        loadStylesheet = loadResponse.json()['stylesheets']
        self.assertTrue(stylesheetId in loadStylesheet)
        #testing delete
        delete_data = {'id': stylesheetId}
        deleteResponse = requests.post('http://localhost:5000/stylesheets/delete/testWorkspace1', json=delete_data)
        self.assertTrue(deletePaletteResponse.json()['success'])
        # test loading
        loadEmptyResponse = requests.get('http://localhost:5000/stylesheets/load/testWorkspace1')
        emptyStylesheet = loadEmptyResponse.json()['stylesheets']
        self.assertEquals(len(emptyStylesheet),0)

if __name__ == "__main__":
    unittest.main()