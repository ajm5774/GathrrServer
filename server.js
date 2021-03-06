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

var sessions = {};

var mongoose   = require('mongoose');
var seed     = require('./seed');
mongoose.connect('mongodb://gathrr:gathrrPass!1@ds041188.mongolab.com:41188/gathrr',
function(){
	seed.seedUsers(false);
}); // connect to our database
var User     = require('./app/models/user');

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


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

router.route('/login')
	.post(function(req, res) {
		User.findOne({id: req.body.id}, function(err, user) {
			token = {};
			if(user.password == req.body.password){
				token['session'] = req.body.id.hashCode();
				sessions[token['session']] = true;
				if (err)
					res.send(err);
				res.json(token);
			}else{
				res.send(403);
			}
		});
	});
	
router.route('/notifications')
	.get(function(req,res){
		if(sessions[req.query.session]){
			User.findOne({id: req.query.id}, function(err, user) {
				if(err)
					res.send(err);
				res.json(user.notifications);
			});
		}else{
			res.send(403);
		}
	});

router.route('/addUser')
	.post(function(req, res) {

		var user = new User();
		user.id = req.body.id;
		user.password = req.body.password;
		user.name = req.body.name;  
		user.weight = req.body.weight;  
		user.sex = req.body.sex;  
		user.picture = req.body.picture;  
		user.weight_class = User.getWeightClass(user.weight);
		user.elo = 1200;
		user.history = [];  
		user.would_fight = []
		user.notifications = []
		user.fighters_seen = [];  

		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'User created!' });
		});
	});
	
router.route('/addMatch')
	.post(function(req, res) {
		User.findOne({id: req.body.id}, function(err, user) {
			User.findOne({id: req.body.matched}, function(err, matched) {
				user.would_fight.push(req.body.matched)
				if(matched.would_fight.indexOf(req.body.id) >= 0){
					n_entry = {}
					n_entry['date'] = Date();
					n_entry['id'] = req.body.id;
					n_entry['seen'] = false;
					matched.notifications.push(n_entry);
					
					n_entry2 = {}
					n_entry2['date'] = Date();
					n_entry2['id'] = req.body.matched;
					n_entry2['seen'] = false;
					user.notifications.push(n_entry2);
				}
				matched.save(function(err) {
					if (err)
						res.send(err);
				});
				
				user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Match Added!' });
				});
				
			});
		});
});	
	
router.route('/addHistory')
	.post(function(req, res) {

		User.findOne({id: req.body.id}, function(err, user) {
		
			history_entry = {};
			history_entry["Outcome"]=req.body.outcome;
			history_entry["ELOChange"]=req.body.elo_change;
			history_entry["Date"]=req.body.date;
			
			user.history[req.body.id_fought] = history_entry;
			
			if(history_entry["ELOChange"][0]=="+"){
				user.elo += parseInt(req.body.elo_change.substring(1,req.body.elo_change.length));
			}else{
				user.elo -= parseInt(req.body.elo_change.substring(1,req.body.elo_change.length));
			}
			
			user.markModified("history");
			user.markModified("elo");

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'History Updated!' });
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
		if(sessions[req.query.session]==true){
			User.findOne({id: req.query.id}, function(err, user) {
				if (err)
					res.send(err);
				res.json(user);
			});
		}else{
			res.send(403);
		}
	})

	// update the User with this id
	.put(function(req, res) {
		if(session[req.body.session]){
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
		}else{
			res.send(403);
		}
	})

	// delete the user with this id
	.delete(function(req, res) {
		if(sessions[req.query.session]==true){
			User.remove({id: req.query.id}, function(err, user) {
				if (err)
					res.send(err);
	
				res.json({ message: 'Successfully deleted' });
			});
		}else{
			res.send(403);
		}
	});

router.route('/addSeen')

	.post(function(req, res) {
		if(sessions[req.query.session]==true){
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
		}else{
			res.send(403);
		}
		
	});
	
router.route('/resetSeen')

	.post(function(req, res) {
		if(sessions[req.query.session]==true){
		User.findOne({id: req.body.id}, function(err, user) {

			user.fighters_seen = [];

			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Fighters Seen reset!' });
			});

		});
		}else{
			res.send(403);
		}
	});

router.get('/reseed', function(req, res) {
		seed.seedUsers(true);
		res.json("Database reseeded");
});

router.get('/getNextFighter', function(req, res) {
	if(sessions[req.query.session]==true){
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
	}else{
		res.send(403);
	}
}); 


router.get('/getNotSeenFighters', function(req, res) {
	if(sessions[req.query.session]==true){
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
	}else{
	res.send(403);
	}
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
