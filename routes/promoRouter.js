const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Promotions = require('../models/promotions')

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// updating the '/' part
promoRouter.route('/')
.get((req,res,next) =>
{
    Promotions.find({})
    .then((promotions) => {
        res.statusCode = 200;
        res.setHeader("Content-type","application/json");
        res.json(promotions);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) => 
{
    Promotions.create(req.body)
   .then((promotion) => {
       console.log('Promotion Created',promotion);
       res.statusCode = 200;
       res.setHeader('Content-Type','application/json');
       res.json(promotion);
   },(err) => next(err))
   .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) => 
{
    res.statusCode = 403;
 
    res.end('Put operation not supported on /promotions');
})
.delete(authenticate.verifyUser,(req,res,next) => 
{
    Promotions.remove()
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err)) 
    .catch((err) => next(err));
})

// updting the /:promoId
promoRouter.route('/:promoId')
.get( (req,res,next) => {
    Promotions.findById(req.params.promoId)
  .then((promotions) => {
     res.statusCode = 200;
     res.setHeader('Content-Type','application/json');
     res.json(promotions);
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /promotions/'+ req.params.promoId);
})

.put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId,{
        $set: req.body
    },{new: true})
    .then((promotion) => {
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(promotion);   
    },(err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
   .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(resp);
   },(err) => next(err))
   .catch((err) => next(err));
});

promoRouter.route('/:promoId/:comments')
.get((req,res,next) =>
{
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion.comments);
        }
        else
        {
            err = new Error(`promotion ${req.params.promoId} not found`);
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) => 
{
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null)
        {
            promotion.comments.push(req.body);
            promotion.save()
            .then((promotion) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(promotion);
            },(err) => next(err))
        }
        else
         {
             err = new Error(`promotion ${req.params.promoId} not found`);
             err.status = 404;
             return next(err);
         }
     },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) => 
{
    res.statusCode = 403;
    res.end('Put operation not supported on /promotions' + req.params.promoId + '/comments');
})
.delete(authenticate.verifyUser,(req,res,next) => 
{
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null)
        {
            for (i = (promotion.comments.length-1); i>=0; i--)
            {
                promotion.comments.id(promotion.comments[i]._id).remove();
            }
            promotion.save()
            .then((promotion) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(promotion);
            },(err) => next(err))
        }
        else
         {
             err = new Error(`promotion ${req.params.promoId} not found`);
             err.status = 404;
             return next(err);
         }
    },(err) => next(err)) 
    .catch((err) => next(err));

})

// updating the '/:promoId/:comments/:commentId' part
promoRouter.route('/:promoId/:comments/:commentId')
.get( (req,res,next) => {
    Promotions.findById(req.params.promoId)
  .then((promotion) => {
     if(promotion != null && promotion.comments.id(req.params.commentId) != null)
       {
         res.statusCode = 200;
         res.setHeader('Content-Type','application/json');
         res.json(promotion.comments.id(req.params.commentId));
        }
        else if(promotion == null)
        {
            err = new Error(`promotion ${req.params.promoId} not found`);
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
  res.end('POST operation not supported on /promotions/'+ req.params.promoId + '/comments/' + req.params.commentId);
})

.put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId)
    .then((promotion) => {
       if(promotion != null && promotion.comments.id(req.params.commentId) != null)
         {   //the downward method is the only method to update the embeded sub document inside a document of mongoose
             if(req.body.rating)
             {
              promotion.comments.id(req.params.commentId).rating = req.body.rating;
             }
            
             if(req.body.comment)
             {
              promotion.comments.id(req.params.commentId).comment = req.body.comment;
             }
            promotion.save()
           .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(promotion);
              },(err) => next(err))
          }
          else if(promotion == null)
          {
              err = new Error(`promotion ${req.params.promoId} not found`);
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
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null && promotion.comments.id(req.params.commentId) != null)
        {
         promotion.comments.id(req.params.commentId).remove();
            promotion.save()
            .then((promotion) => {
             res.statusCode = 200;
             res.setHeader('Content-Type','application/json');
             res.json(promotion);
            },(err) => next(err))
        }
        else if(promotion == null)
        {
            err = new Error(`promotion ${req.params.promoId} not found`);
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

module.exports = promoRouter;