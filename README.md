# ExamOS Backend

MERN backend for an online examination platform.

## Features

- Candidate registration/login
- Admin authentication
- JWT authorization
- Role-based access control
- Question bank CRUD
- Exam creation and assignment
- Exam start
- Answer submission and automatic evaluation
- Correct/wrong/skipped calculation
- Negative marking support
- Pass/fail calculation
- Candidate results
- Admin dashboard
- Basic analytics

## Setup

```bash
npm install
```

Create `.env` from `.env.example`.

Start MongoDB, then:

```bash
npm run dev
```

Server:

`http://localhost:5000`

## Create first admin

```bash
node seedAdmin.js
```

Admin credentials:

- Email: admin@examos.com
- Password: Admin@123

Change the password after testing.

## Main API routes

### Auth

POST `/api/auth/register`

POST `/api/auth/login`

GET `/api/auth/me`

### Questions

GET `/api/questions`

GET `/api/questions/:id`

POST `/api/questions` (admin)

PUT `/api/questions/:id` (admin)

DELETE `/api/questions/:id` (admin)

### Exams

GET `/api/exams`

GET `/api/exams/:id`

POST `/api/exams` (admin)

PUT `/api/exams/:id` (admin)

DELETE `/api/exams/:id` (admin)

POST `/api/exams/:id/start` (candidate)

### Attempts / Results

POST `/api/attempts/:attemptId/submit` (candidate)

GET `/api/attempts/my` (candidate)

GET `/api/attempts/:id`

GET `/api/attempts` (admin)

### Admin

GET `/api/admin/dashboard`

GET `/api/admin/candidates`

GET `/api/admin/analytics`

## Important

For protected routes send:

`Authorization: Bearer YOUR_JWT_TOKEN`

Never send the real `correctAnswer` to the candidate during an active exam. The backend only returns question options in the exam response.

Question IDs used while creating an exam must be real MongoDB ObjectIds returned from the question creation API. Do not send placeholder strings such as `PUT_QUESTION_ID_HERE`.
