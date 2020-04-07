const http = require('http');
const fs = require('fs');
const index = fs.readFileSync('../pages/index.html');
const host = "127.0.0.1";
const port = 3000;
const url = require('url');

const server = http.createServer((req, res) => {
  if (req.url == '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    console.log(req.url + `is received`);
    res.end(index);
  } else {
    // let request_path= req.url.slice(1,req.url.length);
    // console.log(request_path);
    let req_path = url.parse(req.url).pathname;

    console.log(req_path);
    fs.readFile("../pages/" + req_path.substr(1) + ".html", (err, data) => {
      if (err) {
        res.statusCode = 500;
        console.log(err);
        res.end();
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);

      }
    });
  }
});
server.listen(port, host, () => {
  console.log(`server is running at http://${host}:${port}/`);
});