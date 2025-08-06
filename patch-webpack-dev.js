const fs = require('fs');
const path = require('path');

// Target the correct webpack config file
const webpackConfigPath = path.join(__dirname, 'node_modules', '@weweb', 'cli', 'webpack.dev.config.js');

if (fs.existsSync(webpackConfigPath)) {
  console.log(`Found webpack config at: ${webpackConfigPath}`);
  
  let config = fs.readFileSync(webpackConfigPath, 'utf8');
  
  // Show current externals configuration
  const externalsMatch = config.match(/externals:\s*[{[].+?[}\]]/gs);
  if (externalsMatch) {
    console.log('Current externals config:', externalsMatch[0]);
  }
  
  // Replace externals configuration
  let modified = false;
  
  // Try different patterns
  if (config.includes("externals: ['react', 'react-dom']")) {
    config = config.replace("externals: ['react', 'react-dom']", "externals: []");
    modified = true;
  } else if (config.match(/externals:\s*\{[^}]*react[^}]*\}/)) {
    config = config.replace(/externals:\s*\{[^}]*react[^}]*\}/g, "externals: {}");
    modified = true;
  } else if (config.match(/externals:\s*\[[^\]]*\]/)) {
    config = config.replace(/externals:\s*\[[^\]]*\]/g, "externals: []");
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(webpackConfigPath, config);
    console.log('✅ Patched webpack config to remove React from externals');
  } else {
    console.log('⚠️ Could not find externals configuration to patch');
  }
} else {
  console.log('❌ Webpack config not found at expected location');
}
