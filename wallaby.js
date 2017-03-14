module.exports = function (wallaby) {
    return {
        files: [
            'src/**/*.js',
            'test/mocks/*.js'
        ],

        tests: [
            'test/**/*.test.js'
        ],
        setup: function (wallaby) {
            var mocha = wallaby.testFramework;
            mocha.ui('tdd');
            // etc.
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel()
        },
        env: {
            type: 'node'
        }
    };
};