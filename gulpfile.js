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

  // Browser-sync
  browsersync	= devBuild ? require('browser-sync').create() : null,

  // Metalsmith and plugins
  metalsmith  = require('metalsmith'),
  publish     = require('metalsmith-publish'),
	layouts		  = require('metalsmith-layouts'),
  markdown    = require('metalsmith-markdown'),
  headingid   = require('metalsmith-headings-identifier'),
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
    .use(devBuild ? beautify() : minify())
    // .use(devBuild ? msutil.debug : msutil.noop)
    .use(sitemap(html.sitemap))
    .use(rssfeed(html.rssfeed))
    .build((err) => {
      if (err) throw err;
    });

  done();

});


// process images
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
  if (browsersync) browsersync.init(syncOpts);
});


// watch for file changes
gulp.task('watch', ['browsersync'], () => {

	// page changes
  gulp.watch(html.watch, ['html'], browsersync.reload || {});

  // image changes
  gulp.watch(images.src, ['images']);

});


// run all tasks immediately
gulp.task('build', ['html']);


// default task
gulp.task('default', ['build', 'watch']);

})();
