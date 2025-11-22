const http = require('http');

const postData = JSON.stringify({
  email: 'admin@soug-elwahah.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
 console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Response body:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();