const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Leaders = require('../models/leaders')

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

// updating the '/' part
leaderRouter.route('/')
.get((req,res,next) =>
{
    Leaders.find({})
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader("Content-type","application/json");
        res.json(leaders);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) => 
{
    Leaders.create(req.body)
   .then((leader) => {
       console.log('Leader Created',leader);
       res.statusCode = 200;
       res.setHeader('Content-Type','application/json');
       res.json(leader);
   },(err) => next(err))
   .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) => 
{
    res.statusCode = 403;
 
    res.end('Put operation not supported on /leaders');
})
.delete(authenticate.verifyUser,(req,res,next) => 
{
    Leaders.remove()
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err)) 
    .catch((err) => next(err));

})

// updating the '/:leaderId' part
leaderRouter.route('/:leaderId')
.get( (req,res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leaders) => {
       res.statusCode = 200;
       res.setHeader('Content-Type','application/json');
       res.json(leaders);
      },(err) => next(err))
      .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
})

.put(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId,{
        $set: req.body
    },{new: true})
    .then((leader) => {
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(leader);   
    },(err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
     res.statusCode = 200;
     res.setHeader('Content-Type','application/json');
     res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

// updating the '/:leaderId/:comments' part
leaderRouter.route('/:leaderId/:comments')
.get((req,res,next) =>
{
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader.comments);
        }
        else
        {
            err = new Error(`leader ${req.params.leaderId} not found`);
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,(req,res,next) => 
{
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null)
        {
            leader.comments.push(req.body);
            leader.save()
            .then((leader) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(leader);
            },(err) => next(err))
        }
        else
         {
             err = new Error(`leader ${req.params.leaderId} not found`);
             err.status = 404;
             return next(err);
         }
     },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) => 
{
    res.statusCode = 403;
    res.end('Put operation not supported on /leaders' + req.params.leaderId + '/comments');
})

.delete(authenticate.verifyUser,(req,res,next) => 
{
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null)
        {
            for (i = (leader.comments.length-1); i>=0; i--)
            {
                leader.comments.id(leader.comments[i]._id).remove();
            }
            leader.save()
            .then((leader) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(leader);
            },(err) => next(err))
        }
        else
         {
             err = new Error(`leader ${req.params.leaderId} not found`);
             err.status = 404;
             return next(err);
         }
    },(err) => next(err)) 
    .catch((err) => next(err));

})

// updating the '/:leaderId/:comments/:commentId' part
leaderRouter.route('/:leaderId/:comments/:commentId')
.get( (req,res,next) => {
    Leaders.findById(req.params.leaderId)
  .then((leader) => {
     if(leader != null && leader.comments.id(req.params.commentId) != null)
       {
         res.statusCode = 200;
         res.setHeader('Content-Type','application/json');
         res.json(leader.comments.id(req.params.commentId));
        }
        else if(leader == null)
        {
            err = new Error(`leader ${req.params.leaderId} not found`);
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /leaders/'+ req.params.leaderId + '/comments/' + req.params.commentId);
})

.put(authenticate.verifyUser, (req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId)
    .then((leader) => {
       if(leader != null && leader.comments.id(req.params.commentId) != null)
         {   //the downward method is the only method to update the embeded sub document inside a document of mongoose
             if(req.body.rating)
             {
              leader.comments.id(req.params.commentId).rating = req.body.rating;
             }
            
             if(req.body.comment)
             {
              leader.comments.id(req.params.commentId).comment = req.body.comment;
             }
            leader.save()
           .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
              },(err) => next(err))
          }
          else if(leader == null)
          {
              err = new Error(`leader ${req.params.leaderId} not found`);
              err.status = 404;
              return next(err);
          }
          else{
              err = new Error(`Comment ${req.params.commentId} not found`);
              err.status = 404;
              return next(err);
          }
     },(err) => next(err))
     .catch((err) => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null && leader.comments.id(req.params.commentId) != null)
        {
         leader.comments.id(req.params.commentId).remove();
            leader.save()
            .then((leader) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(leader);
            },(err) => next(err))
        }
        else if(leader == null)
        {
            err = new Error(`leader ${req.params.leaderId} not found`);
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
        
    },(err) => next(err))
   .catch((err) => next(err));
});

module.exports = leaderRouter;