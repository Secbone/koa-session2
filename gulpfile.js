"use strict"

const gulp = require("gulp");
const babel = require("gulp-babel");

gulp.task("default", () => {
    gulp.src("index.js")
        .pipe(babel({
            presets: ["es2015", "stage-3"]
        }))
        .pipe(gulp.dest("dist/"));
});
