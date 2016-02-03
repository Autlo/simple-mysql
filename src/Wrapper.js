'use strict';

var Connection = require('./Connection');
var connections = {};

/**
 * Create a new connection and return it.
 *
 * @param {Object} config
 * @param {String} name
 * @returns {Connection}
 */
module.exports.createConnection = function (config, name)
{
    if (!connections[name]) {
        connections[name] = new Connection(config, name);
        connections[name].connect();
    }

    return connections[name];
};

/**
 * @param {String} name
 * @returns {Connection}
 */
module.exports.getConnection = function (name)
{
    if (connections[name]) {
        return connections[name];
    }

    return null;
};

/**
 * Disconnects connection and deletes it
 *
 * @param {String} name
 */
module.exports.closeConnection = function (name)
{
    if (connections[name]) {
        connections[name].disconnect();

        delete connections[name];
    }
};

