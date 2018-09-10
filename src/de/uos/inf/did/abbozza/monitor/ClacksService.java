/*
 * Copyright 2018 mbrinkmeier.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.uos.inf.did.abbozza.monitor;

/**
 * A singleton class providing ClacksSubscribers the possibility to subscribe 
 * to the byte stream.
 * 
 * @author mbrinkmeier
 */
public class ClacksService implements Runnable {

    
    private static ClacksService _instance = null;
    private static Thread _thread;
    
    private ClacksPortHandler _portHandler = null;
    private boolean _stopped = false;
   
    /**
     * Initialize the ClacksService and start the thread
     * 
     * @param monitor The AbbozzaMonitor to which this service is tied
     * 
     * @return The initialized instance of the service.
     */
    public static ClacksService init(AbbozzaMonitor monitor) {
        if ( _instance == null ) {
            // Start the new thread
            _instance = new ClacksService(monitor);
            _thread = new Thread(_instance);
            _thread.start();
        }
        return _instance;
    }
    
    /**
     * Get the current instance of the service.
     * 
     * @return The instance of the service
     */
    public static ClacksService getInstance() {
        return _instance;
    }
    
    
    /**
     * Construct the instance of the service.
     * 
     * @param monitor The AbbozzaMonitor to which the service is tied.
     */
    private ClacksService(AbbozzaMonitor monitor) {
        // Intitialize the port handler and start the thread
        _portHandler = new ClacksPortHandler(monitor);        
        _portHandler.openPort(true);
        _stopped = false;
    }
        
    
    public void stopIt() {
        _stopped = true;
        _stopped = false;
    }
    
    @Override
    public void run() {
        // Listen to the _portHandler
    }
    
}
