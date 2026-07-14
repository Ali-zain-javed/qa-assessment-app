# QA Assessment App

A question/answer assessment app: admins create multiple-choice questions (single or
multi-select), users take an assessment one question at a time, and get a score at
the end. Backend is FastAPI + Postgres (SQLAlchemy), frontend is React + Vite +
Tailwind CSS.

## Project layout

```
qa-assessment-app/
├── backend/     FastAPI API + Postgres
│   ├── app/
│   │   ├── core/       config, JWT/password security, DB session, auth deps
│   │   ├── models/     SQLAlchemy models: User, Question, Attempt
│   │   ├── schemas/    Pydantic request/response schemas
│   │   ├── routers/    auth.py, questions.py, attempts.py
│   │   ├── main.py     FastAPI app + CORS
│   │   └── seed.py     creates tables + demo admin/user/questions
│   ├── requirements.txt
│   └── .env            DATABASE_URL, SECRET_KEY (not committed)
└── frontend/    React + Vite + Tailwind
    └── src/
        ├── api.js          fetch wrapper for the backend API
        ├── AuthContext.jsx JWT auth state (login/logout, current user)
        ├── App.jsx         routes + role-based route guards
        ├── pages/
        │   ├── Login.jsx
        │   ├── AdminDashboard.jsx   add/list/delete questions
        │   └── Assessment.jsx      question-by-question flow + score screen
        └── components/
            └── QuestionCard.jsx    single question card (single/multi select)
```

## How auth works

One login form for everyone (`/login`). The backend issues a JWT containing the
user's id; the user's `role` (`admin` or `user`) is stored on the `users` table and
returned alongside the token. The frontend redirects admins to `/admin` and regular
users to `/assessment`, and `ProtectedRoute` in `App.jsx` blocks the wrong role from
reaching either page.

## How scoring works

The frontend never receives correct answers for `/questions` (the user-facing
endpoint only returns question text + options). When the user finishes the last
question, the frontend POSTs all `{question_id, selected_options}` pairs to
`/attempts/submit`, and the backend computes the score by comparing the submitted
option indices against each question's stored `correct_options`. The result (and a
row in the `attempts` table) is returned to show the final score screen.

## Prerequisites

- Python 3.13 (3.14 currently lacks prebuilt wheels for some pinned deps)
- Node.js 18+
- PostgreSQL running locally, with a database + user the backend can connect to

## Backend setup

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# .env should contain:
#   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db>
#   SECRET_KEY=<random-secret>

python -m app.seed        # creates tables + demo admin/user/questions
uvicorn app.main:app --reload --port 8000
```

Demo accounts created by `seed.py`:

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@example.com  | Admin123! |
| User  | user@example.com   | User123!  |

API docs: http://localhost:8000/docs

## Frontend setup

```bash
cd frontend
npm install

# .env should contain:
#   VITE_API_URL=http://localhost:8000

npm run dev
```

App: http://localhost:5173

## API summary

| Method | Path                        | Who         | Purpose                                  |
|--------|------------------------------|-------------|-------------------------------------------|
| POST   | `/auth/login`                | anyone      | Log in, get a JWT + user profile          |
| GET    | `/auth/me`                   | logged in   | Get current user from token               |
| GET    | `/questions`                 | logged in   | List questions (no correct answers)       |
| GET    | `/admin/questions`           | admin       | List questions including correct answers  |
| POST   | `/admin/questions`           | admin       | Create a question                         |
| DELETE | `/admin/questions/{id}`      | admin       | Delete a question                         |
| POST   | `/attempts/submit`           | logged in   | Submit answers, get back score/total      |

## Notes / next steps

- Tables are created via `Base.metadata.create_all()` in `seed.py` rather than
  Alembic migrations — fine for getting started, but swap in Alembic before this
  goes anywhere near production so schema changes are tracked.
- `SECRET_KEY` in `.env` is a dev placeholder — replace it before deploying.
- There's no self-serve registration UI; new users are created via
  `POST /auth/register` (role defaults to `user`) or directly in the DB.
