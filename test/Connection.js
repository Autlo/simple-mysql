'use strict';

var assert = require('chai').assert;
var Connection = require('../src/Connection');
var mysql = require('mysql');
var Pool = require('../node_modules/mysql/lib/Pool');
var PoolConfig = require('../node_modules/mysql/lib/PoolConfig');
var sinon = require('sinon');

describe('Connection', function () {
    var connection = null;

    before(function () {
        sinon.stub(mysql, 'createPool').returns(new Pool({config: new PoolConfig({})}));

        connection = new Connection({}, 'test');
    });

    describe('#connect', function () {

        it('Should create pool', function () {
            connection.connect();

            assert.typeOf(connection.pool, 'object');
        });

    });

    describe('#find', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM `demo` WHERE `id` = 1');

                callback(null, []);
            });

            connection.find(1, 'demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        it('Should yield database error if one occurs', function (done) {
            var error = new Error('DB error');

            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM `demo` WHERE `id` = 1');

                callback(error);
            });

            connection.find(1, 'demo', function (err) {
                assert.deepEqual(err, error);

                done();
            });
        });

        it('Should yield error when multiple objects are found', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                callback(null, [{}, {}]);
            });

            connection.find(1, 'demo', function (err, object) {
                assert.isNotNull(err);
                assert.equal(err.message, 'Multiple rows found.');

                assert.isUndefined(object);

                done();
            });
        });

        it('Should yield null when no object are found', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                callback(null, []);
            });

            connection.find(1, 'demo', function (err, object) {
                assert.isNull(err);
                assert.isNull(object);

                done();
            });
        });

        it('Should yield object', function (done) {
            var expected = {
                prop: 203
            };

            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                callback(null, [expected]);
            });

            connection.find(1, 'demo', function (err, object) {
                assert.isNull(err);
                assert.deepEqual(object, expected);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#findBy', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM `demo` WHERE `demo_field` LIKE \'test\'');

                callback(null, []);
            });

            connection.findBy({demo_field: 'test'}, 'demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#findAll', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM `demo`');

                callback(null, []);
            });

            connection.findAll('demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#findOneBy', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM `demo` WHERE `demo_field` LIKE \'test\'');

                callback(null, []);
            });

            connection.findOneBy({demo_field: 'test'}, 'demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#inserObject', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'INSERT INTO `demo` (`lala`, `test2`) VALUES (1, \'demo\')');

                callback(null, {insertId: 1});
            });

            connection.insertObject('demo', {lala: 1, test2: 'demo'}, function (err) {
                assert.isNull(err);

                done();
            });
        });

        it('Should yield object with id', function (done) {
            var object = {
                param: 23
            };

            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                callback(null, {insertId: 23543});
            });

            connection.insertObject('demo', object, function (err, result) {
                assert.isNull(err);

                object.id = 23543;

                assert.deepEqual(result, object);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#updateObject', function () {

        it('Should compose correct SQL with one property', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'UPDATE `demo` SET `lala` = 1 WHERE `id` = 1');

                callback(null);
            });

            connection.updateObject(1, 'demo', {lala: 1}, function (err) {
                assert.isNull(err);

                done();
            });
        });

        it('Should compose correct SQL with multiple properties', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'UPDATE `demo` SET `lala` = 1, `test2` = \'demo\' WHERE `id` = 1');

                callback(null);
            });

            connection.updateObject(1, 'demo', {lala: 1, test2: 'demo'}, function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#delete', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'DELETE FROM `demo` WHERE `id` = 1');

                callback(null);
            });

            connection.delete(1, 'demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#deleteBy', function () {

        it('Should compose correct SQL', function (done) {
            sinon.stub(Connection.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'DELETE FROM `demo` WHERE `demo` LIKE \'demo\'');

                callback(null);
            });

            connection.deleteBy('demo', 'demo', 'demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        afterEach(function (done) {
            Connection.prototype.query.restore();

            done();
        });

    });

    describe('#query', function () {

        it('Should call Pool#query with correct SQL', function (done) {

            sinon.stub(Pool.prototype, 'query', function (sql, callback) {
                assert.equal(sql, 'SELECT * FROM demo');

                callback(null);
            });

            connection.query('SELECT * FROM demo', function (err) {
                assert.isNull(err);

                done();
            });
        });

        it('Should throw error when unknown error is returned from Pool#query', function () {
            var error = new Error('Error!');

            sinon.stub(Pool.prototype, 'query', function (sql, callback) {
                callback(error);
            });

            assert.throws(connection.query, Error);
        });

        afterEach(function (done) {
            Pool.prototype.query.restore();

            done();
        });

    });

    describe('#_buildSelectQuery', function () {

        it('Should use correct comparison with string', function () {
            assert.deepEqual(
                connection._buildSelectQuery({field: 'value'}, 'table'),
                'SELECT * FROM `table` WHERE `field` LIKE \'value\''
            );
        });

        it('Should use correct comparison with integer', function () {
            assert.deepEqual(
                connection._buildSelectQuery({field: 1}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 1'
            );
        });

        it('Should use correct comparison with floating point number', function () {
            assert.deepEqual(
                connection._buildSelectQuery({field: 4.3}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 4.3'
            );
        });

        it('Should build correct SQL with multiple criteria', function () {
            assert.deepEqual(
                connection._buildSelectQuery({field: 4.3, field2: 'demo', field3: 'field'}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 4.3 AND `field2` LIKE \'demo\' AND `field3` LIKE \'field\''
            );
        });

    });
});
