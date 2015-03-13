// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var mongoose   = require('mongoose');
var seed     = require('./seed');
mongoose.connect('mongodb://gathrr:gathrrPass!1@ds031631.mongolab.com:31631/gathrr',
function(){
	seed.seedUsers();
}); // connect to our database
var UserModel     = require('./app/models/user');


// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log("Something happened");
	console.log(req.params);
	next();
});

router.route('/addUser')
	.post(function(req, res) {

		var user = new User();
		user.id = req.body.id;
		user.name = req.body.name;  
		user.weight = req.body.weight;  
		user.sex = req.body.sex;  
		user.picture = req.body.picture;  
		user.history = [];  
		user.fighters_seen = [];  

		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'User created!' });
		});
	});

router.route('/user')

	// get the user with that id
	.get(function(req, res) {
		UserModel.findOne({id: req.query.id}, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the User with this id
	.put(function(req, res) {
		UserModel.findOne({id: req.query.id}, function(err, user) {

			if (err)
				res.send(err);

			user.id = req.body.id;
			user.name = req.body.name;  
			user.weight = req.body.weight;  
			user.sex = req.body.sex;  
			user.picture = req.body.picture; 

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User updated!' });
			});

		});
	})

	// delete the user with this id
	.delete(function(req, res) {
		UserModel.remove({id: req.query.id}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

router.route('/addSeen')

	.post(function(req, res) {
		UserModel.findOne({id: req.body.id}, function(err, user) {

			user.fighters_seen.put(req.body.idSeen);

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User created!' });
			});

		});
		
	});

router.get('/getNextFighter', function(req, res) {
	UserModel.findOne({id: req.query.id}, function(err, user) {
		UserModel.findOne({id: { $nin: user.fighters_seen}}, function(err, nFighter) {
			if (err)
				res.send(err);  
			res.json(nFighter);
		});
	});
});

router.get('/getAllFighters', function(req, res) {
	console.log("gets to the function");
	UserModel.find(function(err, users) {
		//never gets here!!
		console.log("Query Returns");
		if (err)
			res.send(err);
		res.json(users);
	});
});

router.get('/test', function(req, res) {
	res.json("Hello World");
});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================

var port     = process.env.PORT || 8080; // set our port
app.listen(port);
console.log('Magic happens on port ' + port);
