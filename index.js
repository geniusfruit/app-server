var express = require('express');
var app = express();

var compression = require('compression');
var minifyHTML = require('express-minify-html');

var Helpers = require('./helpers');

function flattenURLList(androidURLS, iosURLS) {
    return new Set(
        Object.keys(androidURLS).concat(Object.keys(iosURLS))
    );
}

function memoizedURLHandler(config) {
    return function (appURL) {

        app.get(appURL, function (req, res) {

            //get the platform
            var platform = Helpers.getPlatformString(req.headers['user-agent']);

            //set required headers
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');

            //todo implement caching using last modified

            if(!config[platform] || !config[platform][appURL]) {
                res.end(Helpers.renderTemplate('404'));
            }
            else {

                var templateParams = Helpers.getTemplateParams(config[platform][appURL]);

                //Required response html
                var responseContent = Helpers.renderTemplate('bootstrap', templateParams);

                //spit the response
                res.end(responseContent);

            }

        });

    }
}

module.exports = function (bundleConfig, port) {

    port = port || 8080;

    //Generate list of registered urls to listen for
    const REGISTERED_URL_LIST = flattenURLList(bundleConfig.android, bundleConfig.ios);

    //minify html
    app.use(minifyHTML({
        override:      true,
        htmlMinifier: {
            removeComments:              true,
            collapseWhitespace:          true,
            collapseInlineTagWhitespace: true,
            collapseBooleanAttributes:   true,
            removeAttributeQuotes:       true,
            removeEmptyAttributes:       true,
            minifyJS:                    true,
            minifyCSS: 				     true
        }
    }));

    //enable compression
    app.use(compression());

    //cache config in memory
    var urlHandler = memoizedURLHandler(bundleConfig);

    //Add listener for registered urls
    REGISTERED_URL_LIST.forEach(urlHandler);

    //Default Handler
    app.get('*', function(req, res){
        res.end(Helpers.renderTemplate('404'));
    });

    //Start the server
    var server = app.listen(port, function() {
        var port = server.address().port;
        console.log('Server listening on port %s', port);
    });

};