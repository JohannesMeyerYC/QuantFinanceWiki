@echo off
echo Starting Quant.com MVP...
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

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

echo Building and starting containers...
docker-compose up --build

echo.
echo Application stopped.
pause
```

## FILE 6: .dockerignore
```
node_modules
venv
__pycache__
*.pyc
.git
.env
.DS_Store
dist
build