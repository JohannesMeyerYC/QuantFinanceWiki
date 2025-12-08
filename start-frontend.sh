#!/bin/bash

echo "Starting Quant.com Frontend (Local Development)..."
echo ""

# Frontend dependencies
if [ ! -d "Frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd Frontend
    npm install
    cd ..
fi

# Start frontend
echo "Starting frontend server..."
cd Frontend
npm run dev -- --host 0.0.0.0
