const saml2 = require("saml2-js");
const fs = require("fs");
const express = require("express");
const router = express.Router();
var generator = require("generate-password");

const user = require("./app/models/app.model.js").user;

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

router.get("/metadata.xml", function (req, res) {
  res.type("application/xml");
  res.send(sp.create_metadata());
});

router.get("/loginSAML", function (req, res) {
  sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
    if (err != null) return res.send(500);
    res.redirect(login_url);
  });
});

router.post("/assert", function (req, res) {
  var options = { request_body: req.body };

  sp.post_assert(idp, options, function (err, saml_response) {
    if (err != null) {
      res.send("error: " + err);
    }

    var rawName = saml_response.user.attributes.realName[0];
    var removeSquareBracket = rawName.split(" [")[0];
    var names = removeSquareBracket.split(", ");
    var firstName = names[0];
    var lastName = names[1];

    var userObj = {
      email: saml_response.user.attributes.mail[0],
      firstName: firstName,
      lastName: lastName,
      organization: "Booz Allen Hamilton",
      password: "password",
    };

    user.findOne({ email: userObj.email }, (e, response) => {
      if (e) {
        res.status(500).send(e);
        console.log(e.message);
      } else if (!response) {
        userObj.password = generator.generate({
          length: 10,
          numbers: true,
        });

        user.create(userObj, (e, obj) => {
          localStorage.setItem("diagnosticUser", obj["_id"]);
          res.redirect("https://strategydiagnostic.boozallencsn.com/dashboard");
        });
      } else {
        localStorage.setItem("diagnosticUser", response["_id"]);
        res.redirect("https://strategydiagnostic.boozallencsn.com/dashboard");
      }
    });
  });
});

router.get("/logout", function (req, res) {
  var options = {
    name_id: name_id,
    session_index: session_index,
  };

  sp.create_logout_request_url(idp, options, function (err, logout_url) {
    if (err != null) return res.send(500);
    res.redirect(logout_url);
  });
});

module.exports = router;
