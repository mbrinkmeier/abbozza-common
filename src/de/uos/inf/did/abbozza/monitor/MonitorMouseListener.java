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
 * @fileoverview This mouse listener opens a popup for a monitor.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

package de.uos.inf.did.abbozza.monitor;

import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import javax.swing.JPopupMenu;

/**
 *
 * @author mbrinkmeier
 */
public class MonitorMouseListener extends MouseAdapter {
    
    private MonitorPanel monitor;
    
    public MonitorMouseListener(MonitorPanel monitor) {
        this.monitor = monitor;
    }
                public void mousePressed(MouseEvent e) {
                  maybeShowPopup(e);
            }

            public void mouseReleased(MouseEvent e) {
                maybeShowPopup(e);
            }

            private void maybeShowPopup(MouseEvent e) {
                if (e.isPopupTrigger() && (monitor != null) && (monitor.getPopUp()!= null) ) {
                     JPopupMenu popup = monitor.getPopUp();
                     if ( popup != null ) {
                        popup.show(e.getComponent(),e.getX(), e.getY());
                     }
               }
            }

}
