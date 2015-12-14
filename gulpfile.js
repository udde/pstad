var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');

gulp.task('conc',function(){
    return gulp.src([
        'js/nodeMemoryHandler.js',
        'js/patch.js',
        'js/landscape.js',
        'js/loadShaders.js',
        'js/glMain.js',
    ])
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('js'));
});

// gulp.task('browserify', function(){
// return browserify('index.js')
// .bundle()
// });

gulp.task('default', ['conc']);
