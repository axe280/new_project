'use strict';


var gulp = require('gulp'),
  watch = require('gulp-watch'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  rigger = require('gulp-rigger'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rimraf = require('rimraf'),
  browserSync = require("browser-sync"),
  spritesmith = require('gulp.spritesmith'),
  wiredep = require('wiredep').stream,
  minifyCss = require('gulp-minify-css'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  svgstore = require('gulp-svgstore'),
  svgmin = require('gulp-svgmin'),
  rename = require('gulp-rename'),
  reload = browserSync.reload;


var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    js: 'src/js/**/*.*',
    style: 'src/style/main.sass',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    style: 'src/style/**/*.sass',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};


var config = {
  server: {
    baseDir: "./build"
  },
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend"
};


gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/icon/*.*').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite-mixins.sass',
    padding: 2
  }));

  var imgStream = spriteData.img
    .pipe(gulp.dest('src/img/'));
  
  var cssStream = spriteData.css
    .pipe(gulp.dest('src/style/helpers/'));
 
  return merge(imgStream, cssStream);
});


gulp.task('svgsprite', function () {
  return gulp
    .src('src/img/svg/**/*.*')
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(rename({basename: 'sprite_svg'}))
    .pipe(gulp.dest('./src/img/svg'));
});


gulp.task('webserver', function () {
  browserSync(config);
});


gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('bower', function () {
  gulp.src('./src/template/*.html')
    .pipe(wiredep({
      directory : 'bower_components'
    }))
    .pipe(gulp.dest('./src/template'));
});

gulp.task('bowermin', function () {
  gulp.src('./src/template/*.html')
    .pipe(useref())
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulp.dest('./src/template'));
});


gulp.task('html:build', function () {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});


gulp.task('js:build', function () {
  gulp.src(path.src.js) 
    .pipe(rigger()) 
    // .pipe(uglify()) 
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});


gulp.task('style:build', function () {
  gulp.src(path.src.style) 
    .pipe(sass({
        includePaths: ['src/style/'],
        outputStyle: 'expanded',
        errLogToConsole: true
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});


gulp.task('image:build', function () {
  gulp.src(path.src.img) 
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});


gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});


gulp.task('build', [
  'html:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build'
]);


gulp.task('watch', function(){
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
});


gulp.task('default', ['build', 'webserver', 'watch']);

