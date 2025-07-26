@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Przejście do folderu, gdzie znajduje się skrypt
cd /d %~dp0

echo ---------------------------
echo AKTYWACJA ŚRODOWISKA
echo ---------------------------
call backend\venv\Scripts\activate.bat

echo ---------------------------
echo START BACKEND (Django)
echo ---------------------------
start cmd /k "cd backend\siteapi && python manage.py runserver"

echo ---------------------------
echo START FRONTEND (React)
echo ---------------------------
start cmd /k "cd src && npm start"

ENDLOCAL
