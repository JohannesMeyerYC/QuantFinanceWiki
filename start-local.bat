@echo off
echo Starting Quant.com MVP (Local Development)...
echo.

if not exist "data" (
    echo Creating data directory...
    mkdir data
)

if not exist "data\roadmaps.json" (
    echo Creating empty roadmaps.json...
    echo [] > data\roadmaps.json
)

if not exist "data\firms.json" (
    echo Creating empty firms.json...
    echo [] > data\firms.json
)

if not exist "data\faq.json" (
    echo Creating empty faq.json...
    echo [] > data\faq.json
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting backend server...
start /B python app.py

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start /B npm run dev

echo.
echo ===================================
echo Application is running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ===================================
echo.
echo Press Ctrl+C to stop servers
echo.

pause