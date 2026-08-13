import random
from app.database import SessionLocal, engine
from app import models, schemas, crud

def seed():
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have forms
    existing_forms = crud.get_forms(db)
    if len(existing_forms) > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database...")
    
    # Form 1: Customer Feedback (Published)
    form1 = crud.create_form(db, schemas.FormCreate(title="Customer Satisfaction Survey"))
    crud.update_form(db, form1.id, schemas.FormUpdate(status=models.FormStatus.published))
    # Keep the original slug or set a specific one if needed, we'll keep the generated one
    
    # Questions for Form 1
    q1 = crud.create_question(db, form1.id, schemas.QuestionCreate(
        type=models.QuestionType.rating,
        title="How would you rate your experience with us?",
        is_required=True,
        order=0,
        options={"steps": 5}
    ))
    
    q2 = crud.create_question(db, form1.id, schemas.QuestionCreate(
        type=models.QuestionType.long_text,
        title="What could we improve?",
        is_required=False,
        order=1
    ))
    
    q3 = crud.create_question(db, form1.id, schemas.QuestionCreate(
        type=models.QuestionType.yes_no,
        title="Would you recommend us to a friend?",
        is_required=True,
        order=2
    ))

    # Seed Responses for Form 1
    crud.create_response(db, form1.id, schemas.ResponseCreate(
        answers=[
            schemas.AnswerBase(question_id=q1.id, value=5),
            schemas.AnswerBase(question_id=q2.id, value="Everything was perfect!"),
            schemas.AnswerBase(question_id=q3.id, value=True)
        ]
    ))
    
    crud.create_response(db, form1.id, schemas.ResponseCreate(
        answers=[
            schemas.AnswerBase(question_id=q1.id, value=3),
            schemas.AnswerBase(question_id=q2.id, value="Shipping was a bit slow."),
            schemas.AnswerBase(question_id=q3.id, value=False)
        ]
    ))

    # Form 2: Event Registration (Draft)
    form2 = crud.create_form(db, schemas.FormCreate(title="Annual Tech Conference 2026"))
    
    crud.create_question(db, form2.id, schemas.QuestionCreate(
        type=models.QuestionType.short_text,
        title="What is your full name?",
        is_required=True,
        order=0
    ))
    
    crud.create_question(db, form2.id, schemas.QuestionCreate(
        type=models.QuestionType.email,
        title="What is your email address?",
        is_required=True,
        order=1
    ))
    
    crud.create_question(db, form2.id, schemas.QuestionCreate(
        type=models.QuestionType.multiple_choice,
        title="Which track are you most interested in?",
        is_required=True,
        order=2,
        options={"choices": ["Frontend", "Backend", "AI / ML", "Design"]}
    ))
    
    print("Database seeding completed.")
    db.close()

if __name__ == "__main__":
    seed()
