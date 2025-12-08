from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
INTERACTIONS_FILE = 'blog_interactions.json'

def load_json_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return [] if filename != 'roadmaps.json' else {}

def save_interactions(data):
    filepath = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def get_interactions():
    filepath = os.path.join(DATA_DIR, INTERACTIONS_FILE)
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

# --- Existing Routes ---

@app.route('/api/roadmaps', methods=['GET'])
def get_roadmaps():
    roadmaps_data = load_json_file('roadmaps.json')
    if isinstance(roadmaps_data, dict):
        return jsonify(list(roadmaps_data.values()))
    return jsonify(roadmaps_data)

@app.route('/api/roadmaps/<roadmap_id>', methods=['GET'])
def get_roadmap(roadmap_id):
    roadmaps_data = load_json_file('roadmaps.json')
    roadmaps_list = list(roadmaps_data.values()) if isinstance(roadmaps_data, dict) else roadmaps_data
    roadmap = next((r for r in roadmaps_list if r['id'] == roadmap_id), None)
    if roadmap: return jsonify(roadmap)
    return jsonify({'error': 'Roadmap not found'}), 404

@app.route('/api/firms', methods=['GET'])
def get_firms():
    return jsonify(load_json_file('firms.json'))

@app.route('/api/faq', methods=['GET'])
def get_faq():
    return jsonify(load_json_file('faq.json'))

# --- New Blog Routes ---

@app.route('/api/blog', methods=['GET'])
def get_blog_posts():
    posts = load_json_file('blog.json')
    interactions = get_interactions()
    
    # Merge interaction data (likes/comments count) into posts
    for post in posts:
        post_id = post['id']
        if post_id in interactions:
            post['likes'] = interactions[post_id].get('likes', 0)
            post['comment_count'] = len(interactions[post_id].get('comments', []))
        else:
            post['likes'] = 0
            post['comment_count'] = 0
            
    return jsonify(posts)

@app.route('/api/blog/<post_id>', methods=['GET'])
def get_blog_post(post_id):
    posts = load_json_file('blog.json')
    post = next((p for p in posts if p['id'] == post_id), None)
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
        
    interactions = get_interactions()
    if post_id in interactions:
        post['likes'] = interactions[post_id].get('likes', 0)
        post['comments'] = interactions[post_id].get('comments', [])
    else:
        post['likes'] = 0
        post['comments'] = []
        
    return jsonify(post)

@app.route('/api/blog/<post_id>/like', methods=['POST'])
def like_post(post_id):
    interactions = get_interactions()
    
    if post_id not in interactions:
        interactions[post_id] = {'likes': 0, 'comments': []}
    
    interactions[post_id]['likes'] += 1
    save_interactions(interactions)
    
    return jsonify({'likes': interactions[post_id]['likes']})

@app.route('/api/blog/<post_id>/unlike', methods=['POST'])
def unlike_post(post_id):
    interactions = get_interactions()
    
    if post_id in interactions and interactions[post_id]['likes'] > 0:
        interactions[post_id]['likes'] -= 1
        save_interactions(interactions)
    
    current_likes = interactions.get(post_id, {}).get('likes', 0)
    return jsonify({'likes': current_likes})

@app.route('/api/blog/<post_id>/comment', methods=['POST'])
def comment_post(post_id):
    data = request.json
    name = data.get('name', 'Anonymous')
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'Comment cannot be empty'}), 400
        
    interactions = get_interactions()
    
    if post_id not in interactions:
        interactions[post_id] = {'likes': 0, 'comments': []}
        
    new_comment = {
        'name': name,
        'text': text,
        'date': datetime.now().strftime("%Y-%m-%d")
    }
    
    interactions[post_id]['comments'].append(new_comment)
    save_interactions(interactions)
    
    return jsonify(new_comment)

@app.route('/api/resources', methods=['GET'])
def get_resources():
    resources = load_json_file('resources.json')
    return jsonify(resources)

if __name__ == '__main__':
    DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)