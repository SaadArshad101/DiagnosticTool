// Code is from https://medium.com/@bvodola/crud-routes-generator-with-node-express-js-mongoose-30a16538e16a

const express = require('express');
const hashPassword = require('../helpers/hash').hashPassword;

module.exports = (Collection) => {

  // ======
  // Create
  // ======
  const create = (req, res) => {
    const newEntry = req.body;

    if (Collection.modelName === 'Tag') {
      Collection.findOne({ value: newEntry.value }, (e, response) => {
        if (e) {
          res.status(500).send(e);
        } else if (response) {
          res.status(409).send("Another tag has this value");
        } else {
          Collection.create(newEntry, (e,newEntry) => {
            if(e) {
              console.log(e);
              res.sendStatus(500);
            } else {
              res.send(newEntry);
            }
          });
        }
      });
    // User requires a hash for the password storage
    } else if (Collection.modelName === 'User') {
      
      // Don't allow creation of a user if the email already exists in the db
      Collection.findOne({ email: newEntry.email }, (e, response) => {
        if (e) {
          res.status(500).send(e);
        } else if (response) {
          res.status(409).send("Another user has this email");
        } else {
          // Store the password as a hash
          const hashPromise = hashPassword(newEntry.password);
          hashPromise.then(result => {
            if (result != null) {
              newEntry.passwordHash = result;
              newEntry.password = null;
  
              Collection.create(newEntry, (e,newEntry) => {
                if(e) {
                  console.log(e);
                  res.sendStatus(500);
                } else {
                  res.send(newEntry);
                }
              });
            } else {
              res.status(500).send("There was an error in hashing the password");
            }
          });
        }
      });
    } else {
      Collection.create(newEntry, (e,newEntry) => {
        if(e) {
          console.log(e);
          res.sendStatus(500);
        } else {
          res.send(newEntry);
        }
      });
    }
  };
  
  // =========
  // Read many
  // =========
  const readMany = (req, res) => {
    let query = res.locals.query || {};
  
    Collection.find(query, (e,result) => {
      if(e) {
        res.status(500).send(e);
        console.log(e.message);
      } else {
        res.send(result);
      }
    });
  };

  // ========
  // Read one
  // ========
  const readOne = (req, res) => {
    const { _id } = req.params;
  
    Collection.findById(_id, (e,result) => {
      if(e) {
        res.send(null);
      } else {
        res.send(result);
      }
    });
  };
  
  // ======
  // Update
  // ======
  const update = (req, res) => {
    const changedEntry = req.body;
    if (Collection.modelName === 'User' && changedEntry.password != null) {
      bcrypt.hash(changedEntry.password, saltRounds, function(err, hash) {
        if (err) {
          console.log(err);
        } else {
          changedEntry.passwordHash = hash;
          changedEntry.password = null;
          Collection.updateOne({ _id: req.params._id }, { $set: changedEntry }, (e) => {
            if (e)
              res.sendStatus(500);
            else
              res.send(changedEntry);
          });
        }
      });
    } else {
      Collection.updateOne({ _id: req.params._id }, { $set: changedEntry }, (e) => {
        if (e) {
          console.log(e);
          res.sendStatus(500);
        }
        else {
          res.send(changedEntry);
        }
      });
    }
  };
  
  // ======
  // Remove
  // ======
  const remove = (req, res) => {
    if (Collection.modelName === 'DefaultDiagnostic') {
      Collection.remove({ diagnosticId: req.params._id }, (e) => {
        if (e)
          res.status(500).send(e);
        else
          res.status(200).send('Delete successful');
      });
    } else {
      Collection.remove({ _id: req.params._id }, (e) => {
        if (e)
          res.status(500).send(e);
        else
          res.status(200).send('Delete successful');
      });
    }
  };

  // ======
  // Routes
  // ======

  let router = express.Router();

  router.post('/', create);
  router.get('/', readMany);
  router.get('/:_id', readOne);
  router.put('/:_id', update);
  router.delete('/:_id', remove);

  return router;

}