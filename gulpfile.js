const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const glob = require('glob');
const browserSync = require('browser-sync').create();
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const tsconfig = require('./tsconfig.json');

function htmlcomp() {

	return gulp.src('./src/*.html')
		.pipe(gulp.dest('./dist/'))
		.pipe(browserSync.stream());
}

function styles() {

	return gulp.src('./src/scss/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(csso())
		.pipe(concat('styles.min.css'))
		.pipe(gulp.dest('./dist/css'))
		.pipe(browserSync.stream());
}

function typescript() {
	
	let files = glob.sync('./src/ts/**/*.ts');

	return browserify({
		basedir: '.',
		debug: true,
		entries: files,
		cache: {},
		packageCache: {}
	})
	.plugin(tsify)
	.on('error', function(err) {
		console.log(err.stack),
		notifier.notify({
			'title': 'Compile Error',
			'message': err.message
		});
	})
	.transform('babelify', {
		presets: ['es2015'],
		extensions: ['.ts']
	})
	.bundle()
	.pipe(source('bundle.min.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(uglify())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist/js'))
}

function watch() {
	browserSync.init({
		files: './src/**/*',
		server: {
			baseDir: './dist/',
			livereload: true
		}
	});
	gulp.watch('./src/scss/**/*.scss', styles);
	gulp.watch('./src/ts/*.ts', typescript);
	gulp.watch('./src/*.html', htmlcomp);
}

exports.styles = styles;
exports.typescript = typescript;
exports.htmlcomp = htmlcomp;
exports.watch = watch;