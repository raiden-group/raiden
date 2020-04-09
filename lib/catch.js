'use strict';

const fs = require('fs-extra');
const path = require('path');
const child_process = require('./child_process');
const log = require('./log');
const fetch = require('./fetch');
const paths = require('./paths');
const { RD_CATCH_CATEGORY_PATH, RD_CATCH_JSON, RD_NPM } = require('./.raiden.config.json');

class Catch {
    constructor() {
        const homePath = paths.rdHome();
        this.catchJSON = path.resolve(homePath, RD_CATCH_JSON);
        this.catchPath = path.resolve(homePath, RD_CATCH_CATEGORY_PATH);
        this.ensureCatch = async function () {
            fs.ensureDirSync(this.catchPath);
            fs.ensureFileSync(this.catchJSON);
            if (fs.readFileSync(this.catchJSON).length == 0) {
                fs.writeJSONSync(this.catchJSON, {});
            };
        }
        this.clear = async function () {
            return await fs.emptyDirSync(path.resolve(this.catchPath, '../'));
        }
        this.setCatchJson = async function (value) {
            this.ensureCatch();
            const oldjson = fs.readJsonSync(this.catchJSON);
            fs.writeJsonSync(this.catchJSON,Object.assign({}, oldjson, value));
        }
        this.has = async function (file) {
            this.ensureCatch();
            const json = fs.readJSONSync(this.catchJSON);
            return (!!json[file]) && fs.existsSync(path.resolve(this.catchPath, file));
        }
        this.install = async function (pkg, option, showlog, isDev = true) {
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
        this.save = async function (filename, readStream) {
            return await new Promise(reslove => {
              const writeStream = fs.createWriteStream(filename);
              writeStream.on('finish', () => {
                setTimeout(reslove, 100);
              });
              readStream.pipe(writeStream);
            });
        };
        this.download = async (url, catchName, showlog = true) => {
            let spainer =  null, res = null;
            try {
                const catchPath = path.resolve(this.catchPath, catchName );
                if (!(await this.has(catchName))) {
                    if (showlog) {
                        spainer = log.ora(`开始下载: url(${url})`);
                    }
                    res = await fetch (url);
                    if (res) {
                        this.setCatchJson({
                            [catchName]: true
                        });
                        log.debug(`fetch: ${url}`, JSON.stringify(res));
                        fs.ensureFileSync(catchPath);
                        await this.save(catchPath, res.body);
                    }
                    if (showlog) {
                        spainer.succeed('下载完成');
                    }
                }
                return {
                    status: 'succeed',
                    code: 0,
                    res: res ,
                    catchPath
                };
            } catch (err) {
                spainer && spainer.fail(`fetch: ${url}`);
                console.log(err);
                return {
                    status: 'error',
                    code: 500,
                    res: null,
                    catchPath: ''
                };
            } 
        }
    }
}

module.exports = new Catch();