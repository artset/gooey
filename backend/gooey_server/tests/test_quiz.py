import unittest
import sys
import requests
from firebase_admin import firestore
from gooey_server.gallery.controllers import delete_entire_collection

class TestQuiz(unittest.TestCase):

    def setUp(self):
        db = firestore.client()
        data = {"emoji": "🐇",
                "title": "Bunnie and Clyde",
                "description": "A criminal couple who traveled the Central United States with their gang during the Great Depression.",
                }
        new_workspace = db.collection(u'workspaces').document(u'testWorkspace')
        new_workspace.set(data)

    def tearDown(self):
        db = firestore.client()
        gallery_ref = db.collection(u'workspaces').document(u'testWorkspace').collection(u'galleryCards')
        delete_entire_collection(gallery_ref, 10)
        db.collection(u'workspaces').document(u'testWorkspace').delete()

    #Testing the creation of a new workspace after the user takes the quiz.
    def testCreateNewWorkspace(self):
        db = firestore.client()
        data = {'workspaceid': u'testWorkspace', 'colors': [ "#65000B" ,"#6D0101" ,"#F1CC79" ,"#FFE772" ,
        "#FCD975" ,"#FBE96C" ,"#00A693" ,"#469A84" ,"#1CD3A2" ,"#0076A3" ,"#0056A7" ,"#007BA7" ,"#007EC7" ,"#0066CC"]}
        response = requests.post('http://localhost:5000/quiz/result', json=data)
        self.assertTrue(response.json()['success'])
        self.assertEquals(response.json()['workspaceId'], 'testWorkspace')
        color_quiz_list = db.collection(u'workspaces').document(u'testWorkspace').get({u'quiz'}).to_dict().get('quiz')
        self.assertEquals(len(color_quiz_list), 14)
        gallery_ref = db.collection(u'workspaces').document(u'testWorkspace').collection(u'galleryCards')
        self.assertEquals(len(list(gallery_ref.stream())), 30)

if __name__ == "__main__":
    unittest.main()