module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: ['text-loader', 'sass-loader?outputStyle=compressed']
      }
    ]
  },
  devtool: 'inline-source-map'
};
