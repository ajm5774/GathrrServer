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
mongoose.connect('mongodb://gathrr:gathrrPass!1@ds041188.mongolab.com:41188/gathrr',
function(){
	seed.seedUsers(false);
}); // connect to our database
var User     = require('./app/models/user');


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
		user.weight_class = User.getWeightClass(user.weight);
		user.history = [];  
		user.fighters_seen = [];  

		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'User created!' });
		});
	});
	
router.route('/addHistory')
	.post(function(req, res) {

		User.findOne({id: req.body.id}, function(err, user) {
			
			user.history[req.body.fought_id] = req.body.result

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User fight-history updated!' });
			});

		});
	});

router.get('/history', function(req, res) {
		User.findOne({id: req.query.id}, function(err, user) {
			if (err)
				res.send(err);
			if(user == undefined || user == null)
				res.json(null);
			res.json(JSON.stringify(user.history));
		});
});	

router.route('/user')

	// get the user with that id
	.get(function(req, res) {
		User.findOne({id: req.query.id}, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the User with this id
	.put(function(req, res) {
		User.findOne({id: req.query.id}, function(err, user) {

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
		User.remove({id: req.query.id}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});

router.route('/addSeen')

	.post(function(req, res) {
		console.log("****************");
		console.log("body: " + req.body.id);
		console.log("idseen: " + req.body.idSeen);
		User.findOne({id: req.body.id}, function(err, user) {

			user.fighters_seen.push(req.body.idSeen);

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User created!' });
			});

		});
		
	});
	
router.route('/resetSeen')

	.post(function(req, res) {
		User.findOne({id: req.body.id}, function(err, user) {

			user.fighters_seen = [];

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Fighters Seen reset!' });
			});

		});
		
	});

router.get('/reseed', function(req, res) {
		seed.seedUsers(true);
		res.json("Database reseeded");
});

router.get('/getNextFighter', function(req, res) {
	User.findOne({id: req.query.id}, function(err, user) {
		if(user == undefined)
		{
			res.json("");
			return;
		}

		User.findOne(
			{id:  {$ne: user.id, $nin: user.fighters_seen},
			gender: {$in: user.matched_genders}, 
			matched_genders: user.gender , 
			weight_class: user.weight_class},
			function(err, nFighter) {
				if (err)
					res.send(err);  
				res.json(nFighter);
			}
		);
	});
}); 


router.get('/getNotSeenFighters', function(req, res) {
	User.findOne({id: req.query.id}, function(err, user) {
		if(user == undefined)
		{
			res.json("");
			return;
		}

		User.find(
			{id:  {$ne: user.id, $nin: user.fighters_seen},
			gender: {$in: user.matched_genders}, 
			matched_genders: user.gender , 
			weight_class: user.weight_class},
			function(err, nFighter) {
				if (err)
					res.send(err);  
				res.json(nFighter);
			}
		);
	});
}); 

router.get('/getAllFighters', function(req, res) {
	console.log("gets to the function");
	User.find(function(err, users) {
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
