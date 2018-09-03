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

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.io.IOException;
import java.io.PipedInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;

/**
 *
 * @author michael
 */
public abstract class MonitorPanel extends JPanel implements Runnable {
     
    protected PipedInputStream _byteStream; // The byte stream 
    protected Thread _thread;               // The thread started for monitoring the byte stream
    protected boolean _fetchBytes = false;  // An internal flag, indicating if the byte stream should be fetched
    private boolean _stopped = false;       // A flag to stop the thread

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
    public void processMessage(String msg) {}
    
    /**
     * Process bytes in the byte stream buffer.
     */
    public void processBytes() {}
    
    /**
     * The return value of this operation inidcates if the byte stream should
     * be fetched.
     * 
     * @return 
     */
    public boolean fetchBytes() {
        return _fetchBytes;
    }
    
    /**
     * Connect to the byte stream of the given monitor
     * 
     * @param monitor The monitor whose byte stream should be fetched
     */
    public void connect(AbbozzaMonitor monitor) {
        // If the panel does not fetch the bytes, close the byte stream
        if ( !fetchBytes() ) {
            closeByteStream();
            stopThread();
            return;
        }
        
        try {
            // Create a new byte stream        
            _byteStream = new PipedInputStream();
            _byteStream.connect( monitor.openByteStream() );
            startThread();
        } catch (IOException ex) {
            closeByteStream();
            stopThread();
        }
        
        AbbozzaLogger.debug("MonitorPanel " + getName() + ": activated");
    };

    
    /**
     * Disconnect frrom the byte stream.
     */
    public void disconnect() {
        // If the panel does not fetch the bytes, do nothing
        closeByteStream();
        stopThread();

        AbbozzaLogger.debug("MonitorPanel " + getName() + ": deactivated");
    };
    
    
    /**
     * If the bytes are fetched, this operation calls proccessBytes()
     */
    public void run() {
        while (!_stopped) {
            try {
                if ( _byteStream.available() > 0 ) {
                    processBytes();
                }
            } catch (IOException ex) {
                AbbozzaLogger.err("MonitorPanel " + getName() + ": Could not read from byte strem");
            }
            try {
                _thread.sleep(10);
            } catch (InterruptedException ex) {
            }
        }
    }
    
    /**
     * Close byte stream
     */
    private void closeByteStream() {
        if (_byteStream != null ) {
            try {
                _byteStream.close();
            } catch (IOException ex) {
                AbbozzaLogger.err("MonitorPanel " + getName() + ": Cannot close byte stream");
            }
            _byteStream = null;    
        }
    }
    
    
    private void startThread() {
        _thread = new Thread(this);
        _stopped = false;
        _thread.start();        
    }


    private void stopThread() {
        _stopped = true;
        _thread = null;
    }
    
}
