'use strict';

var Utils = require('./utils');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-docker-spawn');

  grunt.registerMultiTask('setupElasticsearchUsersIndex', 'setup elasticsearch users index', Utils.setupElasticsearchUsersIndex());
  grunt.registerMultiTask('setupElasticsearchContactsIndex', 'setup elasticsearch contacts index', Utils.setupElasticsearchContactsIndex());
  grunt.registerMultiTask('setupElasticsearchEventsIndex', 'setup elasticsearch events index', Utils.setupElasticsearchEventsIndex());

  grunt.registerMultiTask('pull-containers', 'pull containers', ['container:redis:pull', 'container:rabbitmq:pull', 'container:mongo:pull', 'container:elasticsearch:pull']);
  grunt.registerMultiTask('spawn-containers', 'spawn servers', ['container:redis', 'container:rabbitmq', 'container:mongo', 'container:elasticsearch']);
  grunt.registerMultiTask('kill-containers', 'kill servers', ['container:redis:remove', 'container:rabbitmq:remove', 'container:mongo:remove', 'container:elasticsearch:remove']);
  grunt.registerMultiTask('setup-mongo-es-docker', ['spawn-containers', 'continue:on', 'setupElasticsearchUsersIndex', 'setupElasticsearchContactsIndex', 'setupElasticsearchEventsIndex']);
});
