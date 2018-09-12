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
 * @fileoverview This abstract class defines a abbozza! monitor panel.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

package de.uos.inf.did.abbozza.monitor;

import de.uos.inf.did.abbozza.monitor.clacks.ClacksBytes;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksSubscriber;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;

/**
 *
 * @author michael
 */
public abstract class MonitorPanel extends JPanel implements ClacksSubscriber {
     
    /**
     * Return a popup menu.
     * 
     * @return The popup menu
     */
    public abstract JPopupMenu getPopUp();   

    /**
     * Process a message received by the monitor
     * 
     * @param msg The received message
     */
    public abstract void processMessage(String msg);
    
    /**
     * Process bytes in the byte stream buffer.
     */
    public abstract void process(ClacksBytes bytes);
    
    /**
     * Called if the panel is added to the monitor
     * @param monitor 
     */
    public abstract void connect(AbbozzaMonitor monitor);
    
    /**
     * Called if the panel is removed from the monitor
     * @param monitor 
     */
    public abstract void disconnect(AbbozzaMonitor monitor);

}
