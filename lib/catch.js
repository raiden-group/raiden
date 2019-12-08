'use strict';

const fs = require('fs-extra');
const path = require('path');

const { RD_CATCH_CATEGORY_PATH, RD_CATCH_JSON } = require('./.raiden.config.js');

class Catch {
    constructor() {
        this.catchJSON = path.resolve(__dirname, catchJSON);
        this.catchPath = path.resolve(__dirname, RD_CATCH_CATEGORY_PATH);
    }
    ensureCatch = async function () {
        fs.ensureDirSync(this.catchPath);
        fs.ensureFileSync(this.catchJSON);
    }
    clear = async function () {
        return fs.emptyDirSync(path.resolve(paththis.catchPath, '../'));
    }
    setCatchJson = async function (value) {
        const oldjson = fs.readJsonSync(this.catchJSON);
        fs.writeJsonSync(Object.assign({}, oldjson, value));
    }
    has = async function (file) {
        const json = fs.readJSONSync(this.catchJSON);
        if (json[file] !== undefined) return true;
        return fs.existsSync(file);
    }
}

module.exports = new Catch();