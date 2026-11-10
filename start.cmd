@echo off
cd /d "%~dp0"
echo Open http://localhost:8004
python -m http.server 8004 --bind 127.0.0.1 --directory docs
pause
