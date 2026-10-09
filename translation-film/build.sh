#!/bin/sh
# One command rebuilds the film from source: frames → video → poster. Silent film (no voice, no music).
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
cd "$LIB"
node core/render/readcheck.mjs "$HERE" --latin-cps 13
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --out "$HERE/out/video.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$HERE/out/video.mp4" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an "$HERE/translation-film.mp4"
node core/render/still.mjs "$HERE" 26.8 --out "$HERE/out" --prefix poster_
cp "$HERE/out/poster_26.8.jpg" "$HERE/poster.jpg"
"$LIB/.venv/bin/python" "$HERE/tools/cues.py" "$HERE"
"$LIB/.venv/bin/python" core/render/srt.py "$HERE/out/cues.json" "$HERE/translation-film.srt"
echo "done: $HERE/translation-film.mp4"
