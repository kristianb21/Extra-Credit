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
var del = require('del');
var htmltojson = require('gulp-html-to-json');
var template = require('gulp-template-compile');
var html2string = require('gulp-html2string');

// HTML PATHS
var htmlBasePath = '_site';
var htmlPaths = [
  '_site/*.html',
  '_site/*/*.html',
  '_site/*/*/*.html',
  '_site/*/*/*/*.html'
];

var htmlDest = '_site/';
// JS PATHS
var jsPaths = [
  'js/*.js'
];

// JS DESTINATION
var jsDest = 'js/';

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

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('js/*.js', ['lint', 'scripts']);
  gulp.watch('less/**/*.less', ['less']);
});


// Concatenate & Minify JS -----------------------------------------------------
// requires: gulp-concat, gulp-uglify, gulp-rename
gulp.task('scripts', function() {
  return gulp.src(jsPaths)
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest));
});
// Scripts with Dev Options, TODO: Run tasks with flags to
// combine both task functions.
// gulp.task('scripts', function() {
//   return gulp.src(jsPaths)
//     .pipe(concat('all.js'))
//     .pipe(gulp.dest(jsDest))
//     .pipe(rename('all.min.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest(jsDest));
// });

gulp.task('cleanjs', function() {
  return del(jsFilesToDelete);
});

// Watch Files For Changes
gulp.task('watch', function() {
  // gulp.watch(paths, tasks)
  gulp.watch('js/*.js', ['lint']);
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
  // Paths runs 4 levels deep in the _site directory, add more if needed.

  return gulp.src(htmlPaths)
  .pipe(minifyHTML(minifyOptions))
  .pipe(gulp.dest(htmlDest));
});

// Prettify HTML ---------------------------------------------------------------
// requires: 'gulp-prettify-html'
/* DEFAULT OPTIONS
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
  gulp.src(htmlPaths)
  .pipe(prettify(prettifyOptions))
  .pipe(gulp.dest(htmlDest));
});



gulp.task('site-content', function () {
    gulp.src(htmlPaths)
        .pipe(template())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('dist'));
});

// Converts HTML files to a string as a js object.


gulp.task('html2js', function () {
  return gulp.src(htmlPaths)
    .pipe(html2string({
      base: path.join(__dirname, htmlBasePath), //The base path of HTML templates
      createObj: true, // Indicate wether to define the global object that stores
                       // the global template strings
      objName: 'TEMPLATES'  // Name of the global template store variable
                            //say the converted string for myTemplate.html will be saved to TEMPLATE['myTemplate.html']
    }))
    .pipe(rename({extname: '.js'}))
    // .pipe(concat('all-content.js')) (optional)
    .pipe(gulp.dest('templates/')); //Output folder
});

// Default Task
// Runs with "gulp" by itself --------------------------------------------------
gulp.task('default', ['lint', 'less']);

// Prepare Output for production -----------------------------------------------
gulp.task('build', ['minify-html', 'scripts']);

var csv2json = require('gulp-csv2json');

gulp.task('csv-2-json', function () {

var csvParseOptions = {}; //based on options specified here : http://csv.adaltas.com/parse/

    gulp.src('datasets/*.csv')
        .pipe(csv2json(csvParseOptions))
        .pipe(rename({extname: '.json'}))
        .pipe(gulp.dest('datasets'));
});