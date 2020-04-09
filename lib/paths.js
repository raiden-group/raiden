const path = require('path');
const ENV = process.env;

module.exports =  {
    homePath: function() {
        return ENV.HOME || ENV.USERPROFILE
    },
    rdHome: function() {
        return path.join(this.homePath(), '.raiden');
    }
}