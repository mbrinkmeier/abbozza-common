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
 * @fileoverview A blockly hack that provides different tab geometries, depending on the type
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */


var TabMgr = {};

TabMgr.getTab = function (type, down) {
    var tab;
    switch (type) {
        case "STRING"	:
            if (down)
                tab = "l -8,-7.5 8,-7.5";
            else
                tab = "l -8,7.5 l 8,7.5";
            break;
        case "NUMBER"	:
            if (down)
                tab = "c -8,0 -8,-15 0,-15";
            else
                tab = "c -8,0 -8,15 0,15";
            break;
        case "DECIMAL"	:
            if (down)
                tab = "l -8,0 0,-15 8,0";
            else
                tab = "l -8,0 l 0,15 l 8,0";
            break;
        case "BOOLEAN"		:
            if (down)
                tab = "c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5";
            else
                tab = "c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5";
            break;
        case "ARR_DIM"	:
            if (down)
                tab = "l 0,-4 l -8,4 l 0,-15 l 8,4 l 0,-4";
            else
                tab = "l 0,4 l -8,-4 l 0,15 l 8,-4 l 0,4";
            break;
        case "VOID" :
            if (down)
                tab = "l 0,-15";
            else
                tab = "l 0,15";
            break;
        default:
            if (down)
                tab = "c -3.75,0 -3.75,-7.5 0,-7.5 c -3.75,0 -3.75,-7.5 0,-7.5";
            else
                tab = "c -3.75,0 -3.75,7.5 0,7.5 c -3.75,0 -3.75,7.5 0,7.5";
    }

    return tab;
};



Blockly.RenderedConnection.prototype.highlight = function () {
    var steps;
    if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
        // OLD STUFF
        // steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5';
        var tabWidth = this.sourceBlock_.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
                Blockly.BlockSvg.TAB_WIDTH;

        var type = "";
        if (this.check_)
            type = this.check_[0];

        // if (Blockly.localConnection_ && Blockly.localConnection_.check_) type = Blockly.localConnection_.check_[0];

        var tab = "";
        tab = TabMgr.getTab(type, false);

        steps = "m 0,0 v 5 " + tab + " v 5";
    } else {
        // OLD STUFF
        // steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT + ' h 5';
        if (this.sourceBlock_.RTL) {
          if ( this.check_ && (this.check_[0] == "DEVICE") ) {
            steps = ' m 20,0 h -5' +  Blockly.BlockSvg.NOTCH_PATH_RIGHT_DEVICE + ' h -5';
          } else {
            steps = 'm 20,0 h -5 ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -5';
          }
        } else {
          if ( this.check_ && (this.check_[0] == "DEVICE") ) {
            steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT_DEVICE + ' h 5';              
          } else {
            steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT + ' h 5';
          }
        }
    }
    var xy = this.sourceBlock_.getRelativeToSurfaceXY();
    var x = this.x_ - xy.x;
    var y = this.y_ - xy.y;
    Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
            {'class': 'blocklyHighlightedConnectionPath',
                'd': steps,
                transform: 'translate(' + x + ',' + y + ')' +
                        (this.sourceBlock_.RTL ? ' scale(-1 1)' : '')},
            this.sourceBlock_.getSvgRoot());
};


/**
 * New renderDrawLeft_
 * 
 * @param {type} steps
 * @param {type} highlightSteps
 * @returns {undefined}
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function (steps, highlightSteps) {
    if (this.outputConnection) {
        // Create output connection.
        this.outputConnection.setOffsetInBlock(0, 0);

        // Get type of connection
        var type = "";
        if (this.outputConnection.check_)
            type = this.outputConnection.check_[0];

        steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
        // steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        //     Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        //     ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');


        // Choose tab by type
        var tab = "";
        tab = TabMgr.getTab(type, true);
        steps.push(tab);

        if (this.RTL) {
            /**
             * @TODO
             */
            highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.25) + ',8.4');
            highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
        } else {
            // OLD STUFF
            // 
            // highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1.5);
            // highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
            //                    ',-0.5 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
            //                    ',-5.5 0,-11');
            // highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
            //                     ',1 V 0.5 H 1');
            //
            // END OF OLD STUFF
            switch (type) {
                case "STRING" 	:
                    highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1);
                    highlightSteps.push('m -8,-7.5 l 8,-7.5 l 0,-3');
                    break;
                case "NUMBER" 	:
                    highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT + 1);
                    highlightSteps.push('m -6.5,-8 c 0,-4 2,-8 6.5,-8 l 0,-4');
                    break;
                case "DECIMAL" 	:
                    highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
                    highlightSteps.push('m -8,0 l 0,-15 8,0 0,-3.5');
                    break;
                case "BOOLEAN" 	:
                    highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1);
                    highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                            ',-1 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                            ',-5.5 0,-11');
                    highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                            ',1 V 1 H 2');
                    break;
                case "ARR_DIM"	:
                    highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 2);
                    highlightSteps.push('m -8,2 l 0,-14 m 8,2 l 0,-6');
                    break;
                default	:
                    highlightSteps.push('l 0,-24');
            }
        }
        this.width += Blockly.BlockSvg.TAB_WIDTH;
    } else if (!this.RTL) {
        if (this.squareTopLeftCorner_) {
            // Statement block in a stack.
            highlightSteps.push('V', 0.5);
            // ALTERNATE:VERSION highlightSteps.push('V', 1);
        } else {
            highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
        }
    }
    steps.push('z');
};


// connectionXY is missing !!
/**
 * 
 * @param {type} steps
 * @param {type} highlightSteps
 * @param {type} inlineSteps
 * @param {type} highlightInlineSteps
 * @param {type} inputRows
 * @param {type} iconWidth
 * @returns {Blockly.BlockSvg.MIN_BLOCK_Y|Number}
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function (steps, highlightSteps,
        inlineSteps, highlightInlineSteps, inputRows, iconWidth) {
    var cursorX;
    var cursorY = 0;
    var connectionX, connectionY;
    for (var y = 0, row; row = inputRows[y]; y++) {
        cursorX = Blockly.BlockSvg.SEP_SPACE_X;
        if (y == 0) {
            cursorX += this.RTL ? -iconWidth : iconWidth;
        }

        // ALTERNATIVE VERSION    highlightSteps.push('M', (inputRows.rightEdge - 1) + ',' + (cursorY + 1));    
        highlightSteps.push('M', (inputRows.rightEdge - 0.5) + ',' +
                (cursorY + 0.5));
        if (this.isCollapsed()) {
            // Jagged right edge.
            var input = row[0];
            var fieldX = cursorX;
            var fieldY = cursorY;
            this.renderFields_(input.fieldRow, fieldX, fieldY);
            steps.push(Blockly.BlockSvg.JAGGED_TEETH);
            highlightSteps.push('h 8');
            var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
            steps.push('v', remainder);
            if (this.RTL) {
                highlightSteps.push('v 3.9 l 7.2,3.4 m -14.5,8.9 l 7.3,3.5');
                highlightSteps.push('v', remainder - 0.7);
            }
            this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
        } else if (row.type == Blockly.BlockSvg.INLINE) {
            // Inline inputs.
            for (var x = 0; x < row.length ; x++) {
                var input = row[x];
                var fieldX = cursorX;
                var fieldY = cursorY;
                if (row.thicker) {
                    // Lower the field slightly.
                    fieldY += Blockly.BlockSvg.INLINE_PADDING_Y;
                }
                // TODO: Align inline field rows (left/right/centre).
                cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
                if (input.type != Blockly.DUMMY_INPUT) {
                    cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
                }
                if (input.type == Blockly.INPUT_VALUE) {
                    inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X) +
                            ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y));
                    inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                            input.renderWidth);

                    // NEW STUFF        
                    // Choose tab by type                   
                    var type = "";
                    if (input.connection.check_) type = input.connection.check_[0];
                    if ( input.connection.targetConnection != null && input.connection.targetConnection.check_ ) {
                             type = input.connection.targetConnection.check_[0];
                    }
                    var tab;

                    tab = TabMgr.getTab(type, false);

                    // inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
                    inlineSteps.push('v 5 ' + tab);
                    // END OF NEW STUFF
                    //                     
                    // OLD STUFF inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
                    inlineSteps.push('v', input.renderHeight + 1 -
                            Blockly.BlockSvg.TAB_HEIGHT);
                    inlineSteps.push('h', input.renderWidth + 2 -
                            Blockly.BlockSvg.TAB_WIDTH);
                    inlineSteps.push('z');
                    if (this.RTL) {
                        /**
                         * @TODO
                         */

                        // Highlight right edge, around back of tab, and bottom.
                        highlightInlineSteps.push('M',
                                (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 2.5 +
                                        Blockly.BlockSvg.TAB_WIDTH - input.renderWidth) + ',' +
                                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 0.5));
                        highlightInlineSteps.push(
                                Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
                        highlightInlineSteps.push('v',
                                input.renderHeight - Blockly.BlockSvg.TAB_HEIGHT + 2.5);
                        highlightInlineSteps.push('h',
                                input.renderWidth - Blockly.BlockSvg.TAB_WIDTH + 2);
                    } else {
//          
//          }
// 
                        // Highlight right edge, bottom.
                        highlightInlineSteps.push('M',
                                (cursorX - Blockly.BlockSvg.SEP_SPACE_X + 0.5) + ',' +
                                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 0.5));
                        highlightInlineSteps.push('v', input.renderHeight + 1);
                        highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                                input.renderWidth);

                        // NEW STUFF                                            
                        switch (type) {
                            case "STRING"	:
                                break;
                            case "NUMBER"	:
                                break;
                            case "DECIMAL"	:
                                highlightInlineSteps.push('m -1,-' + (input.renderHeight - 19));
                                highlightInlineSteps.push('l -7,0');
                                break;
                            case "BOOLEAN"		:
                                // Short highlight glint at bottom of tab.
                                highlightInlineSteps.push('M',
                                        (cursorX - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
                                                1.8) + ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y +
                                        Blockly.BlockSvg.TAB_HEIGHT - 0.4));
                                highlightInlineSteps.push('l',
                                        (Blockly.BlockSvg.TAB_WIDTH * 0.38) + ',-1.8');
                                break;
                            case "ARR_DIM"	:
                                highlightInlineSteps.push('m -1,-' + (input.renderHeight - 15));
                                highlightInlineSteps.push('l -7,-3.5');
                                break;
                            default:
                        }
                        // END OF NEW STUFF

                        // OLD STUFF
                        // Short highlight glint at bottom of tab.
                        // highlightInlineSteps.push('M',
                        //    (cursorX - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
                        //     0.9) + ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y +
                        //     Blockly.BlockSvg.TAB_HEIGHT - 0.7));
                        //highlightInlineSteps.push('l',
                        //    (Blockly.BlockSvg.TAB_WIDTH * 0.46) + ',-2.1');
                        // END OF OLD STUFF                
                    }
                    // Create inline input connection.
                    if (this.RTL) {
                        connectionX = -cursorX -
                                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                                input.renderWidth + 1;
                    } else {
                        connectionX = cursorX +
                                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                                input.renderWidth - 1;
                    }
                    connectionY = cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 1;
                    input.connection.setOffsetInBlock(connectionX, connectionY);
                }
            }
            cursorX = Math.max(cursorX, inputRows.rightEdge);
            this.width = Math.max(this.width, cursorX);
            steps.push('H', cursorX);
            highlightSteps.push('H', cursorX - 0.5);
            steps.push('v', row.height);
            if (this.RTL) {
                highlightSteps.push('v', row.height - 1);
            }
        } else if (row.type == Blockly.INPUT_VALUE) {
            // External input.
            var input = row[0];
            var fieldX = cursorX;
            var fieldY = cursorY;
            if (input.align != Blockly.ALIGN_LEFT) {
                var fieldRightX = inputRows.rightEdge - input.fieldWidth -
                        Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
                if (input.align == Blockly.ALIGN_RIGHT) {
                    fieldX += fieldRightX;
                } else if (input.align == Blockly.ALIGN_CENTRE) {
                    fieldX += fieldRightX / 2;
                }
            }
            this.renderFields_(input.fieldRow, fieldX, fieldY);


            // NEW STUFF
            var type = "";
            if (input.connection && input.connection.check_)
                type = input.connection.check_[0];
            var tab;

            tab = TabMgr.getTab(type, false);

            // steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
            steps.push('v 5 ' + tab);
            // END OF NEW STUFF

            // OLD STUFF steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);

            var v = row.height - Blockly.BlockSvg.TAB_HEIGHT;
            steps.push('v', v);
            if (this.RTL) {
                /**
                 * @TODO
                 */
                // Highlight around back of tab.
                highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
                highlightSteps.push('v', v + 0.5);
            } else {
                switch (type) {
                    case "STRING"	:
                        break;
                    case "NUMBER"	:
                        break;
                    case "DECIMAL"	:
                        highlightInlineSteps.push('m -1,-' + (input.renderHeight - 19));
                        highlightInlineSteps.push('l -7,0');
                        break;
                    case "BOOLEAN"		:
                        // Short highlight glint at bottom of tab.
                        break;
                    case "ARR_DIM"	:
                        highlightSteps.push('M', (inputRows.rightEdge - 5) + ',' +
                                (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.4));
                        highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.38) +
                                ',-1.8');
                        break;
                    default:
                }

                // OLD STUFF                 
                // Short highlight glint at bottom of tab.
                // 
                // highlightSteps.push('M', (inputRows.rightEdge - 5) + ',' +
                //     (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.7));
                // highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.46) +
                //     ',-2.1');
                // END OF OLD STUFF
            }
            // Create external input connection.
            connectionX = this.RTL ? -inputRows.rightEdge - 1 :
                    inputRows.rightEdge + 1;

            if (input.connection) { 
                input.connection.setOffsetInBlock(connectionX, cursorY);
                if (input.connection.isConnected()) {
                    this.width = Math.max(this.width, inputRows.rightEdge +
                        input.connection.targetBlock().getHeightWidth().width -
                        Blockly.BlockSvg.TAB_WIDTH + 1);
                }
            }
        } else if (row.type == Blockly.DUMMY_INPUT) {
            // External naked field.
            var input = row[0];
            var fieldX = cursorX;
            var fieldY = cursorY;
            if (input.align != Blockly.ALIGN_LEFT) {
                var fieldRightX = inputRows.rightEdge - input.fieldWidth -
                        2 * Blockly.BlockSvg.SEP_SPACE_X;
                if (inputRows.hasValue) {
                    fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
                }
                if (input.align == Blockly.ALIGN_RIGHT) {
                    fieldX += fieldRightX;
                } else if (input.align == Blockly.ALIGN_CENTRE) {
                    fieldX += fieldRightX / 2;
                }
            }
            this.renderFields_(input.fieldRow, fieldX, fieldY);
            steps.push('v', row.height);
            if (this.RTL) {
                highlightSteps.push('v', row.height - 1);
            }
        } else if (row.type == Blockly.NEXT_STATEMENT) {
            // Nested statement.
            var input = row[0];
            if (y == 0) {
                // If the first input is a statement stack, add a small row on top.
                steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
                if (this.RTL) {
                    highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
                }
                cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
            }
            var fieldX = cursorX;
            var fieldY = cursorY;
            if (input.align != Blockly.ALIGN_LEFT) {
                var fieldRightX = inputRows.statementEdge - input.fieldWidth -
                        2 * Blockly.BlockSvg.SEP_SPACE_X;
                if (input.align == Blockly.ALIGN_RIGHT) {
                    fieldX += fieldRightX;
                } else if (input.align == Blockly.ALIGN_CENTRE) {
                    fieldX += fieldRightX / 2;
                }
            }
            this.renderFields_(input.fieldRow, fieldX, fieldY);
            cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
            steps.push('H', cursorX);
            // console.log(input);
            if ( input.connection && input.connection.check_ && (input.connection.check_[0] == "DEVICE")) {
              steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_DEVICE);
            } else {
              steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
          }
            steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
            steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
            steps.push('H', inputRows.rightEdge);
            if (this.RTL) {
                highlightSteps.push('M',
                        (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
                                Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
                        ',' + (cursorY + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
                highlightSteps.push(
                        Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
                highlightSteps.push('v',
                        row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
                highlightSteps.push(
                        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
                highlightSteps.push('H', inputRows.rightEdge - 0.5);
            } else {
                highlightSteps.push('M',
                        (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
                                Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
                        (cursorY + row.height - Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
                highlightSteps.push(
                        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
                highlightSteps.push('H', inputRows.rightEdge - 0.5);
            }
            // Create statement connection.
            connectionX = this.RTL ? -cursorX : cursorX + 1;
            input.connection.setOffsetInBlock(connectionX, cursorY + 1);

            if (input.connection.isConnected()) {
                this.width = Math.max(this.width, inputRows.statementEdge +
                        input.connection.targetBlock().getHeightWidth().width);
            }
            if (y == inputRows.length - 1 ||
                    inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
                // If the final input is a statement stack, add a small row underneath.
                // Consecutive statement stacks are also separated by a small divider.
                steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
                if (this.RTL) {
                    highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
                }
                cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
            }
        }
        cursorY += row.height;
    }
    if (!inputRows.length) {
        cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
        steps.push('V', cursorY);
        if (this.RTL) {
            highlightSteps.push('V', cursorY - 1);
        }
    }
    return cursorY;
};


/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_DEVICE = 'l 0,4 15,0 0,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_DEVICE_HIGHLIGHT = 'l 0,4 15,0 0,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT_DEVICE = 'l -0,4 -15,0 -0,-4';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_DEVICE =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT_DEVICE + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 15 - Blockly.BlockSvg.CORNER_RADIUS) +
    ' a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_DEVICE =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT_DEVICE =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0.5';



/**
 * A modified version of renderDrawBottom_ toi include devices
 * 
 * Render the bottom edge of the block.
 * @param {!Array.<string|number>} steps Path of block outline.
 * @param {!Array.<string|number>} highlightSteps Path of block highlights.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(steps, highlightSteps, cursorY) {
  this.height += cursorY + 1;  // Add one for the shadow.
  if (this.nextConnection) {
    if ( this.nextConnection.check_ && (this.nextConnection.check_[0] == "DEVICE") ) {
      steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (this.RTL ? 0.5 : - 0.5)) +
          ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT_DEVICE);
    } else {
      steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (this.RTL ? 0.5 : - 0.5)) +
          ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT);        
    }
    // Create next block connection.
    var connectionX;
    if (this.RTL) {
      connectionX = -Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = Blockly.BlockSvg.NOTCH_WIDTH;
    }
    this.nextConnection.setOffsetInBlock(connectionX, cursorY + 1);
    this.height += 4;  // Height of tab.
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.push('H 0');
    if (!this.RTL) {
      highlightSteps.push('M', '0.5,' + (cursorY - 0.5));
    }
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
               Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.BlockSvg.CORNER_RADIUS + ',-' +
               Blockly.BlockSvg.CORNER_RADIUS);
    if (!this.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
          '0.5,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};


/**
 * A modified version of renderDrawBottom_ toi include devices
 * 
 * Render the top edge of the block.
 * @param {!Array.<string|number>} steps Path of block outline.
 * @param {!Array.<string|number>} highlightSteps Path of block highlights.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ = function(steps,
    highlightSteps, rightEdge) {
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    highlightSteps.push('m 0.5,0.5');
    if (this.startHat_) {
      steps.push(Blockly.BlockSvg.START_HAT_PATH);
      highlightSteps.push(this.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    }
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    highlightSteps.push(this.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);   
  }

  // Top edge.
  if (this.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    if ( this.previousConnection.check_ && (this.previousConnection.check_[0] == "DEVICE") ) {
      steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_DEVICE);
      highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT_DEVICE);
    } else {
      steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
      highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);
    }

    var connectionX = (this.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    this.previousConnection.setOffsetInBlock(connectionX, 0);
  }
  steps.push('H', rightEdge);
  if ( this.previousConnection && this.previousConnection.check_ && (this.previousConnection.check_[0] == "DEVICE") ) {
    highlightSteps.push('m 0,4 l 15,0 0,-4');
    highlightSteps.push('H', rightEdge - 0.5);
  } else {
    highlightSteps.push('H', rightEdge - 0.5);
  }
  this.width = rightEdge;
};