const express = require("express");
const bodyParser = require("body-parser");
const Favourites = require("../models/favourite");

const favouriteRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");
// const user = require("../models/user");

favouriteRouter.use(bodyParser.json());

favouriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    Favourites.find({})
      .populate("dishes")
      .populate("user")
      .then(
        (favorites) => {
          if (favorites != null) {
            var user_favourite = favorites.filter(
              (fav) => fav.user._id.toString() === req.user._id.toString()
            );
            if (!user_favourite) {
              var err = new Error("You have no favourites!");
              err.status = 404;
              return next(err);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user_favourite);
          } else {
            var err = new Error("There are no favourites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user) 
                    user = new Favourites({user: req.user.id});
                for(let i of req.body){
                    if(user.dishes.find((d_id) => {
                        if(d_id._id){
                            return d_id._id.toString() === i._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(i._id);
                }
                user.save()
                    .then((userFavs) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }, (err) => next(err))
                    .catch((err) => next(err));
                
            })
            .catch((err) => next(err));
})

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res,next) => {
      Favourites.find({})
      .populate('dishes')
      .populate('user')
      .then((favourite)=>{
          var user ;
          if(favourite)
          {
              user = favourite.filter((fav)=>req.user.id.toString()===fav.user._id.toString())[0]
          }
          if(user)
          {
              user.remove({})
              .then((user)=>{
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(user);
              },err=>next(err))
          }
          else {
            var err = new Error('You do not have any favourites');
            err.status = 404;
            return next(err);
        }
      },err=>next(err))
      .catch(err=>next(err))
  });

favouriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res,next) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res,next) => {
      Favourites.find({})
      .populate('user')
      .populate('dishes')
      .then((favourite)=>{
          
          if(favourite)
          {
            const  user = favourite.filter((fav)=>fav.user._id.toString()===fav.user.id.toString())[0]
            const dish = user.dishes.filter(dish=>dish.id===req.params.dishId)[0]
            if(dish)
            {
                res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
            }
            else{
                var err = new Error('You do not have dish ' + req.params.dishId);
                err.status = 404;
                return next(err);
            }
          }
          else{
            var err = new Error('You do not have any favourites');
            err.status = 404;
            return next(err);
          }
        //   if(!user)
      },err=>next(err))
      .catch(err=>next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
      Favourites.find({})
      .populate('user')
      .populate('dishes')
      .then(favourite=>{
          var user;
          if(favourite)
          {
              user = favourite.filter(fav=>fav.user._id.toString()===req.user.id.toString())[0]

          }
          if(!user)
          {
              user = new Favourites({user:req.user.id})

          }
        var dish = user.dishes.filter((dish)=>dish._id===req.params.dishId)[0]
        if(!dish)
        {
            user.dishes.push(req.params.dishId);
        }
        user.save()
        .then((dish)=>{
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
            console.log("Favourites Created");
        },err=>next(err))
        .catch(err=>next(err));
      })
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
      Favourites.find({})
      .populate('dishes')
      .populate('user')
      .then((favourite)=>{
          var user;
          if(favourite)
          {
              user = favourite.filter((fav)=>fav.user._id.toString()===req.user.id.toString())[0]
          }
          if(user)
          {
              const dish = user.dishes.filter((dish)=>dish._id.toString()==req.params.dishId)[0]
              if(dish)
              {
                  dish.remove()
                  dish.save()
                  .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  },err=>next(err));
              }
              
          }
          else{
            var err = new Error('You do not have any favourites');
            err.status = 404;
            return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favouriteRouter;