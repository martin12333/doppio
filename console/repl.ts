"use strict";
var readline = require('readline');
var argv = require('optimist').argv;
import jvm = require('../src/jvm');
import runtime = require('../src/runtime');

var jvm_state;

function repl_run(rs: runtime.RuntimeState, cname: string, args: string[], done_cb): void {
  if (cname.slice(-6) === '.class') {
    cname = cname.slice(0, -6);
  }
  jvm_state.run_class(rs, cname, args, done_cb);
}

function read_stdin(resume) {
  process.stdin.resume();
  process.stdin.once('data', function(data) {
    process.stdin.pause();
    resume(data);
  });
}

// initialize the RuntimeState
jvm_state = new jvm.JVM();
var write_stdout = process.stdout.write.bind(process.stdout);
jvm_state.set_classpath(__dirname + "/../vendor/classes", '.');
var rs = new runtime.RuntimeState(write_stdout, read_stdin, jvm_state);

// create the REPL
process.stdin.resume();
var repl = readline.createInterface(process.stdin, process.stdout);

// set up handlers
repl.on('close', function() {
  repl.output.write('\n');
  repl.input.destroy();
});
repl.on('line', function(line: string) {
  var toks = line.trim().split(/\s+/);
  if (toks[0] != null && toks[0].length > 0) {
    repl_run(rs, toks[0], toks.slice(1), () => repl.prompt());
  } else {
    repl.prompt();
  }
});

// set the prompt, display it, and begin the loop
repl.setPrompt('doppio> ');
repl.prompt();
