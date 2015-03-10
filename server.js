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
mongoose.connect('mongodb://fightr-user:fightr-password@ds031631.mongolab.com/gathrr'); // connect to our database
var User     = require('./app/models/user');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

/*// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});*/

router.route('/addUser')

	// create a bear (accessed at POST http://localhost:8080/bears)
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

router.route('/users/:user_id')

	// get the user with that id
	.get(function(req, res) {
		User.findOne({id: req.params.user_id}, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the User with this id
	.put(function(req, res) {
		User.findOne({id: req.params.user_id}, function(err, user) {

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

	// delete the bear with this id
	.delete(function(req, res) {
		User.remove({id: req.params.user_id}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	})
);

router.route('/addSeen')

	// create a bear (accessed at POST http://localhost:8080/bears)
	.post(function(req, res) {
		User.findOne({id: req.body.id}, function(err, user) {

			user.fighters_seen.put(req.body.idSeen);

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User created!' });
			});

		});
		
	});

router.get('/getNextFighter/:user_id', function(req, res) {
	User.findOne({id: req.params.user_id}, function(err, user) {
		User.findOne({id: { $nin: user.fighters_seen}}, function(err, nFighter) {
			if (err)
				res.send(err);
			res.json(nFighter);
		});
	});
});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================

var port     = process.env.PORT || 8080; // set our port
app.listen(port);
console.log('Magic happens on port ' + port);
