'use strict'

module.exports = (grunt) ->
  
  grunt.initConfig
    srcDir: "engine"
    testDir: "tests"
    libDir: "libs"

    entry: "simple.js"
    bundle: "bundle.js"

    browserify:
      dist:
        files:
          '<%= bundle %>': '<%= entry %>'

    watch:
      js:
        files: [
          '<%= entry %>',
          '<%= srcDir %>/**/*.js',
          '<%= testDir %>/**/*.js',
          '<%= libDir %>/**/*.js',
        ]
        tasks: ['browserify']
        options:
          livereload: true
    
  
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-browserify')

  grunt.registerTask('default', ['browserify', 'watch'])
