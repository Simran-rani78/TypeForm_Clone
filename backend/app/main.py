from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Typeform Clone API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Typeform Clone API"}

# --- Form Routes ---
@app.get("/api/forms", response_model=List[schemas.FormListResponse])
def get_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    forms = crud.get_forms(db, skip=skip, limit=limit)
    result = []
    for form in forms:
        response_count = crud.get_form_response_count(db, form.id)
        # Using model_dump and unpacking to combine the data
        form_data = schemas.FormResponse.model_validate(form).model_dump()
        form_data['response_count'] = response_count
        result.append(schemas.FormListResponse(**form_data))
    return result

@app.post("/api/forms", response_model=schemas.FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db=db, form=form)

@app.get("/api/forms/{form_id}", response_model=schemas.FormResponse)
def get_form(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.get("/api/forms/slug/{slug}", response_model=schemas.FormResponse)
def get_form_by_slug(slug: str, db: Session = Depends(get_db)):
    db_form = crud.get_form_by_slug(db, slug=slug)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.patch("/api/forms/{form_id}", response_model=schemas.FormResponse)
def update_form(form_id: str, form: schemas.FormUpdate, db: Session = Depends(get_db)):
    db_form = crud.update_form(db, form_id=form_id, form_update=form)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormResponse)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.duplicate_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.delete("/api/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    if not crud.delete_form(db, form_id=form_id):
        raise HTTPException(status_code=404, detail="Form not found")
    return None

@app.post("/api/forms/{form_id}/track")
def track_form(form_id: str, event: str, db: Session = Depends(get_db)):
    if event not in ["view", "start"]:
        raise HTTPException(status_code=400, detail="Invalid event type")
    if not crud.track_form(db, form_id=form_id, event=event):
        raise HTTPException(status_code=404, detail="Form not found")
    return {"status": "ok"}

# --- Question Routes ---
@app.get("/api/forms/{form_id}/questions", response_model=List[schemas.QuestionResponse])
def get_questions(form_id: str, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_questions(db, form_id=form_id)

@app.get("/api/answers/{answer_id}/file")
def get_answer_file(answer_id: str, db: Session = Depends(get_db)):
    db_answer = crud.get_answer(db, answer_id)
    if not db_answer or not isinstance(db_answer.value, str) or not db_answer.value.startswith("data:"):
        raise HTTPException(status_code=404, detail="File not found")
    return {"data": db_answer.value}

@app.post("/api/forms/{form_id}/questions", response_model=schemas.QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(form_id: str, question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.create_question(db=db, form_id=form_id, question=question)

@app.patch("/api/forms/{form_id}/questions/reorder", status_code=status.HTTP_200_OK)
def reorder_questions(form_id: str, reorder: schemas.QuestionReorder, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    if not crud.reorder_questions(db, form_id=form_id, question_ids=reorder.question_ids):
        raise HTTPException(status_code=400, detail="Invalid question IDs provided")
    return {"message": "Questions reordered successfully"}

# --- Logic Rules ---
@app.post("/api/questions/{question_id}/logic_rules", response_model=schemas.LogicRuleResponse)
def create_logic_rule(question_id: str, rule: schemas.LogicRuleCreate, db: Session = Depends(get_db)):
    return crud.create_logic_rule(db, question_id=question_id, rule=rule)

@app.delete("/api/logic_rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_logic_rule(rule_id: str, db: Session = Depends(get_db)):
    if not crud.delete_logic_rule(db, rule_id=rule_id):
        raise HTTPException(status_code=404, detail="Logic rule not found")
    return None

@app.patch("/api/logic_rules/{rule_id}", response_model=schemas.LogicRuleResponse)
def update_logic_rule(rule_id: str, rule: schemas.LogicRuleUpdate, db: Session = Depends(get_db)):
    db_rule = crud.update_logic_rule(db, rule_id=rule_id, update_data=rule)
    if not db_rule:
        raise HTTPException(status_code=404, detail="Logic rule not found")
    return db_rule

@app.patch("/api/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(question_id: str, question: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    db_question = crud.update_question(db, question_id=question_id, question_update=question)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.delete("/api/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    if not crud.delete_question(db, question_id=question_id):
        raise HTTPException(status_code=404, detail="Question not found")
    return None

# --- Response Routes ---
@app.post("/api/forms/{form_id}/responses", response_model=schemas.ResponseResponse, status_code=status.HTTP_201_CREATED)
def submit_response(form_id: str, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None or db_form.status != models.FormStatus.published:
        raise HTTPException(status_code=400, detail="Form not found or not published")
    return crud.create_response(db=db, form_id=form_id, response=response)

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.ResponseResponse])
def get_responses(form_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_form = crud.get_form(db, form_id=form_id)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_responses(db, form_id=form_id)

@app.get("/api/forms/slug/{slug}", response_model=schemas.FormResponse)
def get_form_by_slug(slug: str, db: Session = Depends(get_db)):
    db_form = crud.get_form_by_slug(db, slug=slug)
    if db_form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form


@app.post("/api/forms/{form_id}/track")
def track_form(form_id: str, event: str, db: Session = Depends(get_db)):
    if not crud.track_form(db, form_id=form_id, event=event):
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Tracked successfully"}

@app.get("/api/answers/{answer_id}/file")
def get_answer_file(answer_id: str, db: Session = Depends(get_db)):
    db_answer = crud.get_answer(db, answer_id=answer_id)
    if not db_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return {"data": db_answer.value}
