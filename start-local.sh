#!/bin/bash

echo "Starting Quant.com MVP (Local Development)..."
echo ""

# Backend data setup
DATA_DIR="Backend/data"
mkdir -p "$DATA_DIR"
for file in roadmaps.json firms.json faq.json; do
    [ -f "$DATA_DIR/$file" ] || echo "[]" > "$DATA_DIR/$file"
done

# Frontend dependencies
if [ ! -d "Frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd Frontend
    npm install
    cd ..
fi

# Python virtual environment
if [ ! -d "Backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv Backend/venv
fi

echo "Activating virtual environment..."
source Backend/venv/bin/activate

# Python dependencies
if [ -f "Backend/requirements.txt" ]; then
    pip install -r Backend/requirements.txt
fi

# Start backend
echo "Starting backend server..."
export FLASK_APP=Backend/app.py
export FLASK_ENV=development
flask run --port=5000 --no-reload &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "Starting frontend server..."
cd Frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==================================="
echo "Application is running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "==================================="
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
