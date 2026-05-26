const http = require('http')

const body = JSON.stringify({
  text: "Onion juice cures diabetes completely"
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/check',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}

const req = http.request(options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('\n--- RESPONSE ---')
    console.log(JSON.parse(data))
  })
})

req.write(body)
req.end()