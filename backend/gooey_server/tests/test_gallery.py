import unittest
import sys
import datetime
import requests
from firebase_admin import firestore
from gooey_server.gallery.controllers import delete_entire_collection
from gooey_server.quiz.controllers import generateGalleryCards
from gooey_server.palette_generator.palette_generator import palette_generator
from gooey_server.palette_generator.color_library import color_library

class TestGallery(unittest.TestCase):

    def setUp(self):
        db = firestore.client()
        # make user in user collection
        # create a new workspace for them
        user_data = {'email': 'test@test.com', 'workspaces': []}
        db.collection(u'users').document('testUser').set(user_data)
        ws_data = {"emoji": "😎",
                    "title": "we are testing it bro",
                    "description": "we are maeking it hapen",
                    "date": datetime.datetime.now(),
                    "quiz": []}
        workspace1 = db.collection(u'workspaces').document(u'testWorkspace1')
        workspace1.set(ws_data)

        # get user document from DB
        user_ref = db.collection(u'users').document(u'testUser')
        user_ref.update({u'workspaces': firestore.ArrayUnion([u'testWorkspace1'])})
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
        card2 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card2')
        card2.update({u'heart': True})

    def tearDown(self):
        db = firestore.client()
        gallery_ref = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards')
        delete_entire_collection(gallery_ref, 10)
        db.collection(u'workspaces').document(u'testWorkspace1').delete()
        db.collection(u'users').document(u'testUser').delete()

    # Test loading gallery. 
    # also Test that all gallery cards have 2 fonts and 2 colors, and that background & font color don't match.
    def testCommonProperties(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/gallery/load/testWorkspace1')
        success = response.json()['success']
        galleryCards = response.json()['galleryCards']

        self.assertTrue(success) # successful server response
        self.assertEquals(len(galleryCards), 30) # 30 gallery cards

        for key in galleryCards.keys():
            # assert that every card has 2 colors
            self.assertEquals(len(galleryCards[key]['colors']['rgb']), 2)
            # assert that every card has 2 fonts
            fontCount = 0
            if (galleryCards[key]['title']['font']):
                fontCount += 1
            if (galleryCards[key]['body']['font']):
                fontCount += 1
            self.assertEquals(fontCount, 2)
            # assert that background and font color are not the same
            self.assertTrue(galleryCards[key]['background'] != galleryCards[key]['body']['color'])
            self.assertTrue(galleryCards[key]['background'] != galleryCards[key]['title']['color'])

    # refreshing the gallery
    def testRefreshingWorkspace(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/gallery/refresh/testWorkspace1')
        success = response.json()['success']
        newGalleryCards = response.json()['data']

        self.assertTrue(success) # successful server response
        self.assertEquals(len(newGalleryCards), 31) # it's 31 cards because it should retain the 1 favorite card.

    # getting current workspaces
    def testRecentWorkspaces(self):
        db = firestore.client()
        response = requests.get('http://localhost:5000/gallery/getCurrent/testUser/testWorkspace1')
        success = response.json()['success']
        data = response.json()['workspaceData']
        current = data['current']
        self.assertEquals(current['title'], 'we are testing it bro')
        recent = data['recent']
        self.assertEquals(len(recent), 0)

        # testing from Yeonjunie acct
        response = requests.get('http://localhost:5000/gallery/getCurrent/K3LaSjkKztbc2DDgIEoTFywQytT2/JI1jmwfI394iKSm2JRDg')
        success = response.json()['success']
        data = response.json()['workspaceData']
        current = data['current']
        self.assertEquals(current['title'], 'bunny')
        recent = data['recent']
        self.assertEquals(len(recent), 3)

        self.assertTrue(recent[1]['date'] < recent[0]['date'])
        self.assertTrue(recent[2]['date'] < recent[1]['date'])

    # hearting / unhearting
    def testLikeAndDislike(self):
        db = firestore.client()
        favorites_data = {"cardId": "card20"}
        response = requests.post('http://localhost:5000/gallery/heart/testWorkspace1', json=favorites_data)
        success = response.json()['success']
        self.assertTrue(success) # successful server response
        card20 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card20').get(field_paths={'heart'}).to_dict()
        self.assertTrue(card20['heart']) # card should be favorited

        unfavorites_data = {"cardId": "card2"}
        response2 = requests.post('http://localhost:5000/gallery/heart/testWorkspace1', json=unfavorites_data)
        success2 = response2.json()['success']
        self.assertTrue(success2) # successful server response
        card2 = db.collection(u'workspaces').document(u'testWorkspace1').collection(u'galleryCards').document('card2').get(field_paths={'heart'}).to_dict()
        self.assertFalse(card2['heart']) # card should be unfavorited

if __name__ == "__main__":
    unittest.main()