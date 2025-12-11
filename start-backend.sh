cd "$(dirname "$0")"

echo "Starting Quant.com Backend (Local Development)..."
echo "------------------------------------------------"

if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed."
    exit 1
fi

DATA_DIR="Backend/data"
mkdir -p "$DATA_DIR"

for file in roadmaps.json firms.json faq.json; do
    if [ ! -f "$DATA_DIR/$file" ]; then
        echo "[]" > "$DATA_DIR/$file"
        echo "Created empty $file"
    fi
done

if [ ! -d "Backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv Backend/venv
fi

echo "Activating virtual environment..."
source Backend/venv/bin/activate

if [ -f "Backend/requirements.txt" ]; then
    echo "Checking dependencies..."
    pip install -r Backend/requirements.txt > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Warning: Dependency install had issues. Running verbose..."
        pip install -r Backend/requirements.txt
    fi
fi

echo ""
echo "Starting backend server..."
echo "------------------------------------------------"

export FLASK_APP=Backend/app.py
export FLASK_DEBUG=1

flask run --host=127.0.0.1 --port=5000