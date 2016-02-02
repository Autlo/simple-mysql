[![Build Status](https://travis-ci.org/Autlo/simple-mysql.svg?branch=master)](https://travis-ci.org/Autlo/simple-mysql)
[![Coverage Status](https://coveralls.io/repos/github/Autlo/simple-mysql/badge.svg?branch=master)](https://coveralls.io/github/Autlo/simple-mysql?branch=master)

> This module is currently in development and it's API **WILL** change before version 1.0.0
> **You have been warned!**

# simple-mysql
Wrapper for [mysql](https://www.npmjs.com/package/mysql) to simplify common queries and enable connection to multiple databases.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
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
- [Changelog](#changelog)

## Install

Installs `simple-mysql` to your project and adds it to `package.json` file as a dependency.


```sh
$ npm install simple-mysql --save
```

## Usage

TODO

## Provided functions

### find(id, table, callback)

Finds row from database with the field id equal to `id` from `table`. 

__Arguments__

* `id` - ID of the row.
* `table` - Name of table in database.
* `callback(err, object)` - A callback which is called when database query finishes.

__Examples__

```js
// assuming connections is a Connection object and connected to database
connection.find(23, function (err, object) {
    // err is equal to error from database if there were any
    // object is equal to the row from database or null when row with id 23 was not found
});
```

---

### findBy(criteria, table, callback)

Finds rows from database where key is equal to value from `table`. Uses AND condition with multiple criteria 

__Arguments__

* `criteria` - Key-value pairs for where condition.
* `table` - Name of table in database.
* `callback(err, object)` - A callback which is called when database query finishes.

__Examples__

```js
// assuming connections is a Connection object and connected to database
connection.findBy({name: 'John', age: 23}, function (err, rows) {
    // err is equal to error from database if there were any
    // rows is an array of objects equal to the row from database or an empty row when there where no results
});
```

---

### findAll(criteria, table, callback)

TODO

---

### findOneBy(criteria, table, callback)

TODO

---

### insertObject(table, object, callback)

TODO

---

### updateObject(id, table, object, callback)

TODO

---

### delete(id, table, object)

TODO

---

### deleteBy(value, field, table, callback)

TODO

---

### query(sql, callback)

TODO

---

## Configuration options

This module's connection accepts the same configuration options as [mysql](https://www.npmjs.com/package/mysql) module. Read more about [connection options](https://www.npmjs.com/package/mysql#connection-options) and [pool specific options](https://www.npmjs.com/package/mysql#pool-options).

## Changelog

Changelog is available under [GitHub releases section](https://github.com/Autlo/simple-mysql/releases).
