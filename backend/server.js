const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const socketIo = require('socket.io');

const app = express();

//Swagger variables
const crud = require("./app/controllers/crud.controller.js");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
const router = express.Router();

const diagnostic = require("./app/models/app.model.js").diagnostic;
const user = require("./app/models/app.model.js").user;
const template = require("./app/models/app.model.js").template;
const defaultDiagnostic =
  require("./app/models/app.model.js").defaultDiagnostic;
const tag = require("./app/models/app.model.js").tag;

const saml2 = require("saml2-js");
const fs = require("fs");
const generator = require("generate-password");

// JWT related functions
const generateJWT = require("./jwt.js").generateJWT;
const verifyDiagnosticRoute = require("./jwt.js").verifyDiagnosticRoute;
const verifyTemplateRoute = require("./jwt.js").verifyTemplateRoute;
const verifyUserRoute = require("./jwt.js").verifyUserRoute;
const verifyDefaultDiagnosticRoute =
  require("./jwt.js").verifyDefaultDiagnosticRoute;

// Helper function to hash password
const hashPassword = require("./app/helpers/hash").hashPassword;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const cors = require("cors");
app.use(cors());

//Set up Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", router);

//Config the db
const config = require("config");
const dbConfig = config.get("CRUD.dbConfig");
console.log(dbConfig.url);
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

//Connect to db
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the db");
  })
  .catch((err) => {
    console.log("Could not connect to the db. Exiting now...", err);
    process.exit();
  });

app.use(express.static("../frontend/dist/it-strategy-diagnostic-tool"));

app.use("/api/diagnostic", verifyDiagnosticRoute, crud(diagnostic));
app.use("/api/user", verifyUserRoute, crud(user));
app.use("/api/template", verifyTemplateRoute, crud(template));
app.use(
  "/api/defaultDiagnostic",
  verifyDefaultDiagnosticRoute,
  crud(defaultDiagnostic)
);
app.use("/api/tag", crud(tag));

const bcrypt = require("bcrypt");

app.post("/api/login", (req, res) => {
  const email = req.body["email"].toLowerCase();
  const password = req.body["password"];

  user.findOne({ email: email }, (e, response) => {
    if (e) {
      res.status(500).send(e);
      console.log(e.message);
    } else if (!response) {
      res.send(401);
    } else {
      bcrypt.compare(password, response.passwordHash, function (e, resp) {
        if (resp === true) {
          res.send({
            success: true,
            token: generateJWT(response.role, response["_id"]),
          });
        } else {
          res.send(401);
        }
      });
    }
  });
});

// Create service provider
var sp_options = {
  entity_id: "strategydiagnostic.boozallencsn.com",
  private_key: fs.readFileSync("secrets/server.key").toString(),
  certificate: fs.readFileSync("secrets/server.cert").toString(),
  assert_endpoint: "https://strategydiagnostic.boozallencsn.com/assert",
  allow_unencrypted_assertion: true,
};
var sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
  sso_login_url:
    "https://sso.boozallencsn.com/idp/startSSO.ping?PartnerSpId=strategydiagnostic.boozallencsn.com",
  sso_logout_url: "https://idp.example.com/logout",
  certificates: [fs.readFileSync("secrets/idp.crt").toString()],
};
var idp = new saml2.IdentityProvider(idp_options);

app.get("/metadata.xml", function (req, res) {
  res.type("application/xml");
  res.send(sp.create_metadata());
});

app.get("/loginSAML", function (req, res) {
  sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
    if (err != null) return res.send(500);
    res.redirect(login_url);
  });
});

app.get("/api/userId", function (req, res) {
  user.find({}, (err, users) => {
    var emailsAndNames = users.map((user) => ({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id,
      organization: user.organization,
      organizationRole: user.organizationRole,
    }));

    res.send(emailsAndNames);
  });
});

app.post("/api/addDiagnosticToUser", function (req, res) {
  var data = req.body;
  var email = data.email;
  var diagnosticId = data.diagnosticId;

  user.findOne({ email: email }, (e, response) => {
    if (response.diagnostics.includes(diagnosticId)) {
      res.send(409);
    } else {
      diagnostic.findOne({ _id: diagnosticId }, (e, response2) => {
        if (!response2) {
          res.send(500);
        } else {
          var updatedUser = response;
          updatedUser.diagnostics.push(diagnosticId);

          user.updateOne({ email: email }, { $set: updatedUser }, (e) => {
            if (e) {
              res.send(500);
            } else {
              res.status(200).send({ status: "success" });
            }
          });
        }
      });
    }
  });
});

app.post("/api/removeDiagnosticFromUser", function (req, res) {
  var data = req.body;
  var email = data.email;
  var diagnosticId = data.diagnosticId;

  user.findOne({ email: email }, (e, response) => {
    var updatedUser = response;
    updatedUser.diagnostics = updatedUser.diagnostics.filter(
      (dId) => dId != diagnosticId
    );
    user.updateOne({ email: email }, { $set: updatedUser }, (e) => {
      if (e) {
        res.send(500);
      } else {
        res.status(200).send({ status: "success" });
      }
    });
  });
});

