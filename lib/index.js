#!/usr/bin/env node

const program = require('./commander');
const Command = require('./command');
const pkg = require('../package.json');
const Context =  require('./context');
program.version(pkg.version);
// 内置指令

 
program
.command('d', )
.alias('dev')
.description('run dev')
.action(function() {
  const command = new Command('dev');
  const context = new Context(command);
  context.run();
})

program
  .command('b', )
  .alias('build')
  .description('run build')
  .action(function(cmd) {
    const command = new Command('build');
    const context = new Context(command);
    context.run();
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
  console.log("请输入正确的命令");
});
program.parse(process.argv);
