import argparse, json
from pathlib import Path

def run():
    p = argparse.ArgumentParser()
    p.add_argument("--out")
    p.add_argument("--pretty", action="store_true")
    args = p.parse_args()

    items = [{
        "title": "Example Competition",
        "category": "Other",
        "eligibility": None,
        "deadline": None,
        "link": "https://example.com",
        "description": "placeholder from CI"
    }]

    Path("public").mkdir(parents=True, exist_ok=True)
    out = args.out or "public/competitions.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2 if args.pretty else None)
    print("Wrote 1 item ->", out)

if __name__ == "__main__":
    run()
