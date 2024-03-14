//Create web server
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var comments = require('./comments.json');
var path = require('path');

var server = http.createServer(function(req, res) {
  var uri = url.parse(req.url);
  if (uri.pathname == '/comments' && req.method == 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(comments));
  } else if (uri.pathname == '/comments' && req.method == 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk.toString();
    });
    req.on('end', function() {
      var comment = qs.parse(body);
      comments.push(comment);
      fs.writeFile('comments.json', JSON.stringify(comments), function(err) {
        if (err) console.error(err);
      });
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(comments));
    });
  } else {
    var filename = path.join(process.cwd(), uri.pathname);
    fs.exists(filename, function(exists) {
      if(!exists) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
      }
      fs.readFile(filename, 'binary', function(err, file) {
        if(err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.write(err + '\n');
          res.end();
          return;
        }
        res.writeHead(200);
        res.write(file, 'binary');
        res.end();
      });
    });
  }
}).listen(3000);
console.log('Server running at http://localhost:3000/');