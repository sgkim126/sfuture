var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task("test", function (cb) {
  gulp.src([ './lib/**/*.js' ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src([ './test/**/*.js' ])
      .pipe(mocha({
        reporter: 'spec',
        timeout: 10000
      }))
      .pipe(istanbul.writeReports())
      .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
      .on('end', cb);
    });
});

gulp.task("default", ["test"]);
