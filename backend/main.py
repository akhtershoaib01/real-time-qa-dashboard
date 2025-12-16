from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory storage
questions = []


# Models


class QuestionCreate(BaseModel):
    message: str


# Routes


@app.get("/")
def home():
    return {"message": "Q&A Backend Running"}

# 1️ Submit a question
@app.post("/questions")
def create_question(data: QuestionCreate):
    if data.message.strip() == "":
        return {"error": "Question cannot be empty"}

    question = {
        "id": len(questions) + 1,
        "message": data.message,
        "status": "Pending",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    questions.append(question)
    return question

# 2️ Get all questions
@app.get("/questions")
def get_questions():
    return questions

# 3️ Mark question as answered (admin action)
@app.put("/questions/{question_id}/answer")
def mark_question_answered(question_id: int):
    for q in questions:
        if q["id"] == question_id:
            q["status"] = "Answered"
            return q

    return {"error": "Question not found"}

# 4️ Escalate a question
@app.put("/questions/{question_id}/escalate")
def escalate_question(question_id: int):
    for q in questions:
        if q["id"] == question_id:
            if q["status"] != "Answered":
                q["status"] = "Escalated"
            return q

    return {"error": "Question not found"}


