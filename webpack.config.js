'use strict';

let path = require('path');
let webpack = require('webpack');

let config = {
    entry: {
        app: [
            './src/index.js'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    cache: false,
    plugins: [
    ],
    externals: {
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel'
        }]
    }
};

module.exports = config;
