const path = require('path');
const gulp = require('gulp');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssSimpleVars = require('postcss-simple-vars');
const postcssNested = require('postcss-nested');
const next = require('postcss-cssnext');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const server = require('browser-sync').create();

const files = [
  './src/blocks/**/*.css' // Тема
];

gulp.task('css', () =>  {
  let plugins = [
    postcssImport(),
    postcssMixins({
    }),
    postcssSimpleVars({
      variables: function() {return require('./src/variables.js')}
    }),
    postcssNested(),
    next()
  ];
  return gulp.src(files)
    .pipe(postcss(plugins))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./build/css'))
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/css'))
    .pipe(server.stream());
});

gulp.task('pug', function(){
  return gulp.src('./src/pages/**/*.pug',)
      .pipe(pug({
        pretty: true
      }))
      .pipe(gulp.dest('./build'))
      .pipe(server.reload({stream: true}))
});

gulp.task("serve", function () {
  server.init({
    server: {
      baseDir: "./build"
    },
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("./src/blocks/**/*.css", gulp.series("css"));
  gulp.watch("./src/**/*.pug", gulp.series("pug"));
});
