#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    configParser = require('turbo-git-config').parser,
    utils = require('turbo-git-config').utils,
    inquirer = require('inquirer');

module.exports = init;

function init() {
    'use strict';
    var configJson,
        localConfig,
        configsData;

    localConfig = utils.checkLocalConfigFile();
    configsData = configParser.getConfigFilesData();

    if (localConfig) {
        utils.showError('You already have a .turbogit file. You need to remove it first.')
    } else { //default conf
        initCommand();
    }

    function initCommand() {
        var questions;

        questions = [{
            type: 'list',
            name: 'configName',
            message: 'Select the commit convention to use',
            choices: getInquirerChoices()
        }];

        inquirer.prompt(questions).then(function(anwser) {
            prepareFileFormConfig(anwser);
        });
    }

    function getInquirerChoices() {
        //TODO: remove unusefull porps for inquirer
        return configsData;
    }


    function prepareFileFormConfig(anwser) {
        var projectPath = utils.getGitRepoMainPath(),
            conventionObj = getConventionConf(anwser.configName),
            conventionJson;

        conventionJson = conventionObj.getter();
        confirmPrompt(projectPath, conventionJson)
    }

    function getConventionConf(configName) {
        return configsData.filter(function(conf) {
            console.log(conf, configName)
            return conf.value == configName;
        })[0];
    }

    function confirmPrompt(projectPath, jsonData) {
        var question;

        question = [{
            type: 'confirm',
            name: 'confirm',
            message: 'This will create a .turbogit file on ' + path + '/\n Continue? (or enter to confirm)',
        }];

        inquirer.prompt(question).then(function(obj) {
            if (obj.confirm) {
                writeFile(projectPath, jsonData)
            }
        });
    }

    function writeFile(projectPath, jsonData) {
        function callback(err) {
            if (err) {
                utils.showError(err);
                return;
            }
            console.log('Done, the .turbogit file was create on your git repo root.');
        }
        fs.writeFile(path.join(projectPath, '.turbogit'), JSON.stringify(jsonData), 'utf8', callback);
    }
}
