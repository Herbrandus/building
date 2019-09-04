const gulp = require('gulp');
const sass = require('gulp-sass');
const terser = require('gulp-terser');
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
		entries: files
	})
	.on('error', function(err) {
		console.log(err.stack),
		notifier.notify({
			'title': 'Compile Error',
			'message': err.message
		});
	})
	.plugin(tsify)
	.bundle()
	.pipe(source('bundle.min.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(terser())
	.pipe(sourcemaps.write(''))
	.pipe(gulp.dest('./dist/js'))
	.pipe(browserSync.stream());
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

function clean() {
	return del(['./dist/js/']);
}

exports.styles = styles;
exports.typescript = typescript;
exports.htmlcomp = htmlcomp;
exports.watch = watch;
exports.clean = clean;