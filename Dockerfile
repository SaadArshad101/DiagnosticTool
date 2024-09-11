FROM node:20.11.1
RUN mkdir -p /user/src
COPY . /user/src
WORKDIR /user/src/frontend
ENV NODE_OPTIONS=--openssl-legacy-provider
#RUN npm install rxjs@6.0 rxjs-compat --save
RUN npm install --force && \
    npm run build 
WORKDIR /user/src/backend
RUN npm install
RUN npm rebuild bcrypt --build-from-source
EXPOSE 80
CMD [ "npm", "start" ]
# Uncomment the line below to start the application in debug mode
# CMD [ "npm", "run", "start-debug" ]
