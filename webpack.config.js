cat > webpack.config.js << 'EOF'
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
};
EOF