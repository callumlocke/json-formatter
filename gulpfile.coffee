gulp = require 'gulp'
runSequence = require 'run-sequence'
$ = require('gulp-load-plugins')()
pkg = require './package.json'
es = require 'event-stream'
path = require 'path'

gulp.task 'clean', ->
  gulp.src('dist')
    .pipe($.clean())


gulp.task 'static', ->
  gulp.src([
    'app/**/*.json'
    'app/**/*.html'
    'app/**/*.css'
    'app/**/*.png'
    'app/**/bootstrap.js' # makes saving to nested dir easier
    'app/**/jquery.js'
  ]) 
    .pipe($.if(((file) -> path.extname(file.relative) isnt '.png'), $.template({
      version: pkg.version
    })))
    .pipe(gulp.dest('dist'))


gulp.task 'scripts', ->
  gulp.src([
    'app/js/background.coffee'
    'app/js/content.coffee'
    'app/options/options.coffee'
  ], { read: false })
    .pipe($.browserify({
      debug: true
      transform: ['coffeeify']
      extensions: ['.coffee']
    }))
    .pipe($.rename({extname: '.js'}))
    .pipe($.if((file) ->
      file.relative == 'options.js'
    , gulp.dest('dist/options')))
    .pipe($.if((file) ->
      file.relative != 'options.js'
    , gulp.dest('dist/js')))


gulp.task 'styles', ->
  gulp.src('app/**/*.scss')
    .pipe($.sass())
    .pipe(gulp.dest('dist'))


gulp.task 'default', ->
  runSequence(
    'clean',
    ['static', 'scripts', 'styles']
  )


gulp.task 'watch', ['default'], ->
  gulp.watch 'app/**/*.scss', ['styles']
  gulp.watch 'app/**/*.{coffee,js}', ['scripts']
  gulp.watch 'app/**/*.{html,json}', ['static']
  return
