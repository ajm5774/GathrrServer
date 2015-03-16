var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	id: String,
	name: String,
	gender: String,
	weight: Number,
	sex: String,
	picture: String,
	weight_class: String,
	history: [Schema.Types.Mixed],
	fighters_seen: [String]
});

module.exports = mongoose.model('User', UserSchema);