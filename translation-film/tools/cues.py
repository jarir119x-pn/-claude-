# Pull the figure captions out of film.js (CAPS) into cues.json for core/render/srt.py.
import json, re, sys, pathlib
here = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
src = (here / 'film.js').read_text(encoding='utf-8')
block = src[src.index('const CAPS = ['):src.index('];', src.index('const CAPS = ['))]
cues = [{'t0': float(a), 't1': float(b), 'text': c}
        for a, b, c in re.findall(r"t0: ([\d.]+), t1: ([\d.]+), text: '([^']+)'", block)]
(here / 'out').mkdir(exist_ok=True)
(here / 'out' / 'cues.json').write_text(json.dumps(cues, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(cues), 'cues')
