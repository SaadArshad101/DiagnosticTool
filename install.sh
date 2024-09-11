#!/bin/sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install node
npm install -g @angular/cli
npm install express
brew tap mongodb/brew
brew install mongodb-community@3.2
brew services start mongodb-community@3.2
FRONTEND_DIR="../frontend"
BACKEND_DIR="backend"
cd "$BACKEND_DIR"
npm install
cd "$FRONTEND_DIR"
npm install