app.post("/assert", function (req, res) {
  var options = { request_body: req.body };

  sp.post_assert(idp, options, function (err, saml_response) {
    if (err != null) {
      res.send("error: " + err);
    }

    var rawName = saml_response.user.attributes.realName[0];
    var removeSquareBracket = rawName.split(" [")[0];
    var names = removeSquareBracket.split(", ");
    var firstName = names[1];
    var lastName = names[0];

    var userObj = {
      email: saml_response.user.attributes.mail[0].toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      organization: "Booz Allen Hamilton",
      password: "password",
      role: "Designer",
    };

    user.findOne({ email: userObj["email"] }, (e, response) => {
      let token;

      if (e) {
        res.status(500).send(e);
        console.log(e.message);
      } else if (!response) {
        userObj.password = generator.generate({
          length: 10,
          numbers: true,
        });

        const hashPromise = hashPassword(userObj.password);
        hashPromise.then((hash) => {
          userObj.passwordHash = hash;
          userObj.password = null;

          user.create(userObj, (e, obj) => {
            token = generateJWT(obj.role, obj["_id"]);
            res.redirect(
              301,
              "https://strategydiagnostic.boozallencsn.com/#saml/" + token
            );
          });
        });
      } else {
        token = generateJWT(response.role, response["_id"]);
        res.redirect(
          301,
          "https://strategydiagnostic.boozallencsn.com/#saml/" + token
        );
      }
    });
  });
});

function createDefaultAdminAccountIfNoAdminsExist() {
  user.findOne({ role: "Admin" }, (e, response) => {
    if (!response) {
      const admin = {
        email: "admin@admin",
        password: "password",
        role: "Admin",
        firstName: "Admin",
        lastName: "Admin",
      };
      const hashPromise = hashPassword(admin.password);
      hashPromise.then((hash) => {
        admin.passwordHash = hash;
        admin.password = null;

        user.create(admin, (e, obj) => {});
      });
    }
    changeAllRubricsFromNullToDiagnostic();
  });
}

function changeAllRubricsFromNullToDiagnostic() {
  diagnostic.find({}, (e, diagnostics) => {
    for (let d of diagnostics) {
      for (let rubric of d.rubric) {
        if (rubric.level === undefined) {
          rubric.level = "Diagnostic";
          diagnostic.updateOne({ _id: d._id }, { $set: d }, (e) => {});
        }
      }
    }
    stripTagsFromConsiderations();
  });
}

const striptags = require("striptags");

function stripTagsFromConsiderations() {
  diagnostic.find({}, (e, diagnostics) => {
    for (let d of diagnostics) {
      for (let rubric of d.rubric) {
        rubric.text = striptags(rubric.text);
        diagnostic.updateOne({ _id: d._id }, { $set: d }, (e) => {});
      }
    }
    setAllLocksToFalse();
  });
}

function setAllLocksToFalse() {
  diagnostic.updateMany({}, { lock: false }, function (err, s) {});
}

createDefaultAdminAccountIfNoAdminsExist();

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 }, {
  cors: {
    origin: '*', // Replace with your Angular app's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}
// Set up the WebSocket server
wss.on("connection", function connection(ws) {
  console.log('New wss client connected');

  ws.isAlive = true;
  ws.on("pong", heartbeat);

  ws.on("message", (message) => {
    try {
      const diagnosticId = JSON.parse(message);
      
      // On response from client, set the diagnostic's lock var to true
      ws.diagnosticId = diagnosticId;

      diagnostic.updateOne(
        { _id: diagnosticId }, // Ensure you parse this if needed
        { lock: true },
        function (err, result) {
          if (err) {
            console.error('Error updating diagnostic:', err);
          }
        }
      );

      // Send a success response
      ws.send(JSON.stringify({ status: "success" }));
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ status: "error", message: "Invalid data received" }));
    }
  });

  ws.on("close", function (event) {
    try {
      if (ws.diagnosticId) {
        diagnostic.updateOne(
          { _id: ws.diagnosticId }, // Ensure this is valid
          { lock: false },
          function (err, result) {
            if (err) {
              console.error('Error updating diagnostic on close:', err);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error during close event:', error);
    }
  });

  // Optionally, you could implement a ping/pong mechanism
  ws.on("ping", noop);
  ws.send(JSON.stringify({ status: "connected" }));
});

// Handle error for the server
wss.on("error", (error) => {
  console.error('WebSocket server error:', error);
});

const server = http.createServer(app);
const ioPort = 8081;
server.listen(ioPort, () => console.log(`Server running on port ${ioPort}`));

// const io = socketIo(server);
const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:4200', // Replace with your Angular app's URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('New socetIO client connected');
    
    socket.on('diagnostic-update', (diagnostics) => {
    console.log("server Update")
    try {
      const diagid = diagnostics.id;
      console.log(diagid)
      // On response from client, set the diagnostic's lock var to true
      io.diagnosticId = diagid;

      diagnostic.updateOne(
        { _id: diagid }, // Ensure you parse this if needed
        { lock: true },
        function (err, result) {
          if (err) {
            console.error('Error updating diagnostic:', err);
          }
        }
      );

      // Send a success response
      socket.broadcast.emit('diagnostic-update', diagnostics);
      io.emit('diagnostic-update', diagnostics);
    } catch (error) {
      console.error('Error processing message:', error);
      io.send(JSON.stringify({ status: "error", message: "Invalid data received" }));
    }
    });

    socket.on("close", function (event) {
      console.log("server Update close")
      try {
        if (io.diagnosticId) {
          diagnostic.updateOne(
            { _id: io.diagnosticId }, // Ensure this is valid
            { lock: false },
            function (err, result) {
              if (err) {
                console.error('Error updating diagnostic on close:', err);
              }
            }
          );
        }
      } catch (error) {
        console.error('Error during close event:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      diagnostic.updateOne(
        { _id: JSON.parse(ws.diagnosticId) },
        {
          lock: false,
        },
        function (err, s) {}
      );

      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

// listen on port 80
app.listen(80, () => {
  console.log("Server listened on port 80");
});
