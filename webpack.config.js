module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {modules: false}]
            ]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'to-string-loader',
          'css-loader?importLoaders=1',
          'postcss-loader',
          'sass-loader?outputStyle=compressed'
        ]
      }
    ]
  },
  devtool: 'inline-source-map'
};
