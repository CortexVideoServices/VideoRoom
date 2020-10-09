class ErrorWithInfo(Exception):
    """ Error with ext info
    """

    def __init__(self, message, **kwargs):
        super.__init__(message)
        self.ext_info = {'_class': self.__class__.__name__, '_message': message, **kwargs}
