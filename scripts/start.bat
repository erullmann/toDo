@echo off

::Auto start web server and database

START CMD /C "C:/mongodb/bin/mongod.exe"
START CMD /C "node C:/Users/Henk/Documents/GitHub/toDo/scripts/web-server.js"