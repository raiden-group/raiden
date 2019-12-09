'use strict';

const fs = require('fs-extra');
const path = require('path');
const child_process = require('./child_process');
const log = require('./log');

const { RD_CATCH_CATEGORY_PATH, RD_CATCH_JSON, RD_NPM } = require('./.raiden.config.js');

class Catch {
    constructor() {
        this.catchJSON = path.resolve(__dirname, RD_CATCH_JSON);
        this.catchPath = path.resolve(__dirname, RD_CATCH_CATEGORY_PATH);
    }
    ensureCatch = async function () {
        fs.ensureDirSync(this.catchPath);
        fs.ensureFileSync(this.catchJSON);
        if (fs.readFileSync(this.catchJSON).length == 0) {
            fs.writeJSONSync(this.catchJSON, {});
        };
    }
    clear = async function () {
        return fs.emptyDirSync(path.resolve(this.catchPath, '../'));
    }
    setCatchJson = async function (value) {
        this.ensureCatch();
        const oldjson = fs.readJsonSync(this.catchJSON);
        fs.writeJsonSync(this.catchJSON,Object.assign({}, oldjson, value));
    }
    has = async function (file) {
        this.ensureCatch();
        const json = fs.readJSONSync(this.catchJSON);
        if (!!json[file]) return true;
        return fs.existsSync(path.resolve(this.catchPath, file));
    }
    install = async function (pkg, option, showlog, isDev = true) {
        try {
            return new Promise(async (resolve) => {
                const cmd = `${RD_NPM} install ${pkg} ${isDev ? '--save-dev': '--save'}`;
                const result = await child_process.exec(cmd, option, showlog);
                // this.setCatchJson({[pkg]: true})
                resolve(result);
            })
        } catch(err) {
            log.error(err);
        }
    }
    clone = async (gitPath, option = {cwd: this.catchPath}, showlog = true) => {
        return new Promise(async (resolve) => {
            const name = gitPath.split('/').pop().split('.')[0]
            const hasPath = await this.has(name);
            let result = {status: true};
            if (!hasPath) {
                result = await child_process.exec(`git clone ${gitPath}`, option, showlog);
                const pkgpath = path.resolve(this.catchPath, name, '.git');
                await child_process.exec(`rm -rf ${pkgpath}`,undefined, false);
                if (result.status) {
                    this.setCatchJson({[name]: {
                        git: gitPath,
                        packageName: name
                    }});
                } else {
                    log.error(`load ${name} error`, result.error);
                    process.exit(1);
                }
            }
            resolve(result)
        })
    }
}

module.exports = new Catch();