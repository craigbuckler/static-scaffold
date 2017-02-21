// Gulp.js configuration

(() => {
'use strict';

const

  // development or production
  devBuild    = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
  pkg         = require('./package.json'),
  now         = new Date(),

  // source and build folders
  dir = {
    base      : __dirname + '/',
    lib       : __dirname + '/lib/',
    src       : 'src/',
    build     : 'build/'
  },

  // TODO: put package name and description here
  sitemeta = {
    devBuild  : devBuild,
    version   : pkg.version,
    name      : 'Static site scaffold',
    desc      : 'A static site scaffold built using Gulp, Metalsmith and custom plugins.',
    keywords  : 'static, site, website, html, generated',
    author    : 'Craig Buckler',
    twitter   : '@craigbuckler',
    company   : 'OptimalWorks Ltd',
    language  : 'en-GB',
    domain    : devBuild ? 'http://192.168.1.22:8000' : 'https://craigbuckler.com',
    rootpath  : '/',
    layout    : 'page.html',
    now       : now,
    nowYear   : now.getUTCFullYear()
	},

  // Gulp and plugins
  gulp        = require('gulp'),
  gutil       = require('gulp-util'),
  newer       = require('gulp-newer'),
  imagemin    = require('gulp-imagemin'),
  sass        = require('gulp-sass'),
  postcss     = require('gulp-postcss'),

  // Metalsmith and plugins
  metalsmith  = require('metalsmith'),
  publish     = require('metalsmith-publish'),
	layouts		  = require('metalsmith-layouts'),
  markdown    = require('metalsmith-markdown'),
  headingid   = require('metalsmith-headings-identifier'),
  inline      = require('metalsmith-inline-source'),
  wordcount		= require('metalsmith-word-count'),
  beautify    = require('metalsmith-beautify'),
  minify      = require('metalsmith-html-minifier'),
  sitemap			= require('metalsmith-mapsite'),

  // custom Metalsmith plugins
  msutil      = require(dir.lib + 'metalsmith-util'),
  addmeta     = require(dir.lib + 'metalsmith-addmeta'),
  tags        = require(dir.lib + 'metalsmith-tags'),
  rssfeed     = require(dir.lib + 'metalsmith-rssfeed'),

  // other modules
  del         = require('del')
;

// full root URL
sitemeta.rootURL = sitemeta.domain + (sitemeta.rootpath || '');

// Browser-sync
var browsersync	= false;

// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');


// clean build folder
gulp.task('clean', () => {
  del([
		dir.build,
  ]);
});


// HTML settings
const html = {
  src         : dir.src + 'pages/',
  watch       : [dir.src + 'pages/**/*', dir.src + 'template/**/*'],
  build       : dir.build,

  metadata: {
    menuLowerCase: true
  },

  headingid: {
    linkTemplate: '<a href="#%s" class="heading"></a>'
  },

  layouts: {
    engine    : 'ejs',
    directory : dir.src + 'template/',
    default   : sitemeta.layout
  },

  inline: {
    attribute: 'data-inline="1"',
    rootpath: 'build'
  },

  tidy: {
    indent_size : 2
  },

  sitemap: {
    hostname  : sitemeta.rootURL,
    omitIndex : true
  },

  rssfeed: {
    include: 'article'
  }
};

// build HTML pages
gulp.task('html', ['images'], (done) => {

  metalsmith(dir.base)
    .source(html.src)
    .destination(html.build)
    .metadata(sitemeta)
    .clean(false)
    .use(publish())
    .use(msutil.rename)
    .use(markdown())
    .use(addmeta(html.metadata))
    .use(tags())
    .use(headingid(html.headingid))
    .use(wordcount({ raw: true }))
    .use(layouts(html.layouts))
    .use(inline(html.inline))
    .use(devBuild ? beautify() : minify())
    // .use(devBuild ? msutil.debug : msutil.noop)
    .use(sitemap(html.sitemap))
    .use(rssfeed(html.rssfeed))
    .build((err) => {
      if (err) throw err;
    });

  done();

});


// image settings
const images = {
  src         : dir.src + 'images/**/*',
  build       : dir.build + 'images/',

  minOpts: {
    optimizationLevel: 5
  }
};

// image processing
gulp.task('images', () => {
  return gulp.src(images.src)
    .pipe(newer(images.build))
    .pipe(imagemin(images.minOpts))
    .pipe(gulp.dest(images.build));
});


// CSS settings
var css = {
  src         : dir.src + 'scss/main.scss',
  watch       : dir.src + 'scss/**/*',
  build       : dir.build + 'css/',
  sassOpts: {
    outputStyle     : 'nested',
    imagePath       : '/images/',
    precision       : 3,
    errLogToConsole : true
  },
  processors: [
    require('postcss-assets')({
      loadPaths: ['images/'],
      basePath: dir.build
    }),
    require('autoprefixer')({
      browsers: ['last 2 versions', '> 2%']
    }),
    require('css-mqpacker')
  ]
};

// production CSS
if (!devBuild) {
  css.processors.push(require('cssnano'));
}

// Sass/CSS processing
gulp.task('css', ['images'], () => {
  return gulp.src(css.src)
    .pipe(sass(css.sassOpts))
		.pipe(postcss(css.processors))
    .pipe(gulp.dest(css.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
});


// browser-sync options
const syncOpts = {
  server: {
    baseDir   : dir.build,
    index     : 'index.html'
  },
  port        : 8000,
  files       : dir.build + '**/*',
  open        : false,
  notify      : false,
  ghostMode   : false,
  ui: {
    port: 8001
  }
};

// browser-sync
gulp.task('browsersync', () => {
  if (browsersync === false) {
    browsersync	= devBuild ? require('browser-sync').create() : null;
  }
  if (browsersync) browsersync.init(syncOpts);
});


// watch for file changes
gulp.task('watch', ['browsersync'], () => {

	// page changes
  gulp.watch(html.watch, ['html'], browsersync ? browsersync.reload : {});

  // image changes
  gulp.watch(images.src, ['images']);

    // CSS changes
  gulp.watch(css.watch, ['css']);

});


// run all tasks immediately
gulp.task('build', ['html', 'css']);


// default task
gulp.task('default', ['build', 'watch']);

})();
