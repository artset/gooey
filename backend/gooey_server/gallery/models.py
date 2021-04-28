# Custom Gallery
class GalleryCard(object):
    def __init__(self, color, title, body, background):
        self.color = color
        self.title = title
        self.body = body
        self.background = background

    @staticmethod
    def from_dict(cardDict):
        galleryCard = GalleryCard(cardDict[u'color'], cardDict[u'title'], cardDict[u'body'], cardDict[u'background'])
        return galleryCard

    def to_dict(self):
        data = {
            u'color': self.color,
            u'title': self.title,
            u'body': self.body,
            u'background': self.background
        }

    def __repr__(self):
        return(u'GalleryCard(color={}, title={}, body={}, background={})'.format(
        self.color, self.title, self.body, self.background))