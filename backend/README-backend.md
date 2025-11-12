Django backend for TalentTrack (API) with JWT auth (SimpleJWT)
-------------------------------------------------------------

1. Create virtualenv and install dependencies:
   python -m venv venv
   source venv/bin/activate    # Windows: venv\Scripts\activate
   pip install -r requirements.txt

2. Configure PostgreSQL and environment variables:
   - Copy .env.example to .env and edit DB credentials.
   - Make sure PostgreSQL is running and the user/database exist, or create them.
   Example to create DB/user (psql):
     CREATE DATABASE talenttrack_db;
     CREATE USER talenttrack_user WITH PASSWORD 'changeme';
     GRANT ALL PRIVILEGES ON DATABASE talenttrack_db TO talenttrack_user;

3. Run migrations and start server:
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser  # optional
   python manage.py runserver

Auth endpoints:
- POST /api/auth/register/   -> { username, email, password, first_name?, last_name? }
- POST /api/auth/login/      -> { username, password }  returns access and refresh tokens
- POST /api/auth/refresh/    -> { refresh } returns new access token
- GET  /api/auth/profile/    -> returns user info (requires Authorization: Bearer <access_token>)
