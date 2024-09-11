#!/bin/sh
FRONTEND_DIR="../frontend"
BACKEND_DIR="backend"
cd "$BACKEND_DIR"
mongod &
node server.js &
cd "$FRONTEND_DIR"
ng serve --open
