
var mongoose   = require('mongoose');
var User = require('./app/models/user');

exports.seedUsers = function seedUsers(dropDocs) {
	console.log("got to the seed method");

	if(dropDocs === true)
	{
		User.remove({}, function(err){
			if(err)
				console.log(err);
		});
	}

    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
        	console.log("creating docs");
            var testImages = ["https://placekitten.com/g/200/300", 
            "http://nattyornot.com/wp-content/uploads/2014/11/mike-tyson-huge-muscles-bodybuilding.jpg"];
			var genders = ["male", "male", "female"];
			var matchedGenders = [["male"], ["male", "female"], ["female"]];
			var numUsers = 50;
			var history = {
				"User2" : {
					Date: "3/30/2015",
					ELOChange: "+4",
					Outcome: "Win"
				},
				"User4" : {
					Date: "3/31/2015",
					ELOChange: "+2",
					Outcome: "Loss"
				},
			};

			for(var i = 0; i < numUsers; i++)
			{
				var user = new User();
				user.id = "user" + i;
				user.name = "user" + i;
				user.matched_genders = matchedGenders[i%genders.length];
				user.gender = genders[i%genders.length];
				user.weight = (Math.random()*150.0 + 120);
				user.picture = testImages[i%testImages.length];
				user.history = history;
				user.fighters_seen = [];
				user.weight_class = User.getWeightClass(user.weight);
				user.save(function(err) {
					if (err)
						return console.log(err);
				});
			}
			return console.log("Users DB seeded!")
        }
    });
}