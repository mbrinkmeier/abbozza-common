/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for the handling of LEDs
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
Abbozza.DeviceSpeaker = {
    devtype: "dev_speaker",
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(_("dev.SPEAKER"))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME")
                .appendField(_("dev.AT"))
                .appendField(new PinDropdown(PinDropdown.DIGITAL), "PIN");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    getName: function () {
        return this.getFieldValue("NAME");
    },
    generateCode: function (generator) {
        var pin = generator.fieldToCode(this,"PIN");
        return "pinMode(" + pin + ",OUTPUT);";
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }

};


Abbozza.DeviceSpeakerMute = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput("FREQUENCY")
                .appendField(__("dev.SPEAKER_MUTE",0))
                .appendField(new DeviceDropdown(this, "dev_speaker", Abbozza.blockDevices), "NAME")
                .appendField(__("dev.SPEAKER_MUTE",1));
        this.setInputsInline(true);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var pin = generator.fieldToCode(device,"PIN");
        return "noTone(" + pin + ");";
    }    
};

Abbozza.DeviceSpeakerPlay = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(__("dev.SPEAKER_PLAY",0))
                .appendField(new DeviceDropdown(this, "dev_speaker", Abbozza.blockDevices), "NAME");
        this.appendValueInput("FREQUENCY")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_PLAY",1))
                .setCheck("NUMBER");
        this.setInputsInline(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var freq = generator.valueToCode(this,"FREQUENCY");
        var pin = generator.fieldToCode(device,"PIN");
        return "tone(" + pin + "," + freq + ");";
    }
};


Abbozza.DeviceSpeakerPlayDur = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(__("dev.SPEAKER_PLAY_DUR",0))
                .appendField(new DeviceDropdown(this, "dev_speaker", Abbozza.blockDevices), "NAME");
        this.appendValueInput("FREQUENCY")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_PLAY_DUR",1))
                .setCheck("NUMBER");
        this.appendValueInput("DURATION")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_PLAY_DUR",2))
                .setCheck("NUMBER");
        this.setInputsInline(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var freq = generator.valueToCode(this,"FREQUENCY");
        var dur = generator.valueToCode(this,"DURATION");
        var pin = generator.fieldToCode(device,"PIN");
        return "tone(" + pin + "," + freq + "," + dur + ");";
    }
};


Abbozza.DeviceSpeakerOctaves = null;

Abbozza.DeviceSpeakerNotes = [];
Abbozza.DeviceSpeakerNames = ["C","CS","D","DS","E","F","FS","G","GS","A","AS","B"];
Abbozza.DeviceSpeakerSymbols = ["C","♯C","D","♯D","E","F","♯F","G","♯G","A","♯A","B"];
Abbozza.DeviceSpeakerFrequencies = [
    33,     35,   27,   39,   41,   44,   46,   49,   52,   55,   58,   62, 
    65,     69,   73,   78,   82,   87,   93,   98,  104,  110,  117,  123,
    131,   139,  147,  156,  165,  175,  185,  196,  208,  220,  233,  247,
    262,   277,  294,  311,  330,  349,  370,  392,  415,  440,  466,  494,
    523,   554,  587,  622,  659,  698,  740,  784,  831,  880,  932,  988,
    1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976,
    2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951
];

for ( var note in Abbozza.DeviceSpeakerNames ) {
    var symbol = Abbozza.DeviceSpeakerSymbols[note];
    Abbozza.DeviceSpeakerNotes.push([symbol,note]);
}

Abbozza.DeviceSpeakerNote = {
    init: function () {
        if (Abbozza.DeviceSpeakerOctaves == null ) {
            Abbozza.DeviceSpeakerOctaves = [
                [_("dev.OCTAVE_CONTRA"),"1"],
                [_("dev.OCTAVE_GREAT"),"2"],
                [_("dev.OCTAVE_SMALL"),"3"],
                [_("dev.OCTAVE_ONE_LINE"),"4"],
                [_("dev.OCTAVE_TWO_LINE"),"5"],
                [_("dev.OCTAVE_THREE_LINE"),"6"],
                [_("dev.OCTAVE_FOUR_LINE"),"7"]
            ];        
        }
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(__("dev.SPEAKER_NOTE",0))
                .appendField(new DeviceDropdown(this, "dev_speaker", Abbozza.blockDevices), "NAME");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_NOTE",1))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerNotes),"NOTE");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_NOTE",2))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerOctaves),"OCTAVE");
        this.setInputsInline(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var note = parseInt(this.getFieldValue("NOTE"));
        var octave = parseInt(this.getFieldValue("OCTAVE"));
        var frequency = Abbozza.DeviceSpeakerFrequencies[(octave-1)*12+note];
        var pin = generator.fieldToCode(device,"PIN");
        var frequency;
        return "tone(" + pin + "," + frequency + ");";
    }
};

