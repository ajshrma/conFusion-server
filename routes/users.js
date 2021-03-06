var express = require('express');
const bodyParser = require('body-Parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
//const { route } = require('.'); //why we use this

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// for '/signup'
router.post('/signup',(req,res,next) =>  {                            
  User.register(new User({username: req.body.username}),
   req.body.password , (err,user) => {
    if(err){
      res.statuscode =500;
      res.setHeader('Content-Type','applicatio/json');
      res.json({err: err})
    }
    else{
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err,user) => {
        if(err) {
          res.statuscode =500;
          res.setHeader('Content-Type','applicatio/json');
          res.json({err: err})
        }
        passport.authenticate('local')(req,res, () => {
          res.statuscode =200;
          res.setHeader('Content-Type','applicatio/json');
          res.json({success: true, status: 'Registration successfull!'}); 
         });
      });
    }
  });
});

//for '/login'
router.post('/login', passport.authenticate('local'), (req,res) => {
  
  var token = authenticate.getToken({_id: req.user._id});
  res.statuscode = 200;
  res.setHeader('Content-Type','applicatio/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'}); 
});
// for '/logout'
router.get('/logout',(req,res) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else{
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
