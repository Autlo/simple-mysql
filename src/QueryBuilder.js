'use strict';

var util = require('util');
var mysql = require('mysql');
var stringify = require('json-stringify-safe');
var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * @param {Object} criteria
 * @param {Object} orderBy
 * @param {Number} limit
 * @param {Number} offset
 * @param {String} table
 * @returns {String}
 */
module.exports.buildSelectQuery = function (criteria, orderBy, limit, offset, table)
{
    return util.format(
        'SELECT * FROM %s%s%s%s',
        this.escapeField(table),
        this.buildWherePart(criteria),
        this.buildOrderByPart(orderBy),
        this.buildPaginationPart(limit, offset)
    );
};

/**
 * @param {Object} criteria
 * @param {String} table
 * @returns {String}
 */
module.exports.buildCountQuery = function (criteria, table)
{
    return util.format(
        'SELECT COUNT(*) AS count FROM %s%s',
        this.escapeField(table),
        this.buildWherePart(criteria)
    );
};

/**
 * @param {Object} object
 * @param {String} table
 * @returns {String}
 */
module.exports.buildInsertQuery = function (object, table)
{
    var values = [];

    for (var key in object) {
        if (!object.hasOwnProperty(key)) continue;

        values.push(this.sanitizeValue(object[key]));
    }

    return util.format(
        'INSERT INTO %s (`%s`) VALUES (%s)',
        this.escapeField(table),
        Object.keys(object).join('`, `'),
        values.join(', ')
    );
};

/**
 * @param {Object} criteria
 * @param {Object} object
 * @param {String} table
 */
module.exports.buildUpdateQuery = function (criteria, object, table)
{
    var sql = 'UPDATE ' + this.escapeField(table) + ' SET ';
    var valueCount = 0;

    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (valueCount > 0) {
                sql += ', ';
            }

            sql += this.escapeField(key) + ' = ' + this.sanitizeValue(object[key]);
        }

        valueCount++;
    }

    sql += this.buildWherePart(criteria);

    return sql;
};

/**
 * @param {Object} criteria
 * @param {String} table
 */
module.exports.buildDeleteQuery = function (criteria, table)
{
    return util.format(
        'DELETE FROM %s%s',
        this.escapeField(table),
        this.buildWherePart(criteria)
    );
};

/**
 * @param {Object} criteria
 * @returns {String}
 */
module.exports.buildWherePart = function (criteria)
{
    var sql = '';

    if (Object.keys(criteria).length !== 0) {
        var n = 0;

        sql += ' WHERE ';

        for (var key in criteria) {
            if (!criteria.hasOwnProperty(key)) continue;

            if (n !== 0) {
                sql += ' AND ';
            }

            sql += this.escapeField(key);

            var value = criteria[key];
            if (value === null) {
                sql += ' IS NULL';
            } else if (typeof value === 'number') {
                sql += ' = ' + value;
            } else if (value instanceof Array) {
                sql += ' IN (' + this.stringifyArray(value) + ')';
            } else {
                sql += ' LIKE ' + this.sanitizeValue(value);
            }

            n += 1;
        }
    }

    return sql;
};

/**
 *
 * @param {Number} limit
 * @param {Number} offset
 * @returns {String}
 */
module.exports.buildPaginationPart = function (limit, offset)
{
    var sql = '';

    if (limit !== null && offset !== null) {
        limit = Number(limit);
        offset = Number(offset);

        sql += ' LIMIT ' + limit + ' OFFSET ' + offset;
    }

    return sql;
};

/**
 * @param {Object} orderBy
 * @returns {String}
 */
module.exports.buildOrderByPart = function (orderBy)
{
    var sql = '';

    if (Object.keys(orderBy).length !== 0) {
        var i = 0;

        sql += ' ORDER BY ';

        for (var field in orderBy) {
            if (!orderBy.hasOwnProperty(field)) continue;

            if (i !== 0) {
                sql += ', ';
            }

            sql += this.escapeField(field);

            var order = orderBy[field];
            var orderAdded = false;
            if (order === 'desc' || order === 'DESC') {
                sql += ' DESC';
                orderAdded = true;
            }

            if (order === 'asc' || order === 'ASC') {
                sql += ' ASC';
                orderAdded = true;
            }

            if (!orderAdded) {
                throw new Error('Order must be ASC or DESC');
            }

            i++;
        }
    }

    return sql;
};

/**
 * @param {Array} array
 * @returns {String}
 */
module.exports.stringifyArray = function (array)
{
    var arrayString = '';

    for (var i in array) {
        if (!array.hasOwnProperty(i)) continue;

        arrayString += this.sanitizeValue(array[i]);

        if (i != array.length - 1) arrayString += ', ';
    }

    return arrayString;
};

/**
 * @param value
 * @return {String}
 */
module.exports.sanitizeValue = function (value)
{
    if (value !== null && typeof value === 'object' && value._isAMomentObject) {
        value = value.format(dateTimeFormat);
    }

    if (value !== null && typeof value === 'object') {
        value = stringify(value);
    }

    return mysql.escape(value);
};

/**
 * @param {String} name
 * @returns {string}
 */
module.exports.escapeField = function (name)
{
    return '`' + name + '`';
};
