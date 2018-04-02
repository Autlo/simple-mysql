'use strict';

var mysql = require('mysql');
var debug = require('debug')('simple-mysql');
var qb = require('./QueryBuilder');

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
 * Disconnect database
 */
Connection.prototype.disconnect = function ()
{
    try {
        this.pool.end();
    } catch (e) {}
};

/**
 * Reset lost connection
 */
Connection.prototype.resetConnection = function ()
{
    this.disconnect();

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
 * @param {Object} criteria
 * @param {Object} orderBy
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.findBy = function (criteria, orderBy, table, callback)
{
    this.findByPaginated(criteria, orderBy, null, null, table, callback);
};

/**
 * @param {Object} criteria
 * @param {Object} orderBy
 * @param {String} table
 * @param {Number} limit
 * @param {Number} offset
 * @param {Function} callback(err, object)
 */
Connection.prototype.findByPaginated = function (criteria, orderBy, limit, offset, table, callback)
{
    this.query(qb.buildSelectQuery(criteria, orderBy, limit, offset, table), callback);
};

/**
 * @param {Object} orderBy
 * @param {String} table
 * @param {Function} callback
 */
Connection.prototype.findAll = function (orderBy, table, callback)
{
    this.findAllPaginated(orderBy, null, null, table, callback);
};

/**
 * @param {Object} orderBy
 * @param {Number} limit
 * @param {Number} offset
 * @param {String} table
 * @param {Function} callback
 */
Connection.prototype.findAllPaginated = function (orderBy, limit, offset, table, callback)
{
    this.query(qb.buildSelectQuery({}, orderBy, limit, offset, table), callback);
};

/**
 * @param {Object} criteria
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.findOneBy = function (criteria, table, callback)
{
    this.query(qb.buildSelectQuery(criteria, {}, null, null, table), returnOneOrNull(callback));
};

/**
 * @param {String} table
 * @param {Function} callback(err, count)
 */
Connection.prototype.count = function (table, callback)
{
    this.countBy({}, table, callback);
};

/**
 * @param {Object} criteria
 * @param {String} table
 * @param {Function} callback(err, count)
 */
Connection.prototype.countBy = function (criteria, table, callback)
{
    this.query(qb.buildCountQuery(criteria, table), function (err, rows) {
        if (err) return callback(err);

        callback(null, rows[0].count);
    });
};

/**
 * @param {Object} object
 * @param {String} table
 * @param {Function} callback(err, object)
 */
Connection.prototype.insert = function (object, table, callback)
{
    this.query(qb.buildInsertQuery(object, table), function (err, result) {
        if (err) return callback(err, null);

        object.id = result.insertId;

        callback(err, object);
    });
};

/**
 * @param {Object} criteria
 * @param {Object} object
 * @param {String} table
 * @param {Function} callback(err)
 */
Connection.prototype.update = function (criteria, object, table, callback)
{
    this.query(qb.buildUpdateQuery(criteria, object, table), callback);
};

/**
 * @param {Number} id
 * @param {String} table
 * @param {Function} callback(err)
 */
Connection.prototype.delete = function (id, table, callback)
{
    this.deleteBy({id: id}, table, callback);
};

/**
 * @param {Object} criteria
 * @param {String} table
 * @param {Function} callback(err)
 */
Connection.prototype.deleteBy = function (criteria, table, callback)
{
    this.query(qb.buildDeleteQuery(criteria, table), callback);
};

/**
 * @param {String} sql
 * @param {Function} callback(err, result)
 */
Connection.prototype.query = function (sql, callback)
{
    var self = this;

    debug('[%s] - %s', this.name, sql);

    this.pool.query(sql, function (err, result) {
        if (err) self._onError(err);

        callback(err, result);
    });
};

/**
 * @param {Object} connection
 * @private
 */
Connection.prototype._onConnection = function (connection)
{
    debug('[%s] - Connection connected as id %s.', this.name, connection.threadId);

    connection.query('SET time_zone = "+00:00";', function (err) {
        if (err) throw err;
    });
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
        default:
            break;
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
