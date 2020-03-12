'use struct';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const log = require('./log');
const Catch = require('./catch');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.json');
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
        this.getTemplateList = async function () {
            await onlineConfig.loadConfig();
            const templateList = require(path.resolve(`${Catch.catchPath}`, 'rd-config/config/template.config'))
            this.templateList = templateList || [];
        }
        this.initTemplate = async function (p) {
            fs.copy(p, process.cwd()).then((err) => {
                this.inistallPackage();
                this.spainer.succeed(`模版: ' ${this.templateName} ' 初始完成`);
                process.exit();
            }).catch((error) => {
                log.error(`模版: ' ${this.templateName}' 初始失败 ${error}`);
                process.exit(1);
            });
        }
        this.inistallPackage = async function () {
            const cmd = `${rdconfig['RD_NPM']} install`;
            child_process.exec(cmd);
        }
        this.loadTemplate = async function () {
            this.spainer = log.ora(`开始下载: ' ${this.templateName} ' 模版`);
            if (this.templateName) {
                const template = this.templateList.find(item => this.templateName === item.name);
                if(!template) {
                    this.spainer.fail(`没有找到该模版: ' ${this.templateName} ' 请联系管理员添加`);
                    process.exit(1);
                }
                const templatePath = template.address || (log.error(`${this.templateName } address error`));
                await Catch.clone(templatePath,undefined, false);
                const p = path.resolve(Catch.catchPath, template.packageName);
                this.initTemplate(p);
            }
        }
        this.choiceTemplate = async function () {
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
        // 如果当前文件夹已存在项目判断是否重新初始化一个模板，删除已有模板
        this.choicesInit = async function () {
            return new Promise((resolve) => {
                const choices = [
                    {
                        key: 1,
                        value: 'yes',
                        name: `yes`
                    },
                    {
                        key: 0,
                        value: 'no',
                        name: `no`
                    },
                ]
                const promptList = [{
                    type: "rawlist",
                    message: "Whether to empty the current existing project and initialize the new template:",
                    name: "clear",
                    choices: choices
                }]
                inquirer.prompt(promptList).then(({clear}) => {
                    resolve(clear === 'yes');
                })
            })
        }
        this.run = async function () {
            const rdConfigPath = path.resolve(process.cwd(), rdconfig.RD_CONFIG_NAME)
            if (fs.existsSync(rdConfigPath)) {
                const res = await this.choicesInit();
                if (res) {
                    fs.emptyDirSync(process.cwd())
                } else {
                    process.exit(1);
                }
            }
            await Catch.ensureCatch();
            await this.getTemplateList();
            if (this.assignTemplate) {
                this.loadTemplate();
            } else {
                this.choiceTemplate();
            }
        }
    }


}

module.exports = Init;