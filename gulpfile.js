'use strict';

const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');

const SRC_DIR = './src';
const BUILD_DIR = './dist';

gulp.task('clean', () => del(BUILD_DIR));

gulp.task('build', () => {
  return merge(
    gulp.src(`${SRC_DIR}/sass/**/*.scss`)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(`${BUILD_DIR}/css`)),

    gulp.src(`${SRC_DIR}/*`).pipe(gulp.dest(BUILD_DIR)),
    gulp.src(`${SRC_DIR}/icons/**/*.png`).pipe(gulp.dest(`${BUILD_DIR}/icons`)),
    gulp.src(`${SRC_DIR}/js/**/*.js`).pipe(gulp.dest(`${BUILD_DIR}/js`))
  );
});

gulp.task('dist', ['build'], () => {
  return merge(
    gulp.src(`${BUILD_DIR}/css/**/*.css`)
      .pipe(cssnano())
      .pipe(gulp.dest(`${BUILD_DIR}/css`)),
    gulp.src(`${BUILD_DIR}/js/**/*.js`)
      .pipe(uglify())
      .pipe(gulp.dest(`${BUILD_DIR}/js`))
  );
});
