const path = require('path');
// import path from 'path';

module.exports = {
    entry: {
        betterMyEmailPlugin: './src/client/betterMyEmailPlugin.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                      configFile: path.resolve(__dirname, 'tsconfig.client.json'), // Specify the client config file
                    },
                  },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/client'),
        clean: true,
    },
    mode: 'production'
};