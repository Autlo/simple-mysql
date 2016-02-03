'use strict';

var assert = require('chai').assert;
var wrapper = require('../src/Wrapper');

describe('Wrapper', function () {

    describe('#createConnection', function () {

        it('Should create new Connection object and return it', function () {
            var connection = wrapper.createConnection({}, 'test');

            assert.typeOf(connection, 'Object');
            assert.equal(connection.name, 'test');
        });

    });

    describe('#getConnection', function () {

        it('Should return null when connection with given name is not found', function () {
            assert.equal(wrapper.getConnection('no'), null);
        });

        it('Should return connection with correct name', function () {
            assert.equal(wrapper.getConnection('test').name, 'test');
        });

    });

    describe('#closeConnection', function () {

        it('Should remove connection', function () {
            wrapper.closeConnection('test');

            assert.equal(wrapper.getConnection('test'), null);
        });

    });

});