Abbozza.DeviceSpeakerNoteDur = {
    init: function () {
        if (Abbozza.DeviceSpeakerOctaves == null ) {
            Abbozza.DeviceSpeakerOctaves = [
                [_("dev.OCTAVE_CONTRA"),"1"],
                [_("dev.OCTAVE_GREAT"),"2"],
                [_("dev.OCTAVE_SMALL"),"3"],
                [_("dev.OCTAVE_ONE_LINE"),"4"],
                [_("dev.OCTAVE_TWO_LINE"),"5"],
                [_("dev.OCTAVE_THREE_LINE"),"6"],
                [_("dev.OCTAVE_FOUR_LINE"),"7"]
            ];        
        }
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(__("dev.SPEAKER_NOTE_DUR",0))
                .appendField(new DeviceDropdown(this, "dev_speaker", Abbozza.blockDevices), "NAME");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_NOTE_DUR",1))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerNotes),"NOTE");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_NOTE_DUR",2))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerOctaves),"OCTAVE");
        this.appendValueInput("DURATION")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SPEAKER_NOTE_DUR",3))
                .setCheck("NUMBER");
        this.setInputsInline(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var note = parseInt(this.getFieldValue("NOTE"));
        var octave = parseInt(this.getFieldValue("OCTAVE"));
        var duration = generator.valueToCode(this,"DURATION");
        var frequency = Abbozza.DeviceSpeakerFrequencies[(octave-1)*12+note];
        var pin = generator.fieldToCode(device,"PIN");
        var frequency;
        return "tone(" + pin + "," + frequency + "," + duration + ");";
    }
};

Abbozza.DeviceSpeakerNoteInt = {
    init: function () {
        if (Abbozza.DeviceSpeakerOctaves == null ) {
            Abbozza.DeviceSpeakerOctaves = [
                [_("dev.OCTAVE_CONTRA"),"1"],
                [_("dev.OCTAVE_GREAT"),"2"],
                [_("dev.OCTAVE_SMALL"),"3"],
                [_("dev.OCTAVE_ONE_LINE"),"4"],
                [_("dev.OCTAVE_TWO_LINE"),"5"],
                [_("dev.OCTAVE_THREE_LINE"),"6"],
                [_("dev.OCTAVE_FOUR_LINE"),"7"]
            ];        
        }
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(__("dev.SPEAKER_NOTE_INT",0))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerNotes),"NOTE")
                .appendField(__("dev.SPEAKER_NOTE_INT",1))
                .appendField(new Blockly.FieldDropdown(Abbozza.DeviceSpeakerOctaves),"OCTAVE");
        this.setInputsInline(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true,"NUMBER");
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var note = parseInt(this.getFieldValue("NOTE"));
        var octave = parseInt(this.getFieldValue("OCTAVE"));
        var frequency = Abbozza.DeviceSpeakerFrequencies[(octave-1)*12+note];
        return "" + frequency;
    }
};

Blockly.Blocks['dev_speaker'] = Abbozza.DeviceSpeaker;
Blockly.Blocks['dev_speaker_mute'] = Abbozza.DeviceSpeakerMute;
Blockly.Blocks['dev_speaker_play'] = Abbozza.DeviceSpeakerPlay;
Blockly.Blocks['dev_speaker_play_dur'] = Abbozza.DeviceSpeakerPlayDur;
Blockly.Blocks['dev_speaker_note'] = Abbozza.DeviceSpeakerNote;
Blockly.Blocks['dev_speaker_note_dur'] = Abbozza.DeviceSpeakerNoteDur;
Blockly.Blocks['dev_speaker_note_int'] = Abbozza.DeviceSpeakerNoteInt;
