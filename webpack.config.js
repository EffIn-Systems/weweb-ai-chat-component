module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.vue']
  },

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },

  output: {
    library: 'YourComponent',
    libraryTarget: 'umd',
    globalObject: 'this'
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
