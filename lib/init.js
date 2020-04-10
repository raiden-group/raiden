'use struct';

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const log = require('./log');
const Catch = require('./catch');
const child_process = require('./child_process');
const rdconfig = require('./.raiden.config.json');
const compressing = require('compressing');
const stream2buffer = require('./stream2buffer');

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
            const configPath = rdconfig['RD_CONFIG_REMOTE_PATH'];
            const p = `${configPath}template.config.js`;
            const res  = await Catch.download(p, 'config/template.config.js', false);
            if (res.code === 0) {
                const list = require(res.catchPath);
                this.templateList = list;
            }
        }
        
        this.initTemplate = async function (sourceDir, {packageName, version}) {
            const copy = async (p) => {
                await fs.copy(p, process.cwd()).then(async (err) => {
                    this.spainer.succeed(`模版: ' ${this.templateName} ' 下载完成`);
                    await this.inistallPackage();
                    process.exit();
                }).catch((error) => {
                    log.error(`模版: ' ${this.templateName}' 初始失败 ${error}`);
                    process.exit(1);
                });
            }
            if (fs.existsSync(sourceDir)) {
                const exactDir = path.join(sourceDir, '../', `./${packageName}-${version}`);
                const exactPath = path.resolve(exactDir, 'package')
                if (fs.existsSync(exactPath)) {
                    await copy(exactPath);
                }
                const stream = fs.createReadStream(sourceDir);
                const buffer = await stream2buffer(stream);
                compressing.tgz.uncompress(buffer, exactDir ).then(() => {
                    copy(exactPath, process.cwd())
                }).catch((error) => {
                    log.error(`模版: ' ${this.templateName}' 解压失败 ${error}`);
                    process.exit(1);
                });
            }
        }
        this.inistallPackage = async function () {
            const cmd = `${rdconfig['RD_NPM']} install`;
            const spainer = log.ora('安装依赖...');
            await child_process.exec(cmd, undefined, false);
            spainer.succeed('依赖安装完成');
        }
        this.loadTemplate = async function () {
            this.spainer = log.ora(`开始下载: ' ${this.templateName} ' 模版`);
            if (this.templateName) {
                const template = this.templateList.find(item => this.templateName === item.name);
                if(!template) {
                    this.spainer.fail(`没有找到该模版: ' ${this.templateName} ' 请联系管理员添加`);
                    process.exit(1);
                }
                const { packageName, version } = template;
                let p = path.resolve('/',packageName, `-/${packageName}-${version}.tgz`);
                p = `${rdconfig.RD_TEMPLATE_SOURCE_PATH}${p}`;
                const res = await Catch.download(p, `template/${packageName}-${version}.tgz`, false);
                const dir = path.resolve(Catch.catchPath, res.catchPath);
                this.initTemplate(dir, template);
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
                    message: "是否清空当前文件夹下项目，选择一个新的模板",
                    name: "clear",
                    choices: choices
                }]
                inquirer.prompt(promptList).then(({clear}) => {
                    resolve(clear === 'yes');
                })
            })
        }
        this.run = async function () {
            try {
                const rdConfigPath = path.resolve(process.cwd(), rdconfig.RD_CONFIG_NAME)
                if (fs.existsSync(rdConfigPath)) {
                    const res = await this.choicesInit();
                    if (res) {
                        const spainer = log.ora('文件清空中...');
                        fs.emptyDirSync(process.cwd());
                        spainer.succeed('文件已清空');
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
            } catch (err) {
                log.error(err);
                process.exit();
            }
        }
    }


}

module.exports = Init;