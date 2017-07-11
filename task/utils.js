module.exports = Utils;

function _args(grunt) {
  const opts = ['test', 'chunk', 'ci', 'reporter'];
  const args = {};

  opts.forEach(function(optName) {
    const opt = grunt.option(optName);

    if (opt) {
      args[optName] = '' + opt;
    }
  });

  return args;
}

function _taskEndIfMatch(grunt, regexSuccess, infoSuccess, regexFailed) {
  var taskIsDone = false;

  return function(chunk, done) {
    if (taskIsDone) { return; }

    if (regexSuccess || regexFailed) {
      done = done || grunt.task.current.async();
      if (regexSuccess && regexSuccess.test(String(chunk))) {
        taskIsDone = true;
        grunt.log.oklns(infoSuccess);
        done(true);
      } else if (regexFailed && regexFailed.test(String(chunk))) {
        taskIsDone = true;
        grunt.log.error(chunk);
        done(false);
      }
    }
  };
}

function Utils(grunt, servers) {
  this.grunt = grunt;
  this.servers = servers;
  this.args = _args(grunt);
}

Utils.prototype.command = function command() {
  var servers = this.servers;
  var commandObject = {};

  commandObject.rabbitmq = servers.rabbitmq.cmd;

  commandObject.redis = util.format('%s --port %s %s %s',
      servers.redis.cmd,
      (servers.redis.port ? servers.redis.port : '23457'),
      (servers.redis.pwd ? '--requirepass' + servers.redis.pwd : ''),
      (servers.redis.conf_file ? servers.redis.conf_file : ''));

  commandObject.mongo = function() {
    return util.format('%s --dbpath %s --port %s %s',
      servers.mongodb.cmd,
      servers.mongodb.dbpath,
      (servers.mongodb.port ? servers.mongodb.port : '23456'),
      '--nojournal');
  };

  commandObject.elasticsearch = servers.elasticsearch.cmd +
      ' -Des.http.port=' + servers.elasticsearch.port +
      ' -Des.transport.tcp.port=' + servers.elasticsearch.communication_port +
      ' -Des.cluster.name=' + servers.elasticsearch.cluster_name +
      ' -Des.path.data=' + servers.elasticsearch.data_path +
      ' -Des.path.work=' + servers.elasticsearch.work_path +
      ' -Des.path.logs=' + servers.elasticsearch.logs_path +
      ' -Des.discovery.zen.ping.multicast.enabled=false';

  return commandObject;
};


Utils.prototype.container = function(createContainerOptions, startContainerOptions, removeContainerOptions, taskOptions) {
  taskOptions = extend({ async: false }, taskOptions);

  if (taskOptions.regex || taskOptions.regexForFailed) {
    taskOptions.matchOutput = _taskEndIfMatch(grunt, taskOptions.regex, taskOptions.info, taskOptions.regexForFailed);
  }

  createContainerOptions.options = {
    taskOptions: taskOptions,
    startContainerOptions: startContainerOptions,
    removeContainerOptions: removeContainerOptions
  };

  return createContainerOptions;
}

Utils.prototype.setupElasticsearchUsersIndex = function() {
  var grunt = this.grunt;
  var servers = this.servers;

  return function() {
    var done = this.async();
    var esnConf = new EsnConfig({host: servers.host, port: servers.elasticsearch.port});

    esnConf.createIndex('users').then(function() {
      grunt.log.write('Elasticsearch users settings are successfully added');
      done(true);
    }, done);
  };
};

Utils.prototype.setupElasticsearchContactsIndex = function() {
  var grunt = this.grunt;
  var servers = this.servers;

  return function() {
    var done = this.async();
    var esnConf = new EsnConfig({host: servers.host, port: servers.elasticsearch.port});

    esnConf.createIndex('contacts').then(function() {
      grunt.log.write('Elasticsearch contacts settings are successfully added');
      done(true);
    }, done);
  };
};

Utils.prototype.setupElasticsearchEventsIndex = function() {
  var grunt = this.grunt;
  var servers = this.servers;

  return function() {
    var done = this.async();
    var esnConf = new EsnConfig({host: servers.host, port: servers.elasticsearch.port});

    esnConf.createIndex('events').then(function() {
      grunt.log.write('Elasticsearch events settings are successfully added');
      done(true);
    }, done);
  };
};
