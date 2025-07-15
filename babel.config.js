module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
    '@babel/preset-typescript',
  ],
  // This is needed for cheerio and other ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(cheerio|parse5|parse5-htmlparser2-tree-adapter|domhandler|domutils|dom-serializer|entities|htmlparser2)/)',
  ],
};