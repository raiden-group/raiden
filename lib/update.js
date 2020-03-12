
'use strict';
const Catch = require('./catch');
const log = require('./log');
const fs = require('fs-extra');
const child_process = require('./child_process');
const path = require('path');
const rdconfig = require('./.raiden.config.json');

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
module.exports = async function update() {
    const cwd = process.cwd();
    const packagePath = path.resolve(cwd , 'package.json');
    const spainer = log.ora('清除缓存...');
    await Catch.clear();
    spainer.succeed('缓存清除完毕');
    if (fs.existsSync(packagePath)) {
        log.info('更新本地依赖...');
        fs.emptyDirSync(path.resolve(cwd, 'node_modules'));
        await updatePackage({
            package: require(packagePath),
            packagePath,
            cwd
        });
    }
    log.info('更新完成');
}