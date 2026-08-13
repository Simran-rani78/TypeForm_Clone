# Typeform Clone

A full-stack functional clone of the Typeform application, replicating its design, user experience, and core form-building and form-filling workflows.

## Features

*   **Form Management Dashboard**: Create, rename, edit, publish/unpublish, and delete forms.
*   **Form Builder**: Drag-and-drop question reordering, inline editing, and a live preview. Supports 8 question types:
    *   Short Text, Long Text, Multiple Choice, Dropdown, Email, Number, Yes/No, Rating.
*   **Respondent Flow**: The signature "Typeform Experience" – full-screen, one-question-at-a-time UI with smooth Framer Motion transitions and full keyboard navigation (Enter/Arrows).
*   **Results Dashboard**: View responses in a clean table format and export data to CSV.
*   **Shareable Links**: Published forms generate unique, shareable slugs (e.g., `/form/[slug]`).

## Architecture Overview

*   **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Framer Motion (for animations), `@dnd-kit` (for drag-and-drop).
*   **Backend**: FastAPI (Python), SQLAlchemy (ORM), Pydantic (validation).
*   **Database**: SQLite (`typeform_clone.db`).

## Database Schema

*   **Form**: `id`, `title`, `slug`, `status` (draft/published), `created_at`, `updated_at`, `published_at`
*   **Question**: `id`, `form_id`, `type`, `title`, `description`, `is_required`, `order`, `options` (JSON for choices/steps)
*   **Response**: `id`, `form_id`, `submitted_at`
*   **Answer**: `id`, `response_id`, `question_id`, `value` (JSON to handle strings, numbers, booleans natively)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt # (or install dependencies manually if not present: fastapi uvicorn sqlalchemy pydantic python-multipart shortuuid)

# Seed the database with sample data
python seed.py

# Run the backend server
uvicorn app.main:app --reload
```
The backend will run on `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file in the frontend directory (optional for local dev as it defaults to localhost:8000)
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local

# Run the frontend server
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Assumptions & Placeholders
*   **Authentication**: Skipped as per the assignment instructions. All creators are assumed to be a single default logged-in user.
*   **Form Slugs**: A shortuuid slug is generated for published forms to keep URLs clean and shareable.
*   **Mocked Sections**: To match the Typeform visual experience perfectly as requested, several high-fidelity placeholder UIs were created (e.g., the "Create with AI" empty state, Automations tab, Smart Insights, etc.) instead of building complex out-of-scope backend functionality.
