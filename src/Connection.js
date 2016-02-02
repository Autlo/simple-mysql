'use strict';

var util = require('util');
var mysql = require('mysql');
var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * @param {Object} config
 * @param {String} name
 * @constructor
 */
function Connection(config, name)
{
    this.config = config;
    this.name = name;
    this.pool = null;
}

/**
 * Connect to database
 */
Connection.prototype.connect = function ()
{
    this.pool = mysql.createPool(this.config);

    this.pool.on('connection', this._onConnection.bind(this));
};

/**
 * Reset lost connection
 */
Connection.prototype.resetConnection = function ()
{
    try {
        this.pool.end();
    } catch (e) {}

    this.connect();
};

/**
 * @param {Number} id
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.find = function (id, table, callback)
{
    this.findOneBy({id: id}, table, callback);
};

/**
 * todo: add optional order by argument like: {name: 'ASC'}
 *
 * @param {Object} criteria
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.findBy = function (criteria, table, callback)
{
    this.query(this._buildSelectQuery(criteria, table), callback);
};

/**
 * todo: add optional order by argument like: {name: 'ASC'}
 *
 * @param {String} table
 * @param {Function} callback
 */
Connection.prototype.findAll = function (table, callback)
{
    var sql = util.format(
        'SELECT * FROM %s',
        this._escapeField(table)
    );

    this.query(sql, callback);
};

/**
 * todo: add optional order by argument like: {name: 'ASC'}
 *
 * @param {Object} criteria
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.findOneBy = function (criteria, table, callback)
{
    this.query(this._buildSelectQuery(criteria, table), returnOneOrNull(callback));
};

/**
 * todo: change API to (object, table, callback) to be more similar to other methods
 *
 * @param {String} table
 * @param {Object} object
 * @param {Function} callback(err, object)
 */
Connection.prototype.insertObject = function (table, object, callback)
{
    var sql = 'INSERT INTO ' + this._escapeField(table) + ' (`' + Object.keys(object).join('`, `') + '`) VALUES ';
    var values = [];

    for (var key in object) {
        if (!object.hasOwnProperty(key)) continue;

        values.push(this._sanitizeValue(object[key]));
    }

    sql += '(' + values.join(', ') + ')';

    this.query(sql, function (err, result) {
        if (err) return callback(err, null);

        object.id = result.insertId;
        callback(err, object);
    });
};

/**
 * todo: user criteria instead of id
 * todo: change API to (criteria, object, table, callback) to be more similar to other methods
 *
 * @param {Number} id
 * @param {String} table
 * @param {Object} object
 * @param {Function} callback(err)
 */
Connection.prototype.updateObject = function (id, table, object, callback)
{
    var sql = 'UPDATE ' + this._escapeField(table) + ' SET ',
        valueCount = 0;

    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (valueCount > 0) {
                sql += ', ';
            }

            sql += this._escapeField(key) + ' = ' + this._sanitizeValue(object[key]);
        }

        valueCount++;
    }

    sql += ' WHERE ' + this._escapeField('id') + ' = ' + id;

    this.query(sql, callback);
};

/**
 * @param {Number} id
 * @param {String} table
 * @param {Function} callback(err)
 */
Connection.prototype.delete = function (id, table, callback)
{
    this.deleteBy(id, 'id', table, callback);
};

/**
 * todo: use criteria instead of id
 *
 * @param {String|Number} value
 * @param {String} field
 * @param {String} table
 * @param {Function} callback(err)
 */
Connection.prototype.deleteBy = function (value, field, table, callback)
{
    var sql = util.format(
        'DELETE FROM %s WHERE %s %s %s',
        this._escapeField(table),
        this._escapeField(field),
        typeof value === 'number' ? '=' : 'LIKE',
        this._sanitizeValue(value)
    );

    this.query(sql, callback);
};

/**
 * @param {String} sql
 * @param {Function} callback(err, result)
 */
Connection.prototype.query = function (sql, callback)
{
    var self = this;

    this.pool.query(sql, function (err, result) {
        if (err) self._onError(err);

        callback(err, result);
    });
};

/**
 *
 * @param {Object} criteria
 * @param {String} table
 * @returns {String}
 * @private
 */
Connection.prototype._buildSelectQuery = function (criteria, table)
{
    var sql = 'SELECT * FROM ' + this._escapeField(table) + ' WHERE ';
    var n = 0;

    for (var key in criteria) {
        if (!criteria.hasOwnProperty(key)) {
            continue;
        }

        if (n !== 0) {
            sql += ' AND ';
        }

        sql += this._escapeField(key);

        var value = criteria[key];
        if (value === null) {
            sql += ' IS NULL';
        } else if (typeof value === 'number') {
            sql += ' = ' + value;
        } else {
            sql += ' LIKE ' + this._sanitizeValue(value);
        }

        n += 1;
    }

    return sql;
};

/**
 * @param value
 * @return {String}
 * @private
 */
Connection.prototype._sanitizeValue = function (value)
{
    if (value !== null && typeof value === 'object' && value._isAMomentObject) {
        value = value.format(dateTimeFormat);
    }

    if (value !== null && typeof value === 'object') {
        // todo: use safe stringify
        value = JSON.stringify(value);
    }

    return this.pool.escape(value);
};

/**
 * @param {String} name
 * @returns {string}
 * @private
 */
Connection.prototype._escapeField = function (name)
{
    return '`' + name + '`';
};

/**
 * @param {Object} connection
 * @private
 */
Connection.prototype._onConnection = function (connection)
{
    this._debug('Connection connected as id ' + connection.threadId + '.');

    connection.query('SET time_zone = "+00:00"');
};

/**
 * @param {Error} err
 * @private
 */
Connection.prototype._onError = function (err)
{
    switch (err.code) {
        case 'PROTOCOL_CONNECTION_LOST':
            exports.connect();

            break;
        case 'EPIPE':
            setTimeout(this.resetConnection.bind(this), 100);
            break;
        case 'ECONNREFUSED':
            setTimeout(this.resetConnection.bind(this), 100);
            break;
        case 'ER_DUP_ENTRY':
        case 'ER_BAD_NULL_ERROR':
            break;
        default:
            throw err;
    }
};

/**
 * @param {String} msg
 * @private
 */
Connection.prototype._debug = function (msg)
{
    // todo: fixme
    return;

    if (this.debug) {
        util.log(util.format('[Debug][Connection][%s] %s', this.name, msg));
    }
};

/**
 * Returns object if and only if one row is found, if more than 1 row is found, returns error.
 *
 * @param {Function} callback
 * @returns {Function}
 */
function returnOneOrNull(callback)
{
    return function (err, rows)
    {
        if (err) return callback(err);

        if (rows.length === 0) {
            return callback(null, null);
        }

        if (rows.length === 1) {
            return callback(null, rows[0]);
        }

        if (rows.length > 1) {
            return callback(new Error('Multiple rows found.'));
        }
    }
}

module.exports = Connection;
