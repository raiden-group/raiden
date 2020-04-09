const fetch = require('node-fetch');

module.exports = function(...args) {
    return fetch(...args);
}