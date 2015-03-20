var user = require('../lib/user');

exports['getWeightClass'] = function (test) {
    test.equal(user.getWeightClass(125), 'Flyweight');
    test.done();
};