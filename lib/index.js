#!/usr/bin/env node

const program = require('./commander');
const Command = require('./command');
const pkg = require('../package.json');
const Context =  require('./context');
const log = require('./log');
const Init = require('./init');
const update = require('./update');

program.version(pkg.version);
// 内置指令

const getOption = (cmd) => {
  return cmd ? (cmd.option || {} ) : {};
}
 
program
.command('d', )
.alias('dev')
.option('-o, --option [option]')
.description('run dev')
.action(function(cmd) {
  const command = new Command('dev');
  const context = new Context(command, getOption(cmd));
  context.run();
})

program
  .command('b', )
  .alias('build')
  .option('-o, --option [option]')
  .description('run build')
  .action(function(cmd) {
    const command = new Command('build');
    const context = new Context(command, getOption(cmd));
    context.run();
  })
program
  .command('i')
  .alias('init')
  .option('-t, --template <template>')
  .option('-o, --option [option]')
  .description('run i')
  .action(function(p) {
    const context = new Init(p);
    context.run();
  })
program
  .command('u')
  .alias('update')
  .description('run update')
  .action(function() {
    update();
  })
program
  .command('run <cmd>')
  .action(function(cmd) {
    const command = new Command(cmd);
    const context = new Context(command);
    context.run();
  })
// 执行错误的命令
program.register("*", function(c) {
  log.error("该指令不存在");
});
program.parse(process.argv);
