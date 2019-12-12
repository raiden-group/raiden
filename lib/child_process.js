const child_process = require('child_process');
const log = require('./log');

class ChildProcess {
    exec = async function(cmd, options = { cwd: process.cwd() }, showlog = true) {
        let spainer = null;
        if (showlog) {
            spainer = log.ora(cmd);
        }
        return new Promise((resolve) => {
            child_process.exec(cmd, options, (error) => {
              if ( error ) {
                if (showlog && spainer) {
                    log.error(`\n${cmd}`, error)
                    spainer.stop();
                    process.exit(1);
                }  
                resolve({
                    status: false,
                    error
                });
              }
              if (showlog && spainer) {
                spainer.succeed(`${cmd}`);
              }
              resolve({status: true});
            });
          })
    }
}
module.exports = {
    ...child_process,
    ...(new ChildProcess())
};