const jwt = require("jsonwebtoken");
const userSchema = require("./app/models/app.model").user;
const diagnosticSchema = require("./app/models/app.model").diagnostic;
const fs = require("fs");

function generateJWT(role, userId) {
  // Change this to get it another way
  let secret = getSecret();
  let token = jwt.sign({ role: role, id: userId }, secret, {
    expiresIn: "96h",
  });
  return token;
}

function getSecret() {
  return fs.readFileSync("secrets/jwt-secret").toString();
}

function updateLastInteraction(id) {
  userSchema.updateOne(
    { _id: id },
    {
      lastInteraction: Date.now(),
    },
    function (err, s) {}
  );
}

function getPayload(req) {
  let secret = getSecret();

  let token = req.headers["authorization"] || req.headers["x-access-token"];

  if (token != null && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  if (token != null) {
    try {
      const payload = jwt.verify(token, secret);
      updateLastInteraction(payload.id);
      return payload;
    } catch (err) {
      return -1;
    }
  } else {
    return null;
  }
}

// Updates the userData array field of diagnostic by replacing the entry in the array that has the same userId as newEntry
function updateUserData(diagnosticId, newEntry) {
  let newUserData = null;

  diagnosticSchema.findById(diagnosticId).exec(
    (e, result) => {
      if (e) {
      } else {
        newUserData = updatedSpecificUserData(result.userData, newEntry);

        diagnosticSchema.update(
          { _id: diagnosticId },
          {
            userData: newUserData,
          },
          function (err, s) {}
        );
      }
    },
    function (err, s) {}
  );
}

// Removes any user response data that isn't connected to userId
function sendFilteredDiagnosticResponse(diagnosticId, userId, res) {
  diagnosticSchema.findById(diagnosticId).exec((e, result) => {
    if (e) {
    } else {
      if (result != null && result.userData != null) {
        result.userData = result.userData.filter(
          (uData) => uData.userId === userId
        );
      }

      return res.send(result);
    }
  });
}

//Helper function for updateUserData that returns a userData array with the newEntry replacing an old entry
function updatedSpecificUserData(userData, newEntry) {
  // Remove the old entry from the userData array
  userData = userData.filter((u) => u.userId !== newEntry.userId);

  // Push the new entry to the userData array
  userData.push(newEntry);

  return userData;
}

function verifyDiagnosticRoute(req, res, next) {
  const payload = getPayload(req);

  if (payload === -1) {
    return tokenNotValid(res);
  }

  if (payload != null) {
    const role = payload.role;

    if (req.method === "GET") {
      if (isAdmin(role) || isDesigner(role) || isTaker(role)) {
        next();
      } else {
        // Substring by 16 to get rid of the /api/diagnostic/
        const diagnosticId = req.originalUrl.substring(16);
        sendFilteredDiagnosticResponse(diagnosticId, payload.id, res);
      }
    } else if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "DELETE"
    ) {
      if (isAdmin(role) || isDesigner(role) || isTaker(role)) {
        next();
      } else {
        return roleNotAllowed(res);
      }
    } else {
      return tokenNotProvided(res);
    }
  }
}

function verifyUserRoute(req, res, next) {
  const payload = getPayload(req);

  const requested_role = req.body.role;

  if (payload === -1) {
    return tokenNotValid(res);
  }

  if (req.method === "POST") {
    if (isAdmin(requested_role)) {
      return roleNotAllowed(res);
    } else {
      next();
    }
  } else {
    if (payload) {
      const role = payload.role;
      const userId = payload.id;

      if (isAdmin(role)) {
        next();
      } else if (isDesigner(role) || isTaker(role)) {
        // Substring by 10 to get rid of the /api/user/
        if (req.originalUrl.substring(10) === userId) {
          if (isAdmin(requested_role)) {
            return roleNotAllowed(res);
          } else {
            next();
          }
        } else {
          return roleNotAllowed(res);
        }
      }
    } else {
      return tokenNotProvided(res);
    }
  }
}

function verifyTemplateRoute(req, res, next) {
  const payload = getPayload(req);

  if (payload === -1) {
    return tokenNotValid(res);
  }

  if (payload) {
    const role = payload.role;

    if (isAdmin(role) || isTaker(role)) {
      next();
    } else if (isDesigner(role)) {
      if (req.method === "GET") {
        next();
      } else {
        return roleNotAllowed(res);
      }
    }
  } else {
    return tokenNotProvided(res);
  }
}

function verifyDefaultDiagnosticRoute(req, res, next) {
  const payload = getPayload(req);

  if (payload === -1) {
    return tokenNotValid(res);
  }

  if (payload) {
    const role = payload.role;

    if (req.method === "GET") {
      next();
    } else {
      if (isAdmin(role) || isTaker(role)) {
        next();
      } else {
        return roleNotAllowed(res);
      }
    }
  } else {
    return tokenNotProvided(res);
  }
}

function isAdmin(role) {
  return role === "Admin";
}

function isDesigner(role) {
  return role === "Designer";
}

function isTaker(role) {
  return role === "Taker";
}

function roleNotAllowed(res) {
  return res
    .status(403)
    .send("Role does not have permission to perform this action");
}

function tokenNotValid(res) {
  return res.status(401).send("Token is not valid");
}

function tokenNotProvided(res) {
  return res.status(401).send("Token not provided");
}

module.exports = {
  generateJWT: generateJWT,
  verifyDiagnosticRoute: verifyDiagnosticRoute,
  verifyTemplateRoute: verifyTemplateRoute,
  verifyUserRoute: verifyUserRoute,
  verifyDefaultDiagnosticRoute: verifyDefaultDiagnosticRoute,
};
