from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, String, Integer, Boolean, Numeric
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """ User account
    """
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    display_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    salt = Column(String, nullable=False)
    password = Column(String, nullable=False)
    expired_at = Column(DateTime)
    refresh_token = Column(String, index=True)
    token_expired_at = Column(DateTime, nullable=False, server_default=func.now())


class RegToken(Base):
    """ Registration confirm token
    """
    __tablename__ = 'reg_token'
    token = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    expired_at = Column(DateTime, nullable=False)
    confirmed_at = Column(DateTime)


class Conference(Base):
    """ Video conference
    """
    __tablename__ = 'conference'
    session_id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    started_at = Column(DateTime, nullable=False, server_default=func.now())
    allow_anonymous = Column(Boolean, nullable=False)
    display_name = Column(String)
    description = Column(String)
    expired_at = Column(DateTime)


