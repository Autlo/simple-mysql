[![Build Status](https://travis-ci.org/Autlo/simple-mysql.svg?branch=master)](https://travis-ci.org/Autlo/simple-mysql)
[![Coverage Status](https://coveralls.io/repos/github/Autlo/simple-mysql/badge.svg?branch=master)](https://coveralls.io/github/Autlo/simple-mysql?branch=master)

> This module is currently in development and it's API **WILL** change before version 1.0.0
> **You have been warned!**

# simple-mysql
Wrapper for [mysql](https://www.npmjs.com/package/mysql) to simplify common queries and enable connection to multiple databases.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Connection to single database](#connection-to-single-database)
  - [Connection to multiple databases](#connection-to-multiple-databases)
- [Provided Functions](#provided-functions)
  - [`find`](#find)
  - [`findBy`](#findBy)
  - [`findAll`](#findAll)
  - [`findOneBy`](#findOneBy)
  - [`insertObject`](#insertObject)
  - [`updateObject`](#updateObject)
  - [`delete`](#delete)
  - [`deleteBy`](#deleteBy)
  - [`query`](#query)
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

TODO

#### Connection to multiple databases

TODO

## Provided functions

### find(id, table, callback)

Finds row from database with the field id equal to `id` from `table`. 

**Arguments**

* `id` - ID of the row.
* `table` - Name of table in database.
* `callback(err, object)` - A callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.find(23, function (err, object) {
    // err is equal to error from database if there were any
    // object is equal to the row from database or null when row with id 23 was not found
});
```

---

### findBy(criteria, orderBy, table, callback)

Finds rows from database where key is equal to value from `table`. Uses AND condition with multiple criteria 

**Arguments**

* `criteria` - Key-value pairs for where condition.
* `orderBy` - Key-value pairs for order by condition.
* `table` - Name of table in database.
* `callback(err, object)` - A callback which is called when database query finishes.

**Examples**

```js
// assuming connections is a Connection object and connected to database
connection.findBy({name: 'John', age: 23}, {age: 'DESC'}, function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the row from database or an 
    // empty row when there where no results
});
```

---

### findAll(criteria, orderBy, table, callback)

TODO

---

### findOneBy(criteria, orderBy, table, callback)

TODO

---

### insertObject(object, table, callback)

TODO

---

### updateObject(criteria, object, table, callback)

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
