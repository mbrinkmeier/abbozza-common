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

import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;

/**
 *
 * @author michael
 */


public class ClacksStatus implements ClacksPacket {

    private String msg;
    private String type;
    
    public ClacksStatus(String m, String t) {
        msg = m;
        type = t;
    }
    
    public String getMessage() {
        return msg;
    }
            
    
    public String getType() {
        return type;
    }
    
            
    @Override
    public void process(AbbozzaMonitor monitor) {
        // The status packet is displayed inside the protocol
        monitor.appendText(msg + "\n",type);
    }

    @Override
    public void process(ClacksSerialPort serialPort) {
        // Do nothing
    }

    @Override
    public void process(ClacksSubscriber subscriber) {
        // Do nothing
    }

    @Override
    public void processFromPort(ClacksService service) {
        // relay it to the monitor
        service.publishPacket(this);
    }

    @Override
    public void processToPort(ClacksService service) {
        // Do nothing
    }
    
}
