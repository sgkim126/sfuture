var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('build', function () {
  return gulp.src([
      './**/*.ts',
      '!./node_modules/**/*.ts'
    ])
    .pipe(ts({
      module: 'commonjs',
      noImplicitAny: true,
      target: 'ES5',
      removeComments: true,
      sourceMap: true,
      typescript: require('typescript')
    }))
    .pipe(gulp.dest('.'));
});

gulp.task("test", ["build"], function (cb) {
  require('./gulptest')(cb);
});

gulp.task("lint", function () {
  require('./gulplint')();
});

gulp.task("default", ["lint", "test"]);
