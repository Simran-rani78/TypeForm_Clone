import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, JSON, func
from sqlalchemy.orm import relationship
import enum
import shortuuid
from .database import Base

class FormStatus(str, enum.Enum):
    draft = "draft"
    published = "published"

class QuestionType(str, enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    rating = "rating"
    file_upload = "file_upload"

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    status = Column(Enum(FormStatus), default=FormStatus.draft, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Bonus Features
    theme = Column(JSON, default=lambda: {"bg": "#ffffff", "text": "#171717", "button": "#2563eb", "font": "inter"})
    views = Column(Integer, default=0)
    starts = Column(Integer, default=0)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id = Column(String, ForeignKey("forms.id"), nullable=False)
    type = Column(Enum(QuestionType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_required = Column(Boolean, default=False)
    order = Column(Integer, nullable=False)
    options = Column(JSON, nullable=True)  # For multiple choice, dropdown, rating steps etc.

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    logic_rules = relationship("LogicRule", back_populates="question", cascade="all, delete-orphan", order_by="LogicRule.id")

class LogicRule(Base):
    __tablename__ = "logic_rules"

    id = Column(String, primary_key=True, default=lambda: shortuuid.uuid())
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    condition = Column(String, nullable=False) # e.g. "equals", "not_equals"
    value = Column(String, nullable=False)
    target_question_id = Column(String, nullable=False)

    question = relationship("Question", back_populates="logic_rules")

class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id = Column(String, ForeignKey("forms.id"), nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    response_id = Column(String, ForeignKey("responses.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    value = Column(JSON, nullable=False)  # Using JSON to support multiple types of answers natively

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
