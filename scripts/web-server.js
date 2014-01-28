#!/usr/bin/env node

var util = require('util'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    events = require('events'),
    mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
  title : String,
  body  : String
});

var Article = mongoose.model('Article', articleSchema);

var DEFAULT_PORT = 8000;
var APP_DIRECTORY = "../app"

function main(argv) {
  new HttpServer({
    'GET': createServlet(StaticServlet),
    'POST': createServlet(StaticServlet),
    'HEAD': createServlet(StaticServlet)
  }).start(Number(argv[2]) || DEFAULT_PORT);
}

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function(port) {
  this.port = port;
  this.server.listen(port);
  mongoose.connect('localhost', 'test');
  //make test article
  //Article.create({'title': 'testArticle', 'body': 'This is a test'}, function(err, small) {
 //   if(err) return handleError(err);
  //  //saved
  //})
  util.puts('Http Server running at http://localhost:' + port + '/');
};

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function(req, res) {
  var logEntry = req.method + ' ' + req.url;
  if (req.headers['user-agent']) {
    logEntry += ' ' + req.headers['user-agent'];
  }
  util.puts(logEntry);
  req.url = this.parseUrl_(req.url);
  var handler = this.handlers[req.method];
  if (!handler) {
    res.writeHead(501);
    res.end();
  } else {
    handler.call(this, req, res);
  }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',
  'json': 'application/json',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'svg': 'image/svg+xml'
};

StaticServlet.prototype.handleRequest = function(req, res) {
  var self = this;
  var path = ('./' + APP_DIRECTORY + req.url.path).replace('//','/').replace(/%(..)/g, function(match, hex){
    return String.fromCharCode(parseInt(hex, 16));
  });
  var parts = path.split('/');
  if (parts[parts.length-1].charAt(0) === '.')
    return self.sendForbidden_(req, res, path);

  //database listing request
  if (parts[parts.length-2] === 'db')
    return self.sendDB_(req, res, path);

  //database post request
  if(parts[parts.length-2] === 'save')
    return self.acceptPost_(req, res, path);

  fs.stat(path, function(err, stat) {
    if (err)
      return self.sendMissing_(req, res, path);

    if (stat.isDirectory())
      return self.sendRedirect_(req, res, path + "../index.html");

    return self.sendFile_(req, res, path);
  });
}

StaticServlet.prototype.acceptPost_ = function(req, res, path) {
  //post is ../app/save/?id=id&title=title&body=body
  var query = url.parse(path).query;
  console.log(query);
  console.log(url.parse(path));
  console.log("saving article: " + query.id)

  Article.findByIdAndUpdate(query.id, {$set: {title: query.title, body: query.body}}, function (err, article) { 
    response ="Saved" 
    if (err) {
      response = "Not Saved";
      util.puts('Save request failed: ' + query.id);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.write(JSON.stringify(response));
    res.end();
    util.puts('Save Request: ' + response);
  });
}

StaticServlet.prototype.sendDB_ = function(req, res, path) {
  //db path request is ..../app/db/?id=[all/uid]
  var query = url.parse(path).query;
  console.log(query);
  console.log(url.parse(path));

  if (query === 'id=all') {
    Article.find({}, 'title body', function (err, article) {  
      if (err) {return;};
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify(article));
      res.end();
      util.puts('200 DB Request');
    }); 
  } else if (query === 'id=new') {
    Article.create({title: "", body: ""}, function(err, article) {
      if(err) {
        console.log("Article Creation failed");
        return handleError(err);
      } else {
        console.log("Article Creation succeded");
      };
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify(article));
      res.end();
      util.puts('200 Creation Request');
    });
  } else {
    console.log(query.split('=')[1]);
    Article.findById(query.split('=')[1], 'title body', function (err, article) {
      if (err) {
        console.log('failed');
        return;
      };
      console.log(article);
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify(article));
      res.end();
      util.puts('200 DB Request');
    });
  }
}

StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(util.inspect(error)) + '</pre>');
  util.puts('500 Internal Server Error');
  util.puts(util.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  util.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  util.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  util.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  res.writeHead(200, {
    'Content-Type': StaticServlet.
      MimeMap[path.split('.').pop()] || 'text/plain'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
  var self = this;
  if (path.match(/[^\/]$/)) {
    req.url.pathname += '/';
    var redirectUrl = url.format(url.parse(url.format(req.url)));
    return self.sendRedirect_(req, res, redirectUrl);
  }
  fs.readdir(path, function(err, files) {
    if (err)
      return self.sendError_(req, res, error);

    if (!files.length)
      return self.writeDirectoryIndex_(req, res, path, []);

    var remaining = files.length;
    files.forEach(function(fileName, index) {
      fs.stat(path + '/' + fileName, function(err, stat) {
        if (err)
          return self.sendError_(req, res, err);
        if (stat.isDirectory()) {
          files[index] = fileName + '/';
        }
        if (!(--remaining))
          return self.writeDirectoryIndex_(req, res, path, files);
      });
    });
  });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};

// Must be last,
main(process.argv);
