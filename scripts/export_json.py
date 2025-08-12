# export_json.py — dump clean competitions to a JSON file
import os, json, re
from db import SessionLocal, Competition, init_db

# 👇 change this if your frontend lives somewhere else
FRONTEND_PUBLIC = r"D:\UserData\Desktop\CHanging it\hkcompete front end\public"
OUT_FILENAME = "competitions.json"

_bad_title = re.compile(r"^\s*(%PDF|about:blank|untitled|got here)\b", re.I)
_ascii_ok = re.compile(r"[A-Za-z\u00C0-\u024F\u2E80-\u9FFF]")  # Latin + CJK

def _row_ok(c) -> bool:
    t = (c.title or "").strip()
    if not t or len(t) < 6: return False
    if _bad_title.search(t): return False
    if not _ascii_ok.search(t): return False
    link = (c.link or "").strip()
    if not link.startswith(("http://","https://")): return False
    return True

def export_json(out_dir: str):
    init_db()
    db = SessionLocal()
    try:
        rows = db.query(Competition).order_by(Competition.id.desc()).all()
        rows = [c for c in rows if _row_ok(c)]
        data = [{
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "eligibility": c.eligibility,
            "deadline": c.deadline,
            "link": c.link,
            "description": c.description,
        } for c in rows]
    finally:
        db.close()

    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, OUT_FILENAME)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[export] wrote {out_path} ({len(data)} items)")

if __name__ == "__main__":
    export_json(FRONTEND_PUBLIC)