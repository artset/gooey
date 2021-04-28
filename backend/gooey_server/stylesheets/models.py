class StylesheetCard(object):
    def __init__(self, name, background, body, title, colors):
        self.name = name
        self.background = background
        self.body = body
        self.title = title
        self.colors = colors

    @staticmethod
    def from_dict(ss_dict):
        stylesheetCard = StylesheetCard(ss_dict[u'name'], ss_dict[u'background'], ss_dict[u'body'], ss_dict[u'title'], ss_dict[u'colors'])
        return stylesheetCard

    def to_dict(self):
        data = {
            u'name': self.name
            u'background': self.background,
            u'body': self.bodyColor,
            u'title': self.title,
            u'colors': self.colors
        }

    def __repr__(self):
        return(u'StylesheetCard(name={}, background={}, body={}, title={}, colors={})'.format(
        self.name, self.background, self.body, self.title, self.colors))