[![Build Status](https://travis-ci.org/Autlo/simple-mysql.svg?branch=master)](https://travis-ci.org/Autlo/simple-mysql)
[![Coverage Status](https://coveralls.io/repos/github/Autlo/simple-mysql/badge.svg?branch=master)](https://coveralls.io/github/Autlo/simple-mysql?branch=master)

# simple-mysql
Wrapper for [mysql](https://www.npmjs.com/package/mysql) to simplify common queries and enable connection to multiple databases.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Connection to single database](#connection-to-single-database)
  - [Connection to multiple databases](#connection-to-multiple-databases)
- [Provided Functions](#provided-functions)
  - [`find`](#findid-table-callback)
  - [`findAll`](#findallorderby-table-callback)
  - [`findAllPaginated`](#findallpaginatedorderby-limit-offset-table-callback)
  - [`findBy`](#findbycriteria-orderby-table-callback)
  - [`findByPaginated`](#findbypaginatedcriteria-orderby-limit-offset-table-callback)
  - [`findOneBy`](#findonebycriteria-orderby-table-callback)
  - [`count`](#counttable-callback)
  - [`countBy`](#countcriteria-table-callback)
  - [`insert`](#insertobject-table-callback)
  - [`update`](#updatecriteria-object-table-callback)
  - [`delete`](#deleteid-table-object)
  - [`deleteBy`](#deletebycriteria-table-callback)
  - [`query`](#querysql-callback)
- [Configuration options](#configuration-options)
- [Debugging](#debugging)
- [Changelog](#changelog)

## Install

Installs `simple-mysql` to your project and adds it to `package.json` file as a dependency.


```sh
$ npm install simple-mysql --save
```

## Usage

#### Connection to single database

**Create a new connection**

```js
var mysql = require('simple-mysql');

var connection = mysql.createConnection({
    host: 'my-host',
    user: 'my-user',
    password: 'my-super-secret-pwd',
    database: 'my-database'
}, 'default');
```

**Retrieve the same connection in another file and make a simple database query**

```js
var mysql = require('simple-mysql');

var connection = mysql.getConnection('default');

connection.findAll('user', function (err, users) {
    // err - error if one has occurred
    // users - an array of all user objects in table user
});
```

**Closing the connection**
```js
var mysql = require('simple-mysql');

connection.closeConnection('default');
```

#### Connection to multiple databases

TODO

## Provided functions

### find(id, table, callback)

Finds row from database with the field id equal to `id` from `table`. 

**Arguments**

* `id` - ID of the row.
* `table` - Name of table in database.
* `callback(err, object)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.find(23, function (err, object) {
    // err is equal to error from database if there were any
    // object is equal to the row from database or null when row with id 23 was not found
});
```

---

### findAll(orderBy, table, callback)

Finds all rows from given `table`, ordered by `orderBy` if present 

**Arguments**

* `orderBy` - Key-value pairs for order by condition.
* `table` - Name of table in database.
* `callback(err, rows)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.findAll({age: 'DESC'}, 'user', function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the rows from database or an 
    // empty array when there where no results
});
```

---

### findAllPaginated(orderBy, limit, offset, table, callback)

Finds all rows from given `table`, ordered by `orderBy` if present 

**Arguments**

* `orderBy` - Key-value pairs for order by condition.
* `table` - Name of table in database.
* `limit` - Limit for pagination (items per page).
* `offset` - Offset for pagination (from where to return).
* `callback(err, rows)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.findAll({age: 'DESC'}, 10, 60, 'user', function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the rows from database or an 
    // empty array when there where no results
});
```

---

### findBy(criteria, orderBy, table, callback)

Finds rows from database where key is equal to value from `table`. Uses AND condition with multiple criteria. 

**Arguments**

* `criteria` - Key-value pairs for where condition.
* `orderBy` - Key-value pairs for order by condition.
* `table` - Name of table in database.
* `callback(err, rows)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connection is a Connection object and connected to database
connection.findBy({name: 'John'}, {age: 'DESC'}, 'user', function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the row from database or an 
    // empty array when there where no results
});
```

---

### findByPaginated(criteria, orderBy, limit, offset, table, callback)

Finds rows from database where key is equal to value from `table`. Uses AND condition with multiple criteria. 

**Arguments**

* `criteria` - Key-value pairs for where condition.
* `orderBy` - Key-value pairs for order by condition.
* `limit` - Limit for pagination (items per page).
* `offset` - Offset for pagination (from where to return).
* `table` - Name of table in database.
* `callback(err, rows)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connection is a Connection object and connected to database
connection.findBy({name: 'John'}, {age: 'DESC'}, 10, 60, 'user', function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the row from database or an 
    // empty array when there where no results
});
```

---

### findOneBy(criteria, orderBy, table, callback)

Finds row from database according to the `criteria` from `table`. Will throw an `Error`, when multiple rows are found.

**Arguments**

* `criteria` - Key-value pairs for where condition.
* `table` - Name of table in database.
* `callback(err, object)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.find(23, function (err, object) {
    // err is equal to error from database if there were any
    // object is equal to the row from database or null when row with id 23 was not found
});
```

---

### count(table, callback)

Count all rows in`table`.

**Arguments**

* `table` - Name of table in database.
* `callback(err, count)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.count('table', function (err, count) {
    // err is equal to error from database if there were any
    // count is an integer
});
```

---

### countBy(table, callback)

Count all rows according to `criteria` in `table`.

**Arguments**

* `criteria` - Key-value pairs for where condition.
* `table` - Name of table in database.
* `callback(err, count)` - Callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.count({name: 'John'}, 'table', function (err, count) {
    // err is equal to error from database if there were any
    // count is an integer
});
```

---

### insert(object, table, callback)

TODO

---

### update(criteria, object, table, callback)

TODO

---

### delete(id, table, object)

TODO

---

### deleteBy(criteria, table, callback)

TODO

---

### query(sql, callback)

TODO

---

## Configuration options

This module's connection accepts the same configuration options as [mysql](https://www.npmjs.com/package/mysql) module. Read more about [connection options](https://www.npmjs.com/package/mysql#connection-options) and [pool specific options](https://www.npmjs.com/package/mysql#pool-options).

## Debugging

[Debug library](https://www.npmjs.com/package/debug) is used for debugging. To activate debugging for this library run
your service with environment variable **DEBUG**. For example: `DEBUG:simple-mysql node service.js`.

## Changelog

Changelog is available under [GitHub releases section](https://github.com/Autlo/simple-mysql/releases).
