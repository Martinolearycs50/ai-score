#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  primaryPort: 3000,
  fallbackPorts: [3001, 3002, 8080, 8081],
  host: '0.0.0.0',
  maxRetries: 3,
  healthCheckInterval: 1000,
  healthCheckTimeout: 30000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}[DEV]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  divider: () => console.log('━'.repeat(60))
};

// Check if port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find available port
async function findAvailablePort() {
  const ports = [CONFIG.primaryPort, ...CONFIG.fallbackPorts];
  
  for (const port of ports) {
    if (await isPortAvailable(port)) {
      return port;
    }
    log.warn(`Port ${port} is in use`);
  }
  
  throw new Error('No available ports found');
}

// Kill processes on port
function killProcessOnPort(port) {
  try {
    if (process.platform === 'darwin') {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
    } else {
      execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
    }
  } catch (e) {
    // Ignore errors
  }
}

// Health check
async function waitForServer(port, host) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      const options = {
        hostname: host === '0.0.0.0' ? 'localhost' : host,
        port: port,
        path: '/',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          resolve(true);
        } else {
          setTimeout(check, CONFIG.healthCheckInterval);
        }
      });
      
      req.on('error', () => {
        if (Date.now() - startTime > CONFIG.healthCheckTimeout) {
          reject(new Error('Server health check timeout'));
        } else {
          setTimeout(check, CONFIG.healthCheckInterval);
        }
      });
      
      req.end();
    };
    
    check();
  });
}

// Clean up function
function cleanup() {
  log.info('Cleaning up...');
  
  // Kill any running Next.js processes
  try {
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
  } catch (e) {}
  
  // Clear Next.js cache
  const nextDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextDir)) {
    execSync(`rm -rf ${nextDir}`, { stdio: 'ignore' });
    log.success('Cleared Next.js cache');
  }
}

// Main server start function
async function startDevServer() {
  log.divider();
  log.info('🚀 Starting AI Search Analyzer Development Server');
  log.divider();
  
  // Clean up first
  cleanup();
  
  // Find available port
  let port;
  try {
    port = await findAvailablePort();
    log.success(`Using port ${port}`);
  } catch (error) {
    log.error('No available ports found');
    
    // Try to kill processes and retry
    log.info('Attempting to free up ports...');
    for (const p of [CONFIG.primaryPort, ...CONFIG.fallbackPorts]) {
      killProcessOnPort(p);
    }
    
    port = await findAvailablePort();
  }
  
  // Set environment variables
  process.env.PORT = port;
  process.env.HOST = CONFIG.host;
  
  // Start the server
  log.info('Starting Next.js development server...');
  
  const nextProcess = spawn('npx', ['next', 'dev', '-H', CONFIG.host, '-p', port], {
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1'
    }
  });
  
  // Handle process exit
  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      log.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Wait for server to be ready
  log.info('Waiting for server to be ready...');
  
  try {
    await waitForServer(port, CONFIG.host);
    
    log.divider();
    log.success('🎉 Development server is ready!');
    log.divider();
    log.info(`Local:    ${colors.bright}http://localhost:${port}${colors.reset}`);
    log.info(`Network:  ${colors.bright}http://${getLocalIP()}:${port}${colors.reset}`);
    log.divider();
    log.info('Available endpoints:');
    log.info(`  Free tier:         http://localhost:${port}`);
    log.info(`  Pro tier:          http://localhost:${port}/?tier=pro`);
    log.info(`  Consultation tier: http://localhost:${port}/?tier=consultation`);
    log.divider();
    log.info('Press CTRL+C to stop the server');
    log.divider();
  } catch (error) {
    log.error('Failed to start server: ' + error.message);
    process.exit(1);
  }
}

// Get local IP address
function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Handle shutdown
process.on('SIGINT', () => {
  log.info('\nShutting down gracefully...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Start the server
startDevServer().catch((error) => {
  log.error('Failed to start development server:');
  console.error(error);
  process.exit(1);
});