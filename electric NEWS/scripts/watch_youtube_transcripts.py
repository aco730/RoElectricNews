import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRANSCRIPT_DIR = f"{ROOT}/transcripturi-youtube"
MANIFEST = f"{TRANSCRIPT_DIR}/.processed-manifest.json"

def main():
    os.makedirs(TRANSCRIPT_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}
    files = sorted(f for f in os.listdir(TRANSCRIPT_DIR) if f.lower().endswith(".txt"))
    new_files = [f for f in files if f not in manifest]

    if not new_files:
        print("Niciun fișier nou de procesat.")
        return

    print(f"{len(new_files)} fișier(e) nou(i) găsit(e):\n")
    for f in new_files:
        path = f"{TRANSCRIPT_DIR}/{f}"
        content = open(path, encoding="utf-8").read().strip()
        lines = content.split("\n")
        url = None
        if lines and lines[0].strip().startswith("http"):
            url = lines[0].strip()
            transcript = "\n".join(lines[1:]).strip()
        else:
            transcript = content
        print(f"=== {f} ===")
        print(f"URL: {url or '(niciunul — va fi conținut propriu)'}")
        print(f"Lungime transcript: {len(transcript)} caractere")
        print(transcript[:300] + ("..." if len(transcript) > 300 else ""))
        print()

if __name__ == "__main__":
    main()
