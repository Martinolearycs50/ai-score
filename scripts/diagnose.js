#!/usr/bin/env node

const { execSync } = require('child_process');
const http = require('http');
const net = require('net');

console.log('🔍 Running Network Diagnostics for AI Search Analyzer\n');

// Check Node.js version
console.log('1. Node.js Version:');
console.log('   ' + process.version);
console.log('   ✓ Minimum required: v18.0.0\n');

// Check localhost resolution
console.log('2. Localhost Resolution:');
try {
  const dns = require('dns');
  dns.lookup('localhost', (err, address) => {
    if (err) {
      console.log('   ✗ Error resolving localhost:', err);
    } else {
      console.log('   ✓ localhost resolves to:', address);
    }
  });
} catch (e) {
  console.log('   ✗ DNS lookup failed');
}

// Check if we can create a server
console.log('\n3. Server Creation Test:');
const testServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Test server works!');
});

testServer.on('error', (err) => {
  console.log('   ✗ Cannot create server:', err.message);
});

testServer.listen(0, '127.0.0.1', () => {
  const { port } = testServer.address();
  console.log(`   ✓ Test server created on port ${port}`);

  // Test connection
  http
    .get(`http://127.0.0.1:${port}`, (res) => {
      console.log('   ✓ Successfully connected to test server');
      testServer.close();
    })
    .on('error', (err) => {
      console.log('   ✗ Cannot connect to test server:', err.message);
      testServer.close();
    });
});

// Check firewall status
console.log('\n4. Firewall Status:');
try {
  if (process.platform === 'darwin') {
    const pfctl = execSync('sudo pfctl -s info 2>&1', { encoding: 'utf8' });
    if (pfctl.includes('Status: Enabled')) {
      console.log('   ⚠️  macOS firewall is enabled');
      console.log(
        '   You may need to allow Node.js in System Preferences > Security & Privacy > Firewall'
      );
    } else {
      console.log('   ✓ macOS firewall is not blocking');
    }
  }
} catch (e) {
  console.log('   ℹ️  Could not check firewall status (requires sudo)');
}

// Check for common port conflicts
console.log('\n5. Port Availability:');
const portsToCheck = [3000, 3001, 3002, 8080];

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

Promise.all(
  portsToCheck.map((port) =>
    checkPort(port).then((available) =>
      console.log(`   Port ${port}: ${available ? '✓ Available' : '✗ In use'}`)
    )
  )
).then(() => {
  // Check Next.js installation
  console.log('\n6. Next.js Installation:');
  try {
    const nextPath = require.resolve('next/package.json');
    const nextPkg = require(nextPath);
    console.log('   ✓ Next.js version:', nextPkg.version);
  } catch (e) {
    console.log('   ✗ Next.js not found');
  }

  // Check for proxy settings
  console.log('\n7. Proxy Settings:');
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY'];
  let hasProxy = false;
  proxyVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`   ⚠️  ${varName} is set:`, process.env[varName]);
      hasProxy = true;
    }
  });
  if (!hasProxy) {
    console.log('   ✓ No proxy configured');
  }

  // Final recommendations
  console.log('\n📋 Recommendations:');
  console.log('   1. Run: npm run dev:stop   (to kill any stuck processes)');
  console.log('   2. Run: npm run dev        (to start with our robust script)');
  console.log('   3. If still failing, try:  npm run dev:simple');
  console.log('   4. Check if any VPN or security software is running');
  console.log('   5. Try restarting your computer to clear network state\n');
});
