from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import shortuuid
from datetime import datetime, timezone

from . import models, schemas

# --- Forms ---
def get_form(db: Session, form_id: str) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def get_form_by_slug(db: Session, slug: str) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.slug == slug).first()

def get_forms(db: Session, skip: int = 0, limit: int = 100) -> List[models.Form]:
    return db.query(models.Form).order_by(models.Form.created_at.desc()).offset(skip).limit(limit).all()

def get_form_response_count(db: Session, form_id: str) -> int:
    return db.query(models.Response).filter(models.Response.form_id == form_id).count()

def create_form(db: Session, form: schemas.FormCreate) -> models.Form:
    # generate a random short slug
    slug = shortuuid.uuid()[:10].lower()
    
    db_form = models.Form(title=form.title, slug=slug, created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

def update_form(db: Session, form_id: str, form_update: schemas.FormUpdate) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    
    update_data = form_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_form, key, value)
    
    if "status" in update_data and update_data["status"] == models.FormStatus.published and not db_form.published_at:
        db_form.published_at = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(db_form)
    return db_form

def delete_form(db: Session, form_id: str) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True

def duplicate_form(db: Session, form_id: str) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    
    # Create new form
    new_slug = shortuuid.uuid()[:10].lower()
    new_form = models.Form(
        title=f"{db_form.title} (Copy)", 
        slug=new_slug,
        theme=db_form.theme,
        created_at=datetime.now(timezone.utc), 
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    # Duplicate questions and build ID map for logic rules
    questions = get_questions(db, form_id)
    old_to_new_q_ids = {}
    new_questions = []
    
    for q in questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            is_required=q.is_required,
            order=q.order,
            options=q.options
        )
        db.add(new_q)
        db.flush() # To get the ID
        old_to_new_q_ids[q.id] = new_q.id
        new_questions.append((q, new_q))
        
    # Duplicate logic rules and remap target_question_id
    for old_q, new_q in new_questions:
        for rule in old_q.logic_rules:
            target_id = old_to_new_q_ids.get(rule.target_question_id)
            if target_id:
                new_rule = models.LogicRule(
                    question_id=new_q.id,
                    condition=rule.condition,
                    value=rule.value,
                    target_question_id=target_id
                )
                db.add(new_rule)
                
    db.commit()
    
    return new_form

def track_form(db: Session, form_id: str, event: str) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    if event == "view":
        db_form.views += 1
    elif event == "start":
        db_form.starts += 1
    db.commit()
    return True

# --- Questions ---
def get_questions(db: Session, form_id: str) -> List[models.Question]:
    return db.query(models.Question).filter(models.Question.form_id == form_id).order_by(models.Question.order).all()

def get_question(db: Session, question_id: str) -> Optional[models.Question]:
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def create_question(db: Session, form_id: str, question: schemas.QuestionCreate) -> models.Question:
    db_question = models.Question(**question.model_dump(), form_id=form_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: str, question_update: schemas.QuestionUpdate) -> Optional[models.Question]:
    db_question = get_question(db, question_id)
    if not db_question:
        return None
    
    update_data = question_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_question, key, value)
        
    db.refresh(db_question)
    return db_question

def reorder_questions(db: Session, form_id: str, question_ids: List[str]) -> bool:
    questions = db.query(models.Question).filter(models.Question.form_id == form_id).all()
    q_map = {q.id: q for q in questions}
    for idx, q_id in enumerate(question_ids):
        if q_id in q_map:
            q_map[q_id].order = idx
    db.commit()
    return True

def delete_question(db: Session, question_id: str) -> bool:
    db_question = get_question(db, question_id)
    if not db_question:
        return False
    db.delete(db_question)
    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, question_ids: List[str]) -> bool:
    questions = db.query(models.Question).filter(models.Question.form_id == form_id).all()
    question_map = {q.id: q for q in questions}
    
    # Check if all ids provided exist in the form
    if not all(qid in question_map for qid in question_ids):
        return False
        
    for index, qid in enumerate(question_ids):
        question_map[qid].order = index
        
    db.commit()
    return True

# --- Logic Rules ---
def create_logic_rule(db: Session, question_id: str, rule: schemas.LogicRuleCreate) -> models.LogicRule:
    db_rule = models.LogicRule(**rule.model_dump(), question_id=question_id)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_logic_rule(db: Session, rule_id: str) -> bool:
    db_rule = db.query(models.LogicRule).filter(models.LogicRule.id == rule_id).first()
    if not db_rule:
        return False
    db.delete(db_rule)
    db.commit()
    return True

def update_logic_rule(db: Session, rule_id: str, update_data: schemas.LogicRuleUpdate) -> Optional[models.LogicRule]:
    db_rule = db.query(models.LogicRule).filter(models.LogicRule.id == rule_id).first()
    if not db_rule:
        return None
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(db_rule, key, value)
    db.commit()
    db.refresh(db_rule)
    return db_rule

# --- Responses ---
def create_response(db: Session, form_id: str, response: schemas.ResponseCreate) -> models.Response:
    db_response = models.Response(form_id=form_id)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    for ans in response.answers:
        db_answer = models.Answer(
            response_id=db_response.id,
            question_id=ans.question_id,
            value=ans.value
        )
        db.add(db_answer)
        
    db.commit()
    db.refresh(db_response)
    return db_response

def get_responses(db: Session, form_id: str) -> List[models.Response]:
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
    # Optimize Base64 payloads
    for response in responses:
        for answer in response.answers:
            if isinstance(answer.value, str) and answer.value.startswith("data:"):
                # Use a small placeholder
                answer.value = "[File Attached]"
    return responses

def get_answer(db: Session, answer_id: str) -> Optional[models.Answer]:
    return db.query(models.Answer).filter(models.Answer.id == answer_id).first()

def get_response(db: Session, response_id: str) -> Optional[models.Response]:
    return db.query(models.Response).filter(models.Response.id == response_id).first()
