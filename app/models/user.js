var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var exports = module.exports = {};

var UserSchema   = new Schema({
	id: String,
	name: String,
	matched_genders: [String],
	gender: String,
	weight: Number,
	sex: String,
	picture: String,
	weight_class: String,
	history: [Schema.Types.Mixed],
	fighters_seen: [String]
});

module.exports = mongoose.model('User', UserSchema);

module.exports.getWeightClass = function(weight)
{
	if(weight <= 125)
		return "Flyweight";
	else if(weight <= 135)
		return "Bantamweight";
	else if(weight <= 145)
		return "Featherweight";
	else if(weight <= 155)
		return "Lightweight";
	else if(weight <= 170)
		return "Welterweight";
	else if(weight <= 185)
		return "Middleweight";
	else if(weight <= 205)
		return "Light Heavyweight";
	else if(weight <= 265)
		return "Heavyweight";
	else
		return "Super Heavyweight"
}
