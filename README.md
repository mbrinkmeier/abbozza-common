# abbozza-common

The project provides the common classes and files for the graphical and educational programming language abbozza!

## About abbozza!

[abbozza!](http://inf-didaktik.rz.uos.de/abbozza) is a graphical and educational programming language for physical computing.
Currently it supports the following platforms:
* [Arduino](https://arduino.cc) and clones
* [micro:bit](https://microbit.org)
* [Calliope Mini](https://calliope.cc)

It allows graphical programming with [scratch-like blocks](http://scratch.mit.edu) and is based on Googles [Blockly](https://developers.google.com/blockly/)

![An example program](http://inf-didaktik.rz.uos.de/abbozza/img/binaer.png)

abbozza! is being developed by the working group [Didactics of Computer Science](https://www.inf.uni-osnabrueck.de/arbeitsgruppen/didaktik.html) at the [University Osnabrück, Germany](https://uos.de).

## How to build

abbozza-common is a Netbeans Project. It provides the common classes and files for the projects
[abbozza-arduino](https://github.com/mbrinkmeier/abbozza-arduino) and 
[abbozza-calliope](https://github.com/mbrinkmeier/abbozza-calliope), which implement the IDEs for
the specific platforms. The latter additionally requires the installer provided by [abbozza-calliope-install](https://github.com/mbrinkmeier/abbozza-calliope-install).

### Manual build

After cloning the repository just change into the projects directory and run `ant`.
