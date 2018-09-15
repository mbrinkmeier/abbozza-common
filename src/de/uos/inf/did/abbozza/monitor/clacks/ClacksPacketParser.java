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
package de.uos.inf.did.abbozza.monitor.clacks;

/**
 *
 * @author michael
 */
public class ClacksPacketParser {

    private StringBuffer unprocessed;

    public ClacksPacketParser() {
        unprocessed = new StringBuffer();
    }

    public void addBytes(byte[] bytes) {
        unprocessed.append(new String(bytes));
    }
    

    public ClacksPacket parse() {
        String cmd;
        String prefix;
        ClacksPacket packet = null;

        int end = -1;
        int start = -1;

        start = unprocessed.indexOf("[[");
        if (start >= 0) {
            end = unprocessed.indexOf("]]", start + 2);
            if (end >= 0) {
                cmd = unprocessed.substring(start + 2, end);
                unprocessed.delete(0, end + 2);
                int space = cmd.indexOf(' ');
                if (space >= 0) {
                    prefix = cmd.substring(0, space);
                    
                    cmd = cmd.substring(space + 1, cmd.length());
                    packet = new ClacksMessage(prefix, cmd);
                }
            }
        } else {
            // Remove everything
            unprocessed.setLength(0);
        }       
        return packet;
    }

}
