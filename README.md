# Diagnostic Tool

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.3.

Confluence Page for additional documentation: https://confluence.boozallencsn.com/display/ITSDT/IT+Strategy+Diagnostics+Tool+Home

# Getting Up and Running
    
### Downloading the Application Code
    
1. Install Git: 
    https://git-scm.com/downloads
    
2. Create a personal access token (classic) for git (give yourself all permissions except for "delete_repo"): https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line

2. Clone the Diagnostic Tool Repository to a desired location on your computer.
    https://github.boozallencsn.com/IT-Strategy-Diagnostic-Tool/Diagnostic-Tool
    
    To Clone the Repo to your Desktop from the command line: \
    `cd ~/Desktop` \
    `git clone https://github.boozallencsn.com/IT-Strategy-Diagnostic-Tool/Diagnostic-Tool.git` \
    `cd Diagnostic-Tool` 

3. Request the secrets (or if running the latest version, the .env file) directory from one of the developers. This secrets directory is to be placed in /backend. This directory is on gitignore so it will not be committed. * The app will not run without this directory *


### Running the development environment using Docker

1. Install Docker Desktop `https://www.docker.com/products/docker-desktop/`

2. After installing, run `bash server.sh` from the main directory

3. If you're getting an error related to Mongo upon running Docker, please delete `~/Diagonstic-Tool-Data` by running `rm -r Diagonstic-Tool-Data`. This should allow Mongo to write correctly.

4. The site should be open on port `80:80`.
5. There will be an admin account that you can login with. Email is `admin@admin` and password is `password`

    
# Miscellaneous Useful Commands
    
### Git

1. Creating a local commit: When you want to create a new commit:
    1. `Git add -A` (Adds all changed files for staging)
    2. `Git commit -m "Insert commit message here"`

2. Push a commit to master branch: `git push origin master`

# Running Compodoc

### Installation and setup

Make sure to install the `compodoc` package globally. Run `npm install -g @compodoc/compodoc`. Then, under `/frontend`, make sure there's a `tsconfig.doc.json` file.
In that file, make sure there's the following line: `{ "include": ["src/**/*.ts"] }`. 

### Running compodoc
To run compodoc and create the latest architecture diagram and notes, run `compodoc -p tsconfig.doc.json -s`. The documentation is served on `http://127.0.0.1:8080/`

### More Information on compodoc
For more information and tutorials on `compodoc`, please visit: https://compodoc.app/guides/tutorial.html


## Legacy (pre Docker Desktop) Installation For Tools You Will Need
1. Install Git: 
    https://git-scm.com/downloads
    
2. Install Node.js\
    https://nodejs.org/en/

3. Install Angular CLI
    
    (From the Command Line) `npm install -g @angular/cli`
    
    If you run into issues with npm: try https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally.
    
4. Install MongoDB Community Edition:
    https://docs.mongodb.com/manual/administration/install-community/
    
### Legacy (pre Docker Desktop) Running the development environment

1. Install node dependencies on frontend and backend: 
    Navigate to /frontend and run `npm install --force`
    Navigate to /backend and run `npm install --force`

2. Open three separate Terminal/Command Line Sessions
  
    In the first session, run the command `mongod`. For the first time you may need to run `brew services start mongodb-community@5.0` if you used brew to install mongo. If you're getting a 'command not found' error, make sure to add MongoDB's bin (example: C:\Program Files\MongoDB\Server\7.0\bin) to the system environment variable. Then, restart your command line. 
    
    In the second session, navigate to /backend and run the command `node server.js`. If you're running into Python or package-related errors, you may run `npm run audit --force` and following the prompts in the terminal.
    
    In the third session, navigate to /frontend and run the command `ng serve --open`. If you're getting an error about ssl, add the following line to the `scripts` section of 'package.json': `"start": "set NODE_OPTIONS=--openssl-legacy-provider && ng serve -o"` and this may fix the error. Run `npm run start`

    The app will open up on a browser on `localhost:4200`

3. There will be an admin account that you can login with. Email is `admin@admin` and password is `password`
    
### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
