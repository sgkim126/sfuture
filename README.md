# sfuture
[![Build Status](https://travis-ci.org/sgkim126/sfuture.svg?branch=master)](https://travis-ci.org/sgkim126/sfuture)

JavaScript port of Scala Future written with TypeScript.

## Compatibility
This library uses [ES6 promise](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise). So you need modern browser, io.js. If you want to use it with node.js, please ensure your node.js version is upper than 0.12.0. See [ES6 compatibility table](https://kangax.github.io/compat-table/es6/#Promies) for more information.

## How to use
### With NPM
```
npm install sfuture
```

### From source
#### Get source
```
git clone https://github.com/sgkim126/sfuture.git
cd sfuture
```
or
```
wget https://github.com/sgkim126/sfuture/archive/{version}.tar.gz
tar -xf {version}.tar.gz
cd {version}
```
#### Compile
```
make
```
Now you have ```{path to sfuture}/lib/sfuture.js```. Use it.

## How to contribute
sfuture is written with TypeScript, checks style with tslint, runs tests with mocha and checks test coverage with istanbul. ```npm test``` command tests them all.

### How to compile
There are two commands to compile.
One is ```make build```(or just ```make```) it only compiles future.js with declaration file.
Another is ```make all```. It build future.js and build all tests.

### How to lint
```
make lint
```
All configuration about lint is in ```.tslintrc.json```

### How to test
```
make test
```

### How to check test coverage
Currently, sfuture ensures 100% test coverage.
```
make cover
```
