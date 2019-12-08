'use struct';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const log = require('./log');
const Catch = require('./catch');
const child_process = require('./child_process');
const fdconfig = require('./.raiden.config.js');

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
        this.templateList = [
            {
                name: 'react-mobx',
                address: 'git@github.com:raiden-group/rd-template-react-mobx.git',
                packageName: 'rd-template-react-mobx',
                description: '这是一个react-mobx的模版'
            },
            {
                name: 'react-mobx2',
                packageName: 'rd-template-react-mobx',
                address: 'git@github.com:raiden-group/rd-template-react-mobx.git',
                description: '这是一个react-mobx的模版'
            }
        ]
    }
    initTemplate = async function (p) {
        fs.copy(p, process.cwd()).then((err) => {
            log.info(`${this.templateName} init success`);
            this.inistallPackage();
        }).catch(() => {
            log.error(`${this.templateName} init error; please retry`);
            process.exit(1);
        });
    }
    inistallPackage = async function () {
        const cmd = fdconfig[RD_NPM];
        child_process.exec(cmd);
    }
    loadTemplate = async function () {
        if (this.templateName) {
            const template = this.templateList.find(item => this.templateName = item.name);
            if(!template) {
                log.error(`not find : ${this.templateName}, contact manage to config`);
                process.exit(1);
            }
            const p = path.resolve(Catch.catchPath, template.packageName);
            if (Catch.has(template.packageName)) {
                this.initTemplate(p); return;
            }
            const templatePath = template.address || (log.error(`${this.templateName } address error`));
            const cmd = `git clone ${templatePath}`;
            await Catch.ensureCatch();
            const result = await child_process.exec(cmd, {cwd: Catch.catchPath}, false);
            if (result.status) {
                this.initTemplate(p);
            } else {
                log.error(`load ${this.templateName} error`, result.error);
                process.exit(1);
            }
        }
    }
    choiceTemplate = async function () {
        if (!this.assignTemplate) {
            const choices = this.templateList.map(function (item, index) {
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
        await this.getTemplateList();
        await this.choiceTemplate();
        await this.loadTemplate();
    }
}

module.exports = Init;