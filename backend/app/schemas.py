from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any
from datetime import datetime
from .models import FormStatus, QuestionType

# --- Question Schemas ---
class QuestionBase(BaseModel):
    type: QuestionType
    title: str
    description: Optional[str] = None
    is_required: bool = False
    order: int
    options: Optional[Any] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[Any] = None

# --- Logic Rule Schemas ---
class LogicRuleBase(BaseModel):
    condition: str
    value: str
    target_question_id: str

class LogicRuleCreate(LogicRuleBase):
    pass

class LogicRuleUpdate(BaseModel):
    condition: Optional[str] = None
    value: Optional[str] = None
    target_question_id: Optional[str] = None

class LogicRuleResponse(LogicRuleBase):
    id: str
    question_id: str

    model_config = ConfigDict(from_attributes=True)

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    logic_rules: List[LogicRuleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class QuestionReorder(BaseModel):
    question_ids: List[str]

# --- Answer & Submission Schemas ---
class AnswerBase(BaseModel):
    question_id: str
    value: Any

class AnswerResponse(AnswerBase):
    id: str
    response_id: str
    
    model_config = ConfigDict(from_attributes=True)

class ResponseCreate(BaseModel):
    answers: List[AnswerBase]

class ResponseResponse(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[AnswerResponse]
    
    model_config = ConfigDict(from_attributes=True)

# --- Form Schemas ---
class FormBase(BaseModel):
    title: str
    theme: Optional[dict] = None
    views: int = 0
    starts: int = 0

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[FormStatus] = None
    theme: Optional[dict] = None

class FormResponse(FormBase):
    id: str
    slug: str
    status: FormStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    theme: Optional[dict] = None
    views: int
    starts: int
    questions: List[QuestionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class FormListResponse(FormBase):
    id: str
    slug: str
    status: FormStatus
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    response_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)
