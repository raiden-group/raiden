#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();

program.register = function (command, action) {
  if (command) {
    const commandList = command.split(' ');
    const cmds = commandList.shift();
    ((cmds || '').split(',')).map(function(cmd) {
      program
      .command(cmd)
      .option((commandList || []).join(' '))
      .action(function() {
        Array.prototype.unshift.call(arguments, cmd)
        action.apply( this, arguments);
      });
    }) 
  }
}
module.exports = program;