# Custom User class representing a user in users collection in the db.
class User(object):
    def __init__(self, email, workspaces):
        self.email = email
        self.workspaces = workspaces

    # converts data stored in dictionary to a user object
    @staticmethod
    def from_dict(user_dict):
        user = User(user_dict[u'email'], user_dict[u'workspaces'])
        return user

    # returns user data in dictionary form
    def to_dict(self):
        data = {
            u'email': self.email,
            u'workspaces' : self.workspaces
        }
        return data

    def __repr__(self):
        return(u'Workspace(email={}, workspaces={})'.format(
        self.email, self.workspaces))