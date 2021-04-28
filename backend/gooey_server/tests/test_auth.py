import unittest
import sys
from gooey_server.auth.models import User
import requests
from firebase_admin import firestore

class TestAuth(unittest.TestCase):

    def testUserModel(self):
        user_dict = {'email':'ykim106@gmail.com', 'workspaces': []}
        user = User.from_dict(user_dict)
        userInfo = user.to_dict()
        self.assertEqual(userInfo['email'], 'ykim106@gmail.com')
        self.assertEqual(len(userInfo['workspaces']), 0)

    def testUserSignIn(self):
        data = {'uid':'testUser', 'email': 'test@gmail.com'}
        response = requests.post('http://localhost:5000/auth/signin', json=data)
        self.assertTrue(response.json()['success'])
        wrong_data = {'uid':'wrongUser'}
        response = requests.post('http://localhost:5000/auth/signin', json=wrong_data)
        self.assertFalse(response.json()['success'])
        #remove added user
        db = firestore.client()
        db.collection(u'users').document(data['uid']).delete()

if __name__ == "__main__":
    unittest.main()