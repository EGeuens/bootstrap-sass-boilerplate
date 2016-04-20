var gulp = require('gulp');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');

// ---------------------------------------------------------------------
// | Paths                                                             |
// ---------------------------------------------------------------------
var dirs = pkg['h5bp-configs'].directories;
var cssDestination = dirs.src + '/css';
var sassGlob = dirs.src + '/**/sass/**/*.scss';
var jsGlob = dirs.src + '/**/js/*.js';
var testGlob = dirs.test + '/*.js';
var indexGlob = dirs.src + '/index.html';

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------
gulp.task('sass', function () {
    var sassOptions = {
        errLogToConsole: true,
        outputStyle: 'nested'
    };

    return gulp.src(sassGlob)
        .pipe(plugins.sass(sassOptions).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.rename('app.css'))
        .pipe(gulp.dest(cssDestination));
});
gulp.task('sass:watch', function () {
    gulp.watch(sassGlob, ['sass']);
});

gulp.task('clean', function (done) {
    require('del')([
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', [
    'copy:index.html'
]);

gulp.task('copy:index.html', function () {
    return gulp.src(indexGlob)
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        jsGlob,
        testGlob
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('lint:watch', function () {
    gulp.watch([
        'gulpfile.js',
        jsGlob,
        testGlob
    ], ['lint:js']);
});

gulp.task('watch', [
    'sass:watch',
    'lint:watch'
]);

//TODO inject js/css into index.html, compile js?, copy built css/js, ...

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task('build', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy',
    done);
});
gulp.task('dev', function (done) {
    runSequence(
        'sass',
        ['watch'],
    done);
});

gulp.task('default', ['build']);
