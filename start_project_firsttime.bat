@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

cd /d %~dp0

echo ---------------------------
echo TWORZENIE ŚRODOWISKA VENV (jeśli nie istnieje)
echo ---------------------------
IF NOT EXIST backend\venv (
    python -m venv backend\venv
)

echo ---------------------------
echo AKTYWACJA ŚRODOWISKA
echo ---------------------------
call backend\venv\Scripts\activate.bat

echo ---------------------------
echo INSTALACJA DEPENDENCJI (pip)
echo ---------------------------
pip install --upgrade pip
pip install -r backend\requirements.txt

echo ---------------------------
echo START BACKEND (Django)
echo ---------------------------
start cmd /k "cd backend\siteapi && python manage.py runserver"

echo ---------------------------
echo START FRONTEND (React)
echo ---------------------------
start cmd /k "cd src && npm install && npm start"

ENDLOCAL
