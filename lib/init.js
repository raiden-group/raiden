'use struct';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const log = require('./log');
const Catch = require('./catch');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.js');

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
    clone = async function (gitPath, option = {cwd: Catch.catchPath}, showlog = true) {
        return new Promise(async (resolve) => {
            const result = await child_process.exec(`git clone ${gitPath}`, option, showlog);
            if (!Catch.has(gitPath)) {
                if (result.status) {
                    const name = gitPath.split('/').pop().split('.')[0]
                    Catch.setCatchJson({[name]: {
                        gitPath: gitPath,
                        packageName: name
                    }});
                    return result;
                } else {
                    log.error(`load ${gitPath} error`, result.error);
                    process.exit(1);
                }
            }
            resolve(result)
        })
    }
    loadConfig = async function () {
        this.spainer = log.ora('init tempolate config');
        return new Promise(async (resolve) => {
            const configPath = rdconfig['RD_ONLINE_CONFIG_GIT'];
            await this.clone(configPath, undefined, false);
            resolve();
            this.spainer.succeed('template init complete');
        })
    }
    getTemplateList = async function () {
        await this.loadConfig();
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
        this.spainer = log.ora('start create');
        if (this.templateName) {
            const template = this.templateList.find(item => this.templateName = item.name);
            if(!template) {
                log.error(`not find : ${this.templateName}, contact manage to config`);
                process.exit(1);
            }
            const p = path.resolve(Catch.catchPath, template.packageName);
            if ( await Catch.has(template.packageName)) {
                this.initTemplate(p); return;
            }
            const templatePath = template.address || (log.error(`${this.templateName } address error`));
            const cmd = `git clone ${templatePath}`;
            const result = await child_process.exec(cmd, {cwd: Catch.catchPath}, false);
            if (result.status) {
                Catch.setCatchJson({[template.packageName]: true});
                this.initTemplate(p);
            } else {
                log.error(`load ${this.templateName} error`, result.error);
                process.exit(1);
            }
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