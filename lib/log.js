
const ora = require('ora');
module.exports = {
  log: console.log,
  error: function(...err) {
    console.log('\033[37;31m',' [raiden error]:','\033[0m',...err);
  },
  info: function(...text) {
    console.log('\033[37;32m',' [raiden info]:','\033[0m',...text,);
  },
  warn: function(...text) {
    console.log('\033[37;34m',' [raiden warn]:','\033[0m',...text);
  },
  debug: function(...text) {
    if(process.env.__MODE__ === 'debug') {
      console.log('\033[37;34m',' [raiden debug]:','\033[0m',...text);
    }
  },
  clear: function() {
    process.stdout.write('\033[2J');
  },
  ora: function(text) {
    const spainer = ora('\033[37;32m'+'[raiden info]:'+'  \033[0m' + text ).start();
    const succeed = spainer.succeed;
    spainer.succeed = (text, ...other) => {
      succeed.call(spainer,'\033[37;32m'+'[raiden info]:'+'  \033[0m' + text, ...other);
    }
    return spainer;
  }
}