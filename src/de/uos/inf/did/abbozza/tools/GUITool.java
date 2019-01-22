/**
 * @license abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package de.uos.inf.did.abbozza.tools;

import java.awt.Rectangle;
import java.awt.Window;
import javax.swing.JDialog;
import javax.swing.JFrame;

/**
 *
 * @author mbrinkmeier
 */
public class GUITool {

    /**
     * This operation centers the window on the current screen.
     * 
     * @param window The window to be centered.
     */
    public static void centerWindow(Window window) {
        Rectangle screen = window.getGraphicsConfiguration().getBounds();
        window.setLocation(screen.x + (screen.width - window.getWidth()) / 2, screen.y + (screen.height - window.getHeight()) / 2);
    }

    /**
     * This operation brings a frame to the front.
     * 
     * @param frame The frame that should be brought to the front.
     */
    public static void bringToFront(JFrame frame) {
        if ( frame == null ) return;
        
        /*
        java.awt.EventQueue.invokeLater(new Runnable() {
            @Override
            public void run() {
                frame.toFront();
                frame.repaint();
            }
        });
        */
        
        // First iconify
        int state = frame.getExtendedState() | JFrame.ICONIFIED;
        frame.setExtendedState(state);
        frame.setVisible(false);
        
        // Then maximize
        state = frame.getExtendedState() & ~JFrame.ICONIFIED;
        frame.setExtendedState(JFrame.NORMAL);
        frame.setAlwaysOnTop(true);
        frame.setVisible(true);
        frame.toFront();
        frame.requestFocus();
        frame.setAlwaysOnTop(false);
    }
    
}