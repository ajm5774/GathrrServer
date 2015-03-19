
var mongoose   = require('mongoose');
var User = require('./app/models/user');

exports.seedUsers = function seedUsers() {
    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            var testImages = ["https://placekitten.com/g/200/300", 
            "http://nattyornot.com/wp-content/uploads/2014/11/mike-tyson-huge-muscles-bodybuilding.jpg"];
			var genders = ["male", "female", "male"];
			var numUsers = 30;

			for(var i = 0; i < numUsers; i++)
			{
				var user = new User();
				user.id = "user" + i;
				user.name = "user" + i;
				user.gender = genders[i%genders.length];
				user.weight = (Math.random()*150.0 + 120);
				user.picture = testImages[i%testImages.length];
				user.history = [];
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