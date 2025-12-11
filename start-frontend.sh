cd "$(dirname "$0")"

echo "Starting Quant.com Frontend (Local Development)..."
echo "--------------------------------------------------"

if [ ! -d "Frontend" ]; then
    echo "Error: 'Frontend' folder not found in $(pwd)"
    exit 1
fi

cd Frontend || exit

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Targeting Backend: http://127.0.0.1:5000"
echo "--------------------------------------------------"

export VITE_API_URL="http://127.0.0.1:5000"

npm run dev