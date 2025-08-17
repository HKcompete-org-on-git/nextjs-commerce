import argparse, json, re, datetime as dt
from pathlib import Path

import requests, certifi
from bs4 import BeautifulSoup

# ---------- seeds: start with a few good sources, add more anytime ----------
SEED_URLS = [
    "https://www.hkage.edu.hk/articles/competitions",
    "https://www.hksciencefair.org.hk/",
    "https://www.cityu.edu.hk/csci/local-school-outreach/cityuhk-science-video-competition-2025",
    "https://www.atec.edu.hk/stemcentre/competition-2025/",
]

ALLOWED_CATS = {"STEM","Arts","Sports","Business","Language","Music","Debate","Other"}
_BAD_TITLE = re.compile(r"^\s*(%PDF|about:blank|untitled)\b", re.I)
_ASCII_OK  = re.compile(r"[A-Za-z\u00C0-\u024F\u2E80-\u9FFF]")  # Latin + CJK
DATE_RE    = re.compile(r"(?:截止|deadline|due|apply by|enrol by|enroll by)\D{0,24}?(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})", re.I)
ISO_RE     = re.compile(r"(20[2-9]\d)[-/\.](0?[1-9]|1[0-2])[-/\.](0?[1-9]|[12]\d|3[01])")

session = requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127 Safari/537.36"})
session.verify = certifi.where()
TIMEOUT = 15

def looks_like_pdf(url, resp) -> bool:
    ct = (resp.headers.get("content-type","").lower())
    if "application/pdf" in ct: return True
    if url.lower().endswith(".pdf"): return True
    try:
        if resp.text.lstrip().startswith("%PDF"): return True
    except Exception:
        pass
    return False

def sanitize(s):
    if s is None: return None
    s = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', ' ', str(s))
    return re.sub(r'\s+', ' ', s).strip()

def validate_item(d: dict) -> bool:
    title = (d.get("title") or "").strip()
    if not title or len(title) < 6 or _BAD_TITLE.search(title): return False
    if not _ASCII_OK.search(title): return False
    if d.get("category") not in ALLOWED_CATS: d["category"] = "Other"
    link = (d.get("link") or "").strip()
    if not (link.startswith("http://") or link.startswith("https://")): return False
    desc = (d.get("description") or "").strip()
    if desc and len(desc.split()) < 3: d["description"] = None
    return True

def best_meta(soup):
    def m(p):
        return soup.find("meta", attrs={"property": p}) or soup.find("meta", attrs={"name": p})
    ogt = m("og:title"); ogd = m("og:description")
    title = (ogt.get("content") if ogt and ogt.get("content") else None) \
        or (soup.title.string.strip() if soup.title and soup.title.string else None) \
        or (soup.find("h1").get_text(strip=True) if soup.find("h1") else None)
    desc = (ogd.get("content") if ogd and ogd.get("content") else None)
    return title, desc

def find_apply_link(soup):
    for a in soup.find_all("a"):
        t = (a.get_text(" ") or "").strip().lower()
        if re.search(r"\b(apply|register|sign up|報名|註冊)\b", t):
            href = a.get("href") or ""
            if href and not href.startswith("#"):
                return requests.compat.urljoin("about:blank", href)  # we’ll fix base later
    return None

def categorize(text_lower: str) -> str:
    cats = {
        "STEM": ["science","stem","robot","coding","math","physics","chemistry","biology","資訊","科學","機械","數學"],
        "Arts": ["art","drawing","painting","design","藝術","設計"],
        "Sports": ["tournament","sports","league","cup","championship","race","體育","賽事","比賽"],
        "Business": ["business","entrepreneur","startup","finance","marketing","商業","創業"],
        "Language": ["english","chinese","putonghua","essay","writing","語文","普通話","寫作","英文","中文"],
        "Music": ["music","piano","violin","choir","orchestra","音樂","鋼琴","小提琴","合唱"],
        "Debate": ["debate","public speaking","forensics","motion","辯論","演講"],
    }
    for k, kws in cats.items():
        if any(kw in text_lower for kw in kws):
            return k
    return "Other"

def parse_one(url: str):
    try:
        r = session.get(url, timeout=TIMEOUT)
        r.raise_for_status()
    except Exception as e:
        print(f"[HTTP] {url} -> {e}"); return None

    if looks_like_pdf(url, r):
        print(f"[skip PDF] {url}"); return None

    soup = BeautifulSoup(r.text, "html.parser")
    mt, md = best_meta(soup)
    text = soup.get_text(separator="\n", strip=True)
    apply_link = find_apply_link(soup)
    if apply_link and apply_link.startswith("about:blank"):
        apply_link = requests.compat.urljoin(url, apply_link.replace("about:blank",""))

    # deadline guess
    deadline = None
    m = DATE_RE.search(text)
    if m:
        d = m.group(1)
        if re.match(r"\d{4}", d):
            y, mm, dd = re.split(r"[/\-]", d)
        else:
            dd, mm, y = re.split(r"[-/]", d)
        deadline = f"{int(y):04d}-{int(mm):02d}-{int(dd):02d}"
    else:
        m2 = ISO_RE.search(text)
        if m2:
            yyyy, mm, dd = m2.group(1), m2.group(2).zfill(2), m2.group(3).zfill(2)
            deadline = f"{yyyy}-{mm}-{dd}"

    desc = md or "\n".join(text.splitlines()[:40])[:1000]
    title = mt or (text.split("\n")[0][:120] if text else "Competition")
    cat = categorize((text or "").lower())

    item = {
        "title": sanitize(title),
        "category": sanitize(cat) or "Other",
        "eligibility": None,
        "deadline": sanitize(deadline),
        "link": sanitize(apply_link or url),
        "description": sanitize(desc),
    }
    if not validate_item(item):
        print(f"[reject] {url} -> {item.get('title')!r}")
        return None
    return item

def dedupe_by_link(items):
    out = {}
    for it in items:
        link = (it.get("link") or "").strip()
        if not link: continue
        cur = out.get(link)
        if not cur:
            out[link] = it
        else:
            score = lambda x: sum(bool(x.get(k)) for k in ("title","deadline","category","description"))
            if score(it) > score(cur):
                out[link] = it
    return list(out.values())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="public/competitions.json")
    ap.add_argument("--pretty", action="store_true")
    args = ap.parse_args()

    items = []
    for u in SEED_URLS:
        print("[page]", u)
        it = parse_one(u)
        if it: items.append(it)

    items = dedupe_by_link(items)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2 if args.pretty else None)
    print(f"[export] wrote {len(items)} items -> {args.out}")

if __name__ == "__main__":
    main()
