const https = require('https');
const fs    = require('fs');
const path  = require('path');
const app   = require('./src/app');

const PORT = process.env.PORT || 3000;

const tlsOptions = {
  key:  fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

https.createServer(tlsOptions, app).listen(PORT, () => {
  console.log(`🔒 Servidor HTTPS corriendo en https://localhost:${PORT}`);
});