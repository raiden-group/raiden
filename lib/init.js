'use struct';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const log = require('./log');
const Catch = require('./catch');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.js');
const onlineConfig = require('./onlineConfig');

class Init {
    constructor(program) {
        // 是否指定模版
        if (program && program.template) {
            this.assignTemplate = true;
            this.templateName = program.template;
        } else {
            this.assignTemplate = false;
            this.templateName = null;
        }
    }

    getTemplateList = async function () {
        await onlineConfig.loadConfig();
        const templateList = require(path.resolve(`${Catch.catchPath}`, 'rd-config/config/template.config'))
        this.templateList = templateList || [];
    }
    initTemplate = async function (p) {
        fs.copy(p, process.cwd()).then((err) => {
            this.inistallPackage();
            this.spainer.succeed(`template: ${this.templateName} init complete`);
        }).catch((error) => {
            log.error(`template: ${this.templateName} init error; ${error}`);
            process.exit(1);
        });
    }
    inistallPackage = async function () {
        const cmd = `${rdconfig['RD_NPM']} install`;
        child_process.exec(cmd);
    }
    loadTemplate = async function () {
        this.spainer = log.ora(`start create template: ${this.templateName}`);
        if (this.templateName) {
            const template = this.templateList.find(item => this.templateName = item.name);
            if(!template) {
                log.error(`not find : ${this.templateName}, contact manage to config`);
                process.exit(1);
            }
            const templatePath = template.address || (log.error(`${this.templateName } address error`));
            await Catch.clone(templatePath,undefined, false);
            const p = path.resolve(Catch.catchPath, template.packageName);
            this.initTemplate(p);
        }
    }
    choiceTemplate = async function () {
        if (!this.assignTemplate) {
            const choices = this.templateList.map((item) => {
                const { name, description } = item;
                return {
                    key: name,
                    value: name,
                    name: `${name}: ${description}`
                }
            });
            const promptList = [{
                type: "rawlist",
                message: "choice template:",
                name: "template",
                choices: choices
            }]
            inquirer.prompt(promptList).then(({template}) => {
                this.templateName = template;
                this.loadTemplate();
            })
        }
    }
    run = async function () {
        await Catch.ensureCatch();
        await this.getTemplateList();
        if (this.assignTemplate) {
            this.loadTemplate();
        } else {
            this.choiceTemplate();
        }
    }
}

module.exports = Init;