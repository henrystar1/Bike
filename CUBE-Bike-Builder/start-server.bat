@echo off
title CUBE Nuroad Bike Builder 3D
echo Starte lokalen Webserver auf http://localhost:8000 ...
start "" http://localhost:8000
python -m http.server 8000
