const http = require('http');
const formidable = require('formidable');
const fs = require('fs');

const server = http.createServer((req, res) => {
  console.log("🚀 ~ file: index.js:7 ~ server ~ req.url :", req.url )

  if (req.url === '/fileupload' && req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      console.log("🚀 ~ file: index.js:11 ~ form.parse ~ files:", files.upload)
      if (err) {
        res.statusCode = 500;
        res.end('Internal server error');
        return;
      }
      const oldpath = files.upload.filepath;
      const ext = files.upload.originalFilename.split('.').pop();
      const newpath = `./temp/${Date.now()}.${ext}`;
      console.log("🚀 ~ file: index.js:18 ~ form.parse ~ newpath:", newpath)

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal server error');
          return;
        }
        res.statusCode = 200;
        res.end(`File uploaded to: ${newpath}`);
      });
    });
  } else {
    res.statusCode = 404;
    res.end('Resource not found');
  }
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
