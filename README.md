# Overview
MärklinSim is a software simulation of a Märklin train set. It accepts train set commands through a TCP port
or a Unix domain socket, instead of serial I/O which the real Märklin train controller uses.

The default setup is a copy of the ones in UWaterloo MC3018 (aka the train lab).

If you are taking CS 452, this project should only be used as a reference when the track set is not available. You should always test your program on an actual hardware. 

# Demo

![Screenshot of MärklinSim](doc/TrackA.png?raw=true)

[![Video demo of MärklinSim](https://img.youtube.com/vi/IRfwhlV-NT4/0.jpg)](https://www.youtube.com/watch?v=IRfwhlV-NT4)

# Get started
MärklinSim is based on Electron, therefore it is cross-platform naturally.

You need to install Node.js before using MärklinSim. Node v8.x.x is recommended.

Run `npm install` at the root directory of this project once you have a Node environment.

Run `npm run compile-main` at the root directory of this project to compile TypeScript source files.

Run `npm run copy-resources` at the root directory of this project to copy resource files.

Run `./node_modules/.bin/electron ./dist/main.js` to start the program. By default it will listen TCP port 3018.

# Use MärklinSim with your train program

In CS 452 at University of Waterloo, the train program runs on a TS7200 ARM box.
If your program also does so, you can either run your program on QEMU, or redirect the UART communication of your ARM box to a TCP port.

Here I will give an example of using QEMU with MärklinSim. First, run MärklinSim. Then run `QEMU_AUDIO_DRV=none qemu-system-arm -M versatilepb -m 128M -nographic -nodefaults -serial tcp:127.0.0.1:3018 -serial stdio -kernel ./YOUR_PROGRAM.bin`.
