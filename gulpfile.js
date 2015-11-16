// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var path = require('path');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var prettify = require('gulp-prettify');

// JS PATHS
var jsPaths = [
  'source/js/*.js'
];

// JS DESTINATION
var jsDest = 'dist/js/';

// Lint Task
gulp.task('lint', function() {
  return gulp.src(jsPaths)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Compile Our less ------------------------------------------------------------
// requires: gulp-minify-css, gulp-less, gulp-rename, path
gulp.task('less', function () {
  return gulp.src('less/screen.less')
  .pipe(less({
    paths: [ path.join(__dirname, 'less', 'includes') ]
  }))
  .pipe(minifyCSS()) // REMOVE COMMENT TO COMPILE MINIFIED VERSION
  .pipe(rename('styles.css'))
  .pipe(gulp.dest('css'));
});

// Minify CSS for Production
gulp.task('css', function () {
  return gulp.src('source/css/styles.css')
  .pipe(minifyCSS())
  .pipe(rename('styles.min.css'))
  .pipe(gulp.dest('dist/css'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('source/js/*.js', ['lint', 'scripts']);
  gulp.watch('source/less/**/*.less', ['less']);
});


// Concatenate & Minify JS -----------------------------------------------------
// requires: gulp-concat, gulp-uglify, gulp-rename
gulp.task('scripts', function() {
  return gulp.src(jsPaths)
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

// Minify HTML -----------------------------------------------------------------
// requires: 'gulp-minify-html'
/* All options are false by default.
    empty - keep empty attributes
    cdata - keep CDATA from scripts
    comments - keep comments
    conditionals - keep conditional internet explorer comments
    spare - keep redundant attributes
    quotes - keep arbitrary quotes
    loose - preserve one whitespace
*/
gulp.task('minify-html', function() {
  var minifyOptions = {
    quotes: true,
    empty: true,
    cdata: true,
    conditionals: true
  };
  return gulp.src('index.html')
  .pipe(minifyHTML(minifyOptions))
  .pipe(gulp.dest('app/'));
});

/*
  Prettify HTML --------------------------------------------------------------
  requires: 'gulp-prettify-html'
  DEFAULT OPTIONS
    "indent_size": 4,
    "indent_char": " ",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0
*/

var prettifyOptions = {
  indent_size: 2
};
gulp.task('prettify', function() {
  gulp.src(['index.html'])
  .pipe(prettify(prettifyOptions))
  .pipe(gulp.dest(htmlDest));
});

// Default Task
// Runs with "gulp" by itself --------------------------------------------------
gulp.task('default', ['lint', 'scripts', 'css']);

// Prepare Output for production -----------------------------------------------
gulp.task('build', ['scripts', 'css']);