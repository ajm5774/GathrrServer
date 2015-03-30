var user = require('../app/models/user');

exports['getWeightClass'] = function (test) {
    test.equal(user.getWeightClass(125), 'Flyweight');
    test.equal(user.getWeightClass(135), 'Bantamweight');
    test.equal(user.getWeightClass(145), 'Featherweight');
    test.equal(user.getWeightClass(155), 'Lightweight');
    test.equal(user.getWeightClass(170), 'Welterweight');
    test.equal(user.getWeightClass(185), 'Middleweight');
    test.equal(user.getWeightClass(205), 'Light Heavyweight');
    test.equal(user.getWeightClass(265), 'Heavyweight');
    test.equal(user.getWeightClass(266), 'Super Heavyweight');
    test.done();
};