var gulp = require('gulp');
var tslint = require("gulp-tslint");

module.exports = function () {
  return gulp.src([
    './**/*.ts',
    '!./node_modules/**/*.ts',
    '!./lib.d/**/*.d.ts'
  ])
  .pipe(tslint({configuration: require('./.tslintrc')}))
  .pipe(tslint.report('prose'));
}
