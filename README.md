# abbozza-arduino

The project provides the graphical programming language abbozza! for Arduino compatible boards.
A precompiled version, including an installation guide, can be found at 
[the projects homepage](http://inf-didaktik.rz.uos.de/abbozza/).

## About abbozza!

[abbozza!](http://inf-didaktik.rz.uos.de/abbozza) is a graphical and educational programming language for physical computing.
Currently it supports the following platforms:
* [Arduino](https://arduino.cc) and clones
* [micro:bit](https://microbit.org)
* [Calliope Mini](https://calliope.cc)

It allows graphical programming with [scratch-like blocks](http://scratch.mit.edu) and is based on Googles [Blockly](https://developers.google.com/blockly/)

![An example program](http://inf-didaktik.rz.uos.de/abbozza/img/binaer.png)

[abbozza!](http://inf-didaktik.rz.uos.de/abbozza) is being developed by the working group [Didactics of Computer Science](https://www.inf.uni-osnabrueck.de/arbeitsgruppen/didaktik.html) at the [University Osnabrück, Germany](https://uos.de).

## How to use

**abbozza-common** provides classes and files for the platform-specific IDEs. As such it is a prerequisite for the platform specific projects [abbozza-arduino](https://github.com/mbrinkmeier/abbozza-arduino) and 
[abbozza-calliope](https://github.com/mbrinkmeier/abbozza-calliope).

**abbozza-calliope** provides the interface and IDE for the [Calliope Mini](https://calliope.cc).

## How to build

**abbozza-arduino** is a Netbeans Project.

### Manual build

#### Preparations
Prepare a directory which may hold all required projects. In addition `ant`, and Java Developement Kit ( at least JDK 8)
need to be installed. In addition the [Arduino IDE](http://arduino.cc) needs to be installed.

#### 1st Step
Clone the repository [abbozza-common](https://github.com/mbrinkmeier/abbozza-common):
`git clone https://github.com/mbrinkmeier/abbozza-common.git`.
Change into `abbozza-common` and execute `ant`.

#### 2nd Step
Clone the repository [abbozza-arduino](https://github.com/mbrinkmeier/abbozza-arduino) to the same directory
you cloned [abbozza-common](https://github.com/mbrinkmeier/abbozza-common) to (i.e. the project direcorties
abboza-common and abbozza-calliope are at the same level):
`git clone https://github.com/mbrinkmeier/abbozza-arduino.git`.
Change into `abbozza-arduino` and execute `ant`.

#### 3rd Step
The installer jar can be found in `abbozza-arduino/dist`. Run it:
`java -jar abbozza-arduino.jar`
