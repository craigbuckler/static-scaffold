// Gulp.js configuration
var
  gulp = require('gulp'),
  del = require('del'),
	newer = require('gulp-newer'),
	concat = require('gulp-concat'),
	preprocess = require('gulp-preprocess'),
  htmlclean = require('gulp-htmlclean'),
	imagemin = require('gulp-imagemin'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	deporder = require('gulp-deporder'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  pkg = require('./package.json');

// postcss processing
var
	devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),

	// nodemon and browsersync required on development build only
	nodemon = devBuild ? require('gulp-nodemon') : null,
	browsersync = devBuild ? require('browser-sync') : null,

	// folders
	source = 'src/',
	destStatic = 'static/',
	destViews = 'views/',

	/*
	HTML view processing
	*/
	html = {
		in: source + 'html/*.*',
		watch: source + 'html/**/*',
		out: destViews,
		context: {
			lib: require('./' + source + 'html/lib/lib')(),
			devBuild: devBuild,
      cfg: pkg.assure,
			version: pkg.version
		}
	},

	/*
	image processing
	*/
	images = {
    in: source + 'images/**/*',
    out: destStatic + 'images/',
		minOpts: {
			optimizationLevel: 5
		}
  },

  /*
	font processing
	*/
  fonts = {
    in: source + 'fonts/**/*',
    out: destStatic + 'fonts/'
  },

  /*
  root static file processing
  */
  rootfile = {
    in: source + '*.*',
    out: destStatic
  },

	/*
	CSS pre/post-processing
	LibSass
	PostCSS
		postcss-assets: permits resolve(img), width(img), height(img) and inline(img) - looks in loadPaths folders
		autoprefixer
		media query packer
	*/
  css = {
		in: source + 'scss/main.scss',
    watch: source + 'scss/**/*',
    out: destStatic + 'css/',
		sassOpts: {
			outputStyle: 'nested',
			imagePath: '/images/',
			precision: 3,
			errLogToConsole: true
		},
    processors: [
			require('postcss-assets')({
				loadPaths: ['images/', 'fonts/'],
				basePath: 'static'
			}),
      require('autoprefixer')({
				browsers: ['last 2 versions', '> 2%']
			}),
			require('css-mqpacker')
    ]
  },

	/*
  JavaScript processing
  */
	js = {
		in: source + 'js/**/*',
		out: destStatic + 'js/',
		filename: 'main.js',
    concat: true, // concatenate files in devBuild
    context: {
			devBuild: devBuild,
      cfg: pkg.assure,
			version: pkg.version
		}
	},

	/*
	Browser-Sync options
	*/
	syncOpts = {
		proxy: 'https://localhost:3000/',
		https: true,
		port: 3001,
		open: false,
		notify: false,
    ghostMode: false
	}
;

// cross-configuration
html.context.jsconcat = !devBuild || js.concat;

// production build options
if (!devBuild) {
  css.processors.push(require('cssnano')); // minify (better tha csswring)
}

// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');

// clean folders
gulp.task('clean', function() {
  del([
		destStatic + '*',
		destViews + '*'
  ]);
});


// image processing
gulp.task('images', function() {
  return gulp.src(images.in)
    .pipe(newer(images.out))
    .pipe(imagemin(images.minOpts))
    .pipe(gulp.dest(images.out));
});


// font processing
gulp.task('fonts', function() {
  return gulp.src(fonts.in)
  .pipe(newer(fonts.out))
  .pipe(gulp.dest(fonts.out));
});


// rootfile processing
gulp.task('rootfile', function() {
  return gulp.src(rootfile.in)
  .pipe(newer(rootfile.out))
  .pipe(gulp.dest(rootfile.out));
});


// build HTML files
gulp.task('html', ['images'], function() {
  var page = gulp.src(html.in)
		.pipe(preprocess({ context: html.context }));

  if (!devBuild) {
    page = page.pipe(htmlclean());
  }
  return page.pipe(gulp.dest(html.out));
});


// CSS pre/post-processing
gulp.task('css', ['images', 'fonts'], function() {
  var styles = gulp.src(css.in)
    .pipe(sass(css.sassOpts))
		.pipe(postcss(css.processors))
    .pipe(gulp.dest(css.out));

	if (browsersync) {
		styles = styles.pipe(browsersync.reload({ stream: true }));
	}

	return styles;
});


// javascript
gulp.task('js', function() {

  if (!devBuild) {
    // delete files
    del([
      js.out + '*'
    ]);
  }

  var jsbuild = gulp.src(js.in);

  if (devBuild && !js.concat) {
    // no concatenation - get newer files
    jsbuild = jsbuild.pipe(newer(js.out));
  }

  jsbuild = jsbuild.pipe(preprocess({ context: js.context }));

  if (!devBuild || js.concat) {
    // concatenate
    jsbuild = jsbuild
      .pipe(deporder())
      .pipe(concat(js.filename));
  }

  if (!devBuild) {
    // minify
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  // output
  jsbuild = jsbuild.pipe(gulp.dest(js.out));

  return jsbuild;

});


// browser-sync
gulp.task('browsersync', function() {
	if (nodemon) nodemon();
  if (browsersync) browsersync(syncOpts);
});


// watch for file changes
gulp.task('watch', ['browsersync'], function() {

  // image changes
  gulp.watch(images.in, ['images']);

  // font changes
  gulp.watch(fonts.in, ['fonts']);

	// rootfile changes
  gulp.watch(rootfile.in, ['rootfile']);

	// html changes
  gulp.watch(html.watch, ['html']);

  // css changes
  gulp.watch(css.watch, ['css']);

  // javascript changes
  gulp.watch(js.in, ['js']);

});


// run all tasks immediately
gulp.task('run', ['rootfile', 'html', 'css', 'js']);


// default task
gulp.task('default', ['run', 'watch']);
