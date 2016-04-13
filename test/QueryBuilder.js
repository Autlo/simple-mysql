'use strict';

var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');
var qb = require('../src/QueryBuilder');

describe('QueryBuilder', function () {

    describe('#buildSelectQuery', function () {

        it('Should return SELECT statement without WHERE condition when criteria is empty', function () {
            assert.equal(
                qb.buildSelectQuery({}, {}, 'table'),
                'SELECT * FROM `table`'
            );
        });

        it('Should use correct comparison with string', function () {
            assert.equal(
                qb.buildSelectQuery({field: 'value'}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` LIKE \'value\''
            );
        });

        it('Should use correct comparison with integer', function () {
            assert.equal(
                qb.buildSelectQuery({field: 1}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 1'
            );
        });

        it('Should use correct comparison with floating point number', function () {
            assert.equal(
                qb.buildSelectQuery({field: 4.3}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 4.3'
            );
        });

        it('Should build correct SQL with multiple criteria', function () {
            assert.equal(
                qb.buildSelectQuery({field: 4.3, field2: 'demo', field3: 'field'}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 4.3 AND `field2` LIKE \'demo\' AND `field3` LIKE \'field\''
            );
        });

        it('Should use IS NULL when criteria value is null', function () {
            assert.equal(
                qb.buildSelectQuery({field: 1, field2: null}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 1 AND `field2` IS NULL'
            );
        });

        it('Should use IN when criteria value is array', function () {
            assert.equal(
                qb.buildSelectQuery({field: 1, field2: [1, 'value', false]}, {}, 'table'),
                'SELECT * FROM `table` WHERE `field` = 1 AND `field2` IN (1, \'value\', false)'
            );
        });

        it('Should add correct ORDER BY statement', function () {
            assert.equal(
                qb.buildSelectQuery({}, {field: 'DESC'}, 'table'),
                'SELECT * FROM `table` ORDER BY `field` DESC'
            );
        });

        it('Should add correct ORDER BY statement with minus sign', function () {
            assert.equal(
                qb.buildSelectQuery({}, {'-field': 'DESC'}, 'table'),
                'SELECT * FROM `table` ORDER BY -`field` DESC'
            );
        });

        it('Should add multiple ORDER BY statements', function () {
            assert.equal(
                qb.buildSelectQuery({}, {field: 'DESC', field2: 'ASC'}, 'table'),
                'SELECT * FROM `table` ORDER BY `field` DESC, `field2` ASC'
            );
        });

        it('Should accept lowercase order', function () {
            assert.equal(
                qb.buildSelectQuery({}, {field: 'desc', field2: 'asc'}, 'table'),
                'SELECT * FROM `table` ORDER BY `field` DESC, `field2` ASC'
            );
        });

        it('Should throw error if invalid order is provided', function () {
            assert.throws(function () {
                qb.buildSelectQuery({}, {field: 'order'}, 'table')
            }, Error);
        });

    });

    describe('#buildInsertQuery', function () {

        it('Should return correct query with single field and value pair', function () {
            var object = {
                lala: 1
            };

            assert.equal(
                qb.buildInsertQuery(object, 'table'),
                'INSERT INTO `table` (`lala`) VALUES (1)'
            );
        });

        it('Should return correct query with multiple fields and values', function () {
            var object = {
                lala: 1,
                test2: 'demo'
            };

            assert.equal(
                qb.buildInsertQuery(object, 'table'),
                'INSERT INTO `table` (`lala`, `test2`) VALUES (1, \'demo\')'
            );
        });

    });

    describe('#buildUpdateQuery', function () {

        it('Should return correct query with single field and value pair', function () {
            var object = {
                lala: 1
            };

            assert.equal(
                qb.buildUpdateQuery({demo: 3}, object, 'table'),
                'UPDATE `table` SET `lala` = 1 WHERE `demo` = 3'
            );
        });

        it('Should return correct query with multiple fields and values', function () {
            var object = {
                lala: 1,
                test2: 'demo'
            };

            assert.equal(
                qb.buildUpdateQuery({demo: 3, test: 4}, object, 'table'),
                'UPDATE `table` SET `lala` = 1, `test2` = \'demo\' WHERE `demo` = 3 AND `test` = 4'
            );
        });

    });

    describe('#buildDeleteQuery', function () {

        it('Should return correct query', function () {
            assert.equal(
                qb.buildDeleteQuery({id: 4}, 'table'),
                'DELETE FROM `table` WHERE `id` = 4'
            );
        });

    });

    describe('#sanitizeValue', function () {

        it('Should escape strings', function () {
            assert.equal(qb.sanitizeValue(';DELETE FROM test;'), '\';DELETE FROM test;\'');
        });

        it('Should correctly format a Moment object', function () {
            var value = moment('02-02-2016 22:34', 'DD-MM-YYYY HH:mm');

            assert.equal(qb.sanitizeValue(value), '\'2016-02-02 22:34:00\'');
        });

        it('Should stringify Object', function () {
            var value = {test: 'demo'};

            assert.equal(qb.sanitizeValue(value), '\'{\\"test\\":\\"demo\\"}\'');
        });

        it('Should stringify Object with circular reference', function () {
            var value = {demo: 1};
            value.circular = value;

            assert.equal(qb.sanitizeValue(value), '\'{\\"demo\\":1,\\"circular\\":\\"[Circular ~]\\"}\'')
        });

    });

    describe('#escapeField', function () {

        it('Should escape field', function () {
            var field = 'table_name';

            assert.equal(qb.escapeField(field), '`table_name`');
        });

    });

    describe('#stringifyArray', function () {

        it('Should stringify array', function () {
            var array = [0, '0', false, null, [], {}];

            assert.equal(qb.stringifyArray(array), '0, \'0\', false, NULL, \'[]\', \'{}\'');
        });

    });

});
