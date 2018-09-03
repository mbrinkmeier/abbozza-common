package de.uos.inf.did.abbozza.monitor;

import jssc.SerialPortEventListener;
import jssc.SerialPortEvent;

/**
 *
 * @author michael
 */


public class SerialReader implements Runnable, SerialPortEventListener {

    private boolean _stopped;
    
    @Override
    public void run() {
        _stopped = false;
        while ( !_stopped ) {
            // Nix
        }
    }

    @Override
    public void serialEvent(SerialPortEvent spe) {
    }
    
    public void stopIt() {
        _stopped = true;
    }
    
}
