var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExactJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user,config.secretkey,{expiresIn:3600});
};

var opts = {};
opts.jwtFromRequest = ExactJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretkey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    console.log('JWT payload: ',jwt_payload);
    User.findOne({_id:jwt_payload._id},(err,user)=>{
        if(err){
            return done(err,false);
        }
        else if(user){
            return done(null,user);
        }
        else{
            return done(null,false);
        }
    })
}))

exports.verifyUser = passport.authenticate('jwt',{session:false});