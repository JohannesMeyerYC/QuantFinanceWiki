#!/bin/bash

echo "Starting Quant.com Backend (Local Development)..."
echo ""

# Backend data setup
DATA_DIR="Backend/data"
mkdir -p "$DATA_DIR"
for file in roadmaps.json firms.json faq.json; do
    [ -f "$DATA_DIR/$file" ] || echo "[]" > "$DATA_DIR/$file"
done

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
flask run --host=0.0.0.0 --port=5000
