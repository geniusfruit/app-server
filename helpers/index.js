var fs = require('fs');
var uaParser = require('ua-parser');
var path = require('path');

function _generateScriptTags(jsList) {
    if (!jsList)
        return "";
    else if (jsList.length === 1)
        return "<script type='text/javascript' src='" + jsList[0] + "'></script>";
    else {
        var result = "";
        jsList.map(function (file) {
            result += "<script type='text/javascript' src='" + file + "'></script>";
        });
        return result;
    }
}

function _generateCSSTags(cssList){
    if(!cssList)
        return "";
    else if(cssList.length === 1)
        return "<link rel='stylesheet' href='"+ cssList[0] + "'/>";
    else {
        var result = "";
        cssList.map(function (file) {
            result+="<link rel='stylesheet' href='"+ file + "'/>";
        });
        return result;
    }
}

function _generateShell(shellName){
    return getShellContent(shellName);
}

function getTemplateContent(name) {
    var file_path = path.join(__dirname, '../templates', name + '.html');
    if(fs.existsSync(file_path)) {
        return fs.readFileSync(file_path, 'utf8');
    }
    return "";
}

function getShellContent(name) {
    var file_path = path.join(__dirname, '../templates', 'shells', name + '.html');
    if(fs.existsSync(file_path)) {
        return fs.readFileSync(file_path, 'utf8');
    }
    return "";
}

module.exports = {

    getPlatformString: function(userAgent){
        try {
            var platform = (uaParser.parseOS(userAgent).family).toLowerCase();
            return platform;
        }
        catch (e) {
            return null;
        }
    },

    getTemplateParams: function (config) {
        return {
            JS_FILES: _generateScriptTags(config.js),
            CSS_FILES: _generateCSSTags(config.css),
            FLAGS: config.flags ? ("'" + JSON.stringify(config.flags) + "'") : "'{}'",
            SHELL: _generateShell(config.shell || 'default')
        }
    },

    renderTemplate: function (name, params) {

        var content = getTemplateContent(name);
        for(var key in params) {
            if(params.hasOwnProperty(key)) {
                var re = new RegExp("{{" + key + "}}", 'g');
                content = content.replace(re, params[key]);
            }
        }
        return content;
    }

};