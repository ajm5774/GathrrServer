var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
	id: String,
	name: String,
	weight: double,
	sex: String,
	picture: String,
	history: [],
	fighters_seen: [String]
});

module.exports = mongoose.model('Bear', BearSchema);