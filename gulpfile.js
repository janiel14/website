var gulp = require('gulp');
var serve = require('gulp-serve');
var del = require('del');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var inlinesource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin');

gulp.task('serve', serve('dist'));

gulp.task('clear', function () {
  return del(['dist/**/**'], ['cordova/config.xml']);
});

gulp.task('styles:dev', function() {
    return gulp.src('src/styles/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 5%'],
        cascade: false
    }))
    .pipe(gulp.dest('dist/styles/'));
});

gulp.task('styles:dist', function() {
    return gulp.src('src/styles/styles.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 5%'],
        cascade: false
    }))
    .pipe(gulp.dest('dist/styles/'));
});

gulp.task('js:dev', function () {
    var bundler = browserify({
        entries: 'src/scripts/index.js',
        debug: true
    });
    bundler.transform(babelify);

    return bundler.bundle()
        .on('error', function (err) { console.error(err); })
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('js:dist', function () {
    var bundler = browserify({
        entries: 'src/scripts/index.js',
        debug: true
    });
    bundler.transform(babelify);

    return bundler.bundle()
        .on('error', function (err) { console.error(err); })
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('copy:html', function() {
    return gulp.src(['src/**.html'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy:images', function() {
    return gulp.src(['src/images/**.**'])
    .pipe(gulp.dest('dist/images'));
});

gulp.task('copy:fonts', function() {
    return gulp.src(['src/fonts/**.**'])
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('dev', function(callback) {
    runSequence('clear',
                ['copy:html', 'copy:images', 'copy:fonts', 'styles:dev', 'js:dev'],
                'inline:html',
                callback);
});

gulp.task('inline:html', function() {
    return gulp.src('./dist/index.html')
        .pipe(inlinesource())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('inline:delete-assets', function() {
    return del(['./dist/scripts', './dist/styles', './dist/images/**/*.svg']);
});

gulp.task('dist', function(callback) {
    runSequence('clear',
                ['copy:html', 'copy:images', 'copy:fonts', 'styles:dist', 'js:dist'],
                'inline:html',
                'inline:delete-assets',
                callback);
});

gulp.task('watch', ['serve', 'dev'], function () {
    gulp.watch('src/**/*.*', ['dev']);
});