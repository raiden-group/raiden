
'use strict';
const Catch = require('./catch');
const log = require('./log');
const fs = require('fs-extra');
const child_process = require('./child_process');
const path = require('path');

const rdconfig = require('./.raiden.config.js');
async function updatePackage(ctx) {
    const pkgInfo = ctx.package;
    const { devDependencies } = pkgInfo;
    const midList = [];
    for ( let key in devDependencies ) {
        if (/^rd-(mid|template)/.test(key)) {
            midList.push(key);
            delete devDependencies[key];
        }
    }
    fs.writeFile(ctx.packagePath, JSON.stringify(pkgInfo, null, 2));
    await child_process.exec(`${rdconfig.RD_NPM} i`, {cwd: ctx.cwd}, false);
    // for (let mid of midList) {
    //     await Catch.install(mid, {cwd: ctx.cwd}, false, true);
    // }
}
module.exports = async function update(ctx) {
    const spainer = log.ora('update start');
    await Catch.clear();
    fs.emptyDirSync(path.resolve(ctx.cwd, 'node_modules'));
    await updatePackage(ctx);
    spainer.succeed('update success');
}