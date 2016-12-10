#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    configParser = require('turbo-git-config').parser,
    utils = require('turbo-git-config').utils,
    inquirer = require('inquirer');

module.exports = init;

function init() {
    'use strict';
    var localConfig,
        configsData;

    localConfig = utils.checkLocalConfigFile();
    configsData = configParser.getConfigFilesData();

    if (localConfig) {
        utils.showError('You already have a .turbogit file. You need to remove it first.');
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
            prepareFileFormConfig(anwser.configName);
        });
    }

    function getInquirerChoices() {
        //TODO: remove unusefull props for inquirer
        return configsData;
    }


    function prepareFileFormConfig(configName) {
        var projectPath = utils.getGitRepoMainPath(),
            conventionObj = getConventionConf(configName),
            conventionJson;

        conventionJson = conventionObj.getter();
        confirmPrompt(projectPath, conventionJson, configName);
    }

    function getConventionConf(configName) {
        return configsData.filter(function(conf) {
            return conf.value === configName;
        })[0];
    }

    function confirmPrompt(projectPath, jsonData, configName) {
        var question;

        question = [{
            type: 'confirm',
            name: 'confirm',
            message: 'This will create a .turbogit file on ' + projectPath + '/\n Continue? (or enter to confirm)'
        }];

        inquirer.prompt(question).then(function(obj) {
            if (obj.confirm) {
                writeFile(projectPath, jsonData, configName);
                return;
            }
            console.log('Cancelled.');
        });
    }

    function writeFile(projectPath, jsonData, configName) {
        function callback(err) {
            if (err) {
                utils.showError(err);
                return;
            }
            console.log('Done, the .turbogit file was create on your git repo root.');
            if (configName === 'custom') {
                console.log('The custom option It\'s only creating a .turbogit template file. You need to edit it.');
            }
        }
        fs.writeFile(path.join(projectPath, '.turbogit'), JSON.stringify(jsonData), 'utf8', callback);
    }
}
