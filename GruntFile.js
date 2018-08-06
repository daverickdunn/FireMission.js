const sass = require('node-sass');

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ['src/img/**'], dest: 'dist/img/', filter: 'isFile'},
                    {expand: true, flatten: true, src: ['src/**/*.html'], dest: 'dist/', filter: 'isFile'},
                ],
            },
        },
        concat: {
            options: {
                separator: ';\n',
            },
            dist: {
                src: [
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',

                    // 'node_modules/bootstrap/js/dist/alert.js',
                    // 'node_modules/bootstrap/js/dist/button.js',
                    // 'node_modules/bootstrap/js/dist/carousel.js',
                    // 'node_modules/bootstrap/js/dist/collapse.js',
                    // 'node_modules/bootstrap/js/dist/dropdown.js',
                    // 'node_modules/bootstrap/js/dist/modal.js',
                    // 'node_modules/bootstrap/js/dist/popover.js',
                    // 'node_modules/bootstrap/js/dist/scrollspy.js',
                    // 'node_modules/bootstrap/js/dist/tab.js',
                    // 'node_modules/bootstrap/js/dist/tooltip.js',
                    // 'node_modules/bootstrap/js/dist/util.js',
                    // 'node_modules/bootstrap/js/dist/index.js',

                    'src/**/*.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },
        sass: {
            options: {
                implementation: sass
            },
            dist: {
                files: {
                    'dist/fire-mission.css': 'src/scss/fire-mission.scss'
                }
            }
        },
        watch: {
            copy: {
                files: ['src/**/*.html', 'src/img/**'],
                tasks: ['copy']
            },
            concat: {
                files: 'src/**/*.js',
                tasks: ['concat']
            },
            uglify: {
                files: '<%= concat.dist.dest %>',
                tasks: ['uglify']
            },
            sass: {
                files: 'src/scss/*.scss',
                tasks: ['sass']
            }
        }
    });


    grunt.registerTask('default', ['copy', 'sass', 'concat', 'uglify', 'watch']);
};
