var gulp = require('gulp')
var tsc = require('gulp-typescript')
var del = require('del')
var concat = require('gulp-concat')
var mocha = require('gulp-mocha');
var sourcemaps = require('gulp-sourcemaps')
var path = require('path')
var spawn = require('child_process').spawn
var node

var tsProject = tsc.createProject('tsconfig.json')

gulp.task('clean', function (cb) {
  return del('dist', cb)
})

gulp.task('copyconfig', ['clean'], function () {
  gulp.src('src/*.json')
        .pipe(gulp.dest('./dist'))
})

gulp.task('build', ['copyconfig'], function () {
  var tsResult = gulp.src(['typings/index.d.ts', 'src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        return tsResult.js
        .pipe(sourcemaps.write('.', {
          sourceRoot: function (file) { return file.cwd + '/src' }
        }))
        .pipe(gulp.dest('dist'))
})

// run mocha tests in the ./tests folder
gulp.task('test', function () {
    return gulp.src('./tests/out/test*.js', { read: false })
    // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha());
});

gulp.task('server', ['build'], function () {
  if (node) node.kill()
    node = spawn('node', ['dist/index.js'], { stdio: 'inherit' })
  node.on('close', function (code) {
      if (code === 8) {
          gulp.log('Error detected, waiting for changes...')
        }
    })
})

gulp.task('debug', ['watch'], function () {
  if (node) node.kill()
    node = spawn('node', ['--inspect-brk=0.0.0.0:9229', '--nolazy', 'dist/index.js'], { stdio: 'inherit' })
  node.on('close', function (code) {
      if (code === 8) {
          gulp.log('Error detected, waiting for changes...')
        }
    })
})

gulp.task('watch', function () {
  gulp.watch('src/**/*.ts', ['server'])
})

gulp.task('default', ['build'])

// clean up if an error goes unhandled.
process.on('exit', function () {
  if (node) node.kill()
})
