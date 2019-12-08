'use strict';

const fs = require('fs-extra');
const path = require('path');

const { RD_CATCH_CATEGORY_PATH, RD_CATCH_JSON } = require('./.raiden.config.js');

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
}

module.exports = new Catch();