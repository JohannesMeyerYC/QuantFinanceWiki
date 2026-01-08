# update_slugs_simple.py
import json
import re

def make_slug(text, max_words=10):
    """Generate URL-friendly slug from text."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    words = text.split('-')
    words = words[:max_words]
    slug = "-".join(words)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip('-')

def generate_question_slug(question):
    """Generate slug from first 5 words of question and firm name."""
    question_text = question.get('question', '')
    firm = question.get('firm', '').strip()
    
    # Extract first 5 words
    words = question_text.split()[:5]
    first_five = ' '.join(words)
    
    # Generate base slug from first 5 words
    base_slug = make_slug(first_five)
    
    # Add firm slug
    if firm:
        firm_slug = make_slug(firm[:30])
        slug = f"{base_slug}-{firm_slug}"
    else:
        slug = base_slug
    
    # Ensure slug isn't too long
    if len(slug) > 100:
        slug = slug[:100]
    
    return slug

def update_all_slugs():
    # File is in the same directory
    data_file = 'interview_questions.json'
    
    print(f"Loading {data_file}...")
    with open(data_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    print(f"Loaded {len(questions)} questions")
    
    seen_slugs = set()
    updated_count = 0
    
    for question in questions:
        old_slug = question.get('slug', '')
        new_slug = generate_question_slug(question)
        
        # Ensure uniqueness
        slug = new_slug
        counter = 1
        while slug in seen_slugs:
            slug = f"{new_slug}-{counter}"
            counter += 1
        
        if slug != old_slug:
            question['slug'] = slug
            seen_slugs.add(slug)
            updated_count += 1
            print(f"Updated Q{question.get('id')}: {slug}")
        else:
            print(f"Skipped Q{question.get('id')} (already has slug): {old_slug}")
    
    # Save back
    print(f"\nSaving {updated_count} updated questions...")
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2)
    
    print(f"\n✅ Updated {updated_count} questions with new slugs")
    print(f"📊 Total questions: {len(questions)}")

if __name__ == "__main__":
    update_all_slugs()