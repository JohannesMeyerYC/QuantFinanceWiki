from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DATA_DIR = 'data'

def load_json_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

@app.route('/api/roadmaps', methods=['GET'])
def get_roadmaps():
    roadmaps_data = load_json_file('roadmaps.json')
    
    if isinstance(roadmaps_data, dict):
        roadmaps_list = list(roadmaps_data.values())
        return jsonify(roadmaps_list)
    
    return jsonify(roadmaps_data)

@app.route('/api/roadmaps/<roadmap_id>', methods=['GET'])
def get_roadmap(roadmap_id):
    roadmaps_data = load_json_file('roadmaps.json')
    
    if isinstance(roadmaps_data, dict):
        roadmaps_list = list(roadmaps_data.values())
    else:
        roadmaps_list = roadmaps_data

    roadmap = next((r for r in roadmaps_list if r['id'] == roadmap_id), None)
    if roadmap:
        return jsonify(roadmap)
    return jsonify({'error': 'Roadmap not found'}), 404

@app.route('/api/firms', methods=['GET'])
def get_firms():
    firms = load_json_file('firms.json')
    return jsonify(firms)

@app.route('/api/faq', methods=['GET'])
def get_faq():
    faqs = load_json_file('faq.json')
    return jsonify(faqs)

if __name__ == '__main__':
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    app.run(debug=True, port=5000)