@echo off
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%backend\.venv\Scripts\python.exe" (
  echo Backend virtual environment was not found.
  echo Run the backend setup instructions in README.md first.
  pause
  exit /b 1
)
if not exist "%ROOT%frontend\node_modules" (
  echo Frontend dependencies were not found.
  echo Open a terminal in the frontend folder and run: npm install
  pause
  exit /b 1
)

start "St Isidore API" cmd /k "cd /d ""%ROOT%backend"" && ""%ROOT%backend\.venv\Scripts\python.exe"" -m uvicorn app.main:app --reload"
start "St Isidore Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
endlocal
