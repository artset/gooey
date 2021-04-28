# Custom Workspace class representing a workspace in workspaces collection in the db.
class Workspace(object):
    def __init__(self, title, description, emoji, date, quiz):
        self.title = title
        self.description = description
        self.emoji = emoji
        self.date = date
        self.quiz = quiz

    @staticmethod
    def from_dict(ws_dict):
        workspace = Workspace(ws_dict[u'title'], ws_dict[u'description'], ws_dict[u'emoji'], ws_dict[u'date'], ws_dict[u'quiz'])
        return workspace

    def to_dict(self):
        data = {
            u'title': self.title,
            u'description': self.description,
            u'emoji': self.emoji,
            u'date': self.date,
            u'quiz' : self.quiz
        }
        return data

    def __repr__(self):
        return(u'Workspace(title={}, description={}, emoji={}, date={},quiz={})'.format(
        self.title, self.description, self.emoji, self.date, self.quiz))