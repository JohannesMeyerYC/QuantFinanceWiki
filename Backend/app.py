from flask import Flask, jsonify, request, send_from_directory, Response, make_response
from flask_cors import CORS
from flask_compress import Compress
import json
import os
import threading
import logging
from functools import wraps
from datetime import datetime, date
import html
from urllib.parse import urljoin, quote
import re
import unidecode

ENV = os.environ.get('FLASK_ENV', 'production')
IS_DEV = ENV == 'development'

class Config:
    BASE_URL = "http://localhost:5000" if IS_DEV else "https://QuantFinanceWiki.com"
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    INTERACTIONS_FILE = 'blog_interactions.json'

app = Flask(__name__)
Compress(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

interaction_lock = threading.Lock()
_file_cache = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_file_path(filename):
    return os.path.join(Config.DATA_DIR, os.path.basename(filename))

def make_slug(text, max_words=10):
    """Generate URL-friendly slug from text."""
    if not text:
        return ""
    text = unidecode.unidecode(text)
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    words = text.split('-')
    words = words[:max_words]
    slug = "-".join(words)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip('-')
    return slug

def update_questions_with_slugs():
    data_dir = 'data'
    questions_file = os.path.join(data_dir, 'interview_questions.json')
    
    with open(questions_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    updated = False
    for i, question in enumerate(questions):
        if 'slug' not in question or not question['slug']:
            question_text = question.get('question', '')
            if question_text:
                base_slug = make_slug(question_text[:80])
                if base_slug:
                    question['slug'] = f"{base_slug}-q{question.get('id', i+1)}"
                    updated = True
                    print(f"Added slug to question {question.get('id')}: {question['slug']}")
    
    if updated:
        backup_file = os.path.join(data_dir, 'interview_questions_backup.json')
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2)
        
        with open(questions_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2)
        print(f"Updated {len(questions)} questions. Backup saved to {backup_file}")
    else:
        print("No updates needed - all questions already have slugs.")

def load_json_safe(filename, default=None):
    if default is None:
        default = []
    
    filepath = get_file_path(filename)
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filename}")
        return default
        
    try:
        stat = os.stat(filepath)
        mtime = stat.st_mtime
        
        if filename in _file_cache:
            cache_mtime, cache_data = _file_cache[filename]
            if cache_mtime == mtime:
                return cache_data

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            _file_cache[filename] = (mtime, data)
            return data
    except Exception as e:
        logger.error(f"Error reading {filename}: {e}")
        return default

def save_json_safe(filename, data):
    filepath = get_file_path(filename)
    tmp_path = filepath + '.tmp'
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        os.replace(tmp_path, filepath)
        
        stat = os.stat(filepath)
        _file_cache[filename] = (stat.st_mtime, data)
    except Exception as e:
        logger.error(f"Error saving {filename}: {e}")
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise

def handle_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Server Error: {e}", exc_info=True)
            return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    return decorated_function

@app.route('/robots.txt')
def robots_txt():
    lines = [
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {Config.BASE_URL}/sitemap.xml"
    ]
    return Response("\n".join(lines), mimetype="text/plain")

@app.route('/sitemap.xml')
def sitemap_xml():
    MAX_URLS = 50000
    MAX_BYTES = 49 * 1024 * 1024
    
    SERVER_START_TIME = datetime.utcnow().date().isoformat()
    base_url = Config.BASE_URL.replace("http://", "https://").rstrip('/')
    
    xml_header = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    current_byte_count = sum(len(x.encode('utf-8')) for x in xml_header)
    url_count = 0
    seen_urls = set()
    xml_body = []
    
    def add_entry(path_suffix, lastmod=None, priority='0.5', changefreq='monthly'):
        nonlocal url_count, current_byte_count
        
        if url_count >= MAX_URLS: return
        if current_byte_count >= MAX_BYTES: return

        clean_path = '/' + path_suffix.lstrip('/')
        safe_path = quote(clean_path, safe='/')
        full_url = f"{base_url}{safe_path}"

        if full_url in seen_urls: return
        seen_urls.add(full_url)

        final_date = SERVER_START_TIME 
        if lastmod:
            try:
                if isinstance(lastmod, str):
                    parsed_date = datetime.fromisoformat(lastmod.replace('Z', '+00:00')).date()
                elif isinstance(lastmod, (datetime, date)):
                    parsed_date = lastmod if isinstance(lastmod, date) else lastmod.date()
                else:
                    parsed_date = datetime.utcnow().date()
                
                today = datetime.utcnow().date()
                if parsed_date > today:
                    parsed_date = today
                
                final_date = parsed_date.isoformat()
            except ValueError:
                pass

        loc_xml = html.escape(full_url)
        entry = (
            f"  <url>\n"
            f"    <loc>{loc_xml}</loc>\n"
            f"    <lastmod>{final_date}</lastmod>\n"
            f"    <changefreq>{html.escape(str(changefreq))}</changefreq>\n"
            f"    <priority>{html.escape(str(priority))}</priority>\n"
            f"  </url>"
        )
        
        entry_bytes = len(entry.encode('utf-8'))
        if current_byte_count + entry_bytes > MAX_BYTES:
            logger.warning("Sitemap size limit approaching. Truncating.")
            return

        xml_body.append(entry)
        current_byte_count += entry_bytes
        url_count += 1

    statics = [
        ('/', '1.0', 'daily'),
        ('/roadmaps', '0.9', 'weekly'),
        ('/blog', '0.9', 'daily'),
        ('/firms', '0.8', 'weekly'),
        ('/resources', '0.7', 'monthly'),
        ('/faq', '0.5', 'monthly')
    ]
    for path, prio, freq in statics:
        add_entry(path, lastmod=SERVER_START_TIME, priority=prio, changefreq=freq)

    posts = load_json_safe('blog.json')
    if isinstance(posts, list):
        for post in posts:
            if post.get('id'):
                add_entry(f"/blog/{post['id']}", lastmod=post.get('date'), priority='0.8', changefreq='monthly')

    roadmaps = load_json_safe('roadmaps.json')
    r_list = list(roadmaps.values()) if isinstance(roadmaps, dict) else roadmaps
    if isinstance(r_list, list):
        for r in r_list:
            if r.get('id'):
                add_entry(f"/roadmaps/{r['id']}", lastmod=SERVER_START_TIME, priority='0.9', changefreq='weekly')

    firms = load_json_safe('firms.json')
    f_list = list(firms.values()) if isinstance(firms, dict) else firms
    if isinstance(f_list, list):
        for f in f_list:
            if f.get('id'):
                add_entry(f"/firms/{f['id']}", lastmod=SERVER_START_TIME, priority='0.7', changefreq='monthly')
    questions = load_json_safe('interview_questions.json')
    if isinstance(questions, list):
        add_entry("/interview-questions", lastmod=SERVER_START_TIME, priority='0.9', changefreq='weekly')
                
    full_content = "\n".join(xml_header + xml_body + ['</urlset>'])
    resp = Response(full_content, mimetype="application/xml")
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    resp.headers['X-Robots-Tag'] = 'noarchive'
    return resp

@app.route('/api/health', methods=['GET'])
@handle_errors
def health_check():
    data_dir_ok = os.path.exists(Config.DATA_DIR)
    return jsonify({
        'status': 'ok' if data_dir_ok else 'error',
        'environment': ENV,
        'data_dir_exists': data_dir_ok,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })
    
@app.route('/api/early-career', methods=['GET'])
@handle_errors
def get_early_career():
    resp = make_response(jsonify(load_json_safe('early_career.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/roadmaps', methods=['GET'])
@handle_errors
def get_roadmaps():
    data = load_json_safe('roadmaps.json')
    if isinstance(data, dict):
        data = list(data.values())
    resp = make_response(jsonify(data))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/roadmaps/<roadmap_id>', methods=['GET'])
@handle_errors
def get_roadmap(roadmap_id):
    data = load_json_safe('roadmaps.json')
    data_list = list(data.values()) if isinstance(data, dict) else data
    item = next((r for r in data_list if str(r.get('id')) == str(roadmap_id)), None)
    if item:
        resp = make_response(jsonify(item))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Roadmap not found'}), 404

@app.route('/api/firms', methods=['GET'])
@handle_errors
def get_firms():
    resp = make_response(jsonify(load_json_safe('firms.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/faq', methods=['GET'])
@handle_errors
def get_faq():
    resp = make_response(jsonify(load_json_safe('faq.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/resources', methods=['GET'])
@handle_errors
def get_resources():
    resp = make_response(jsonify(load_json_safe('resources.json')))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/blog', methods=['GET'])
@handle_errors
def get_blog_posts():
    posts = load_json_safe('blog.json')
    interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
    for post in posts:
        pid = str(post.get('id'))
        post['likes'] = interactions.get(pid, {}).get('likes', 0)
    return jsonify(posts)

@app.route('/api/blog/<identifier>', methods=['GET'])
@handle_errors
def get_blog_post(identifier):
    posts = load_json_safe('blog.json')
    
    post = next(
        (p for p in posts if str(p.get('id')) == str(identifier) or p.get('slug') == identifier),
        None
    )
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
    post['likes'] = interactions.get(str(post['id']), {}).get('likes', 0)

    return jsonify(post)


@app.route('/api/blog/<post_id>/like', methods=['POST'])
@handle_errors
def like_post(post_id):
    post_id = str(post_id)
    with interaction_lock:
        interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
        if post_id not in interactions:
            interactions[post_id] = {'likes': 0}
        interactions[post_id]['likes'] += 1
        save_json_safe(Config.INTERACTIONS_FILE, interactions)
        new_count = interactions[post_id]['likes']
    return jsonify({'likes': new_count})

@app.route('/api/blog/<post_id>/unlike', methods=['POST'])
@handle_errors
def unlike_post(post_id):
    post_id = str(post_id)
    with interaction_lock:
        interactions = load_json_safe(Config.INTERACTIONS_FILE, default={})
        current_likes = 0
        if post_id in interactions:
            if interactions[post_id]['likes'] > 0:
                interactions[post_id]['likes'] -= 1
                save_json_safe(Config.INTERACTIONS_FILE, interactions)
            current_likes = interactions[post_id]['likes']
    return jsonify({'likes': current_likes})

@app.route('/api/interview-questions', methods=['GET'])
@handle_errors
def get_interview_questions():
    data = load_json_safe('interview_questions.json')
    resp = make_response(jsonify(data))
    resp.headers['Cache-Control'] = 'public, max-age=3600'
    return resp

@app.route('/api/interview-questions/<slug>', methods=['GET'])
@handle_errors
def get_interview_question(slug):
    data = load_json_safe('interview_questions.json')
    question = next((q for q in data if q.get('slug') == slug), None)
    if question:
        resp = make_response(jsonify(question))
        resp.headers['Cache-Control'] = 'public, max-age=3600'
        return resp
    return jsonify({'error': 'Question not found'}), 404

@app.route('/')
def index():
    return {"status": "online", "message": "QFW Backend is running", "env": ENV}, 200

if __name__ == '__main__':
    update_questions_with_slugs()
    if not os.path.exists(Config.DATA_DIR):
        os.makedirs(Config.DATA_DIR)
        print(f"Created data directory at {Config.DATA_DIR}")

    port = int(os.environ.get("PORT", 5000))
        
    if IS_DEV:
        print(f"Starting in DEVELOPMENT mode on http://localhost:{port}")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print(f"Starting in PRODUCTION mode (Manual Run) on port {port}")
        app.run(host="0.0.0.0", port=port, debug=False)