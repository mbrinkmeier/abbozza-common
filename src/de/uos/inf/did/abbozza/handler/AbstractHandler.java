/**
 * @license
 * abbozza!
 *
 * Copyright 2015-2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview This is an abstract superclass for all abbozza! handlers.
 * It enforces to check, wether remote access is allowed.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.LinkedList;
import javax.swing.JOptionPane;


public abstract class AbstractHandler implements HttpHandler {

    protected AbbozzaServer _abbozzaServer;
    protected boolean _allowRemote;
    private final LinkedList<InetAddress> _allowedInetAddresses;

    
    /**
     * The standard constructor.
     * 
     */
    public AbstractHandler() {
        this._abbozzaServer = AbbozzaServer.getInstance();
        this._allowRemote = false;
        this._allowedInetAddresses = new LinkedList<InetAddress>();        
    }
    
    
    public AbstractHandler(AbbozzaServer abbozza) {
        this._abbozzaServer = abbozza;
        this._allowRemote = false;
        this._allowedInetAddresses = new LinkedList<InetAddress>();
    }
    
    public AbstractHandler(AbbozzaServer abbozza, boolean allowRemote) {
        this._abbozzaServer = abbozza;
        this._allowRemote = allowRemote;
        this._allowedInetAddresses = new LinkedList<InetAddress>();
    }

    public void sendResponse(HttpExchange exchg, int code, String type, String response) throws IOException {
        byte[] buf = response.getBytes("UTF-8");
        try (OutputStream out = exchg.getResponseBody()) {
            Headers responseHeaders = exchg.getResponseHeaders();
            responseHeaders.set("Content-Type", type);
            responseHeaders.set("Cache-Control","no-cache, no-store, must-revalidate, max-age=0");
            exchg.sendResponseHeaders(code, buf.length);
            out.write(buf);
        }
    }    
    
    public boolean remoteAllowed() {
        return this._allowRemote;
    }
    
    protected final boolean allowRequest(HttpExchange http) {
      InetSocketAddress remote = http.getRemoteAddress();
      InetSocketAddress local = http.getLocalAddress();
      
      // Allow all local requests
      if ( remote.getAddress().equals(local.getAddress()) ) {
        return true;
      }
      
      if ( !this._allowRemote ) {
        // If remote access is forbidden, deny it.
        return false;
      } else {
        // If remote access is allowed, ask and store the result
        return addInetAddress(http.getRemoteAddress().getAddress());
      }
    }
    
    
    protected boolean isActive() {
        return true;
    }
            
            
    private boolean addInetAddress(InetAddress addr) {
        if ( this._abbozzaServer.isRemoteAccessDenied() ) {
            return this._abbozzaServer.isHostAllowed(addr.getHostName()) || this._abbozzaServer.isHostAllowed(addr.getHostAddress());
        }
       // Check if already listed
       if ( !this._allowedInetAddresses.contains(addr) ) {
         // If not, ask wether it should be allowed
         int result = JOptionPane.showConfirmDialog(null, AbbozzaLocale.entry("gui.remote_access", "\n" + addr.getHostName() + " (" + addr.getHostAddress() + ")"), AbbozzaLocale.entry("gui.remote_Access_title"), JOptionPane.YES_NO_OPTION);         if ( result == JOptionPane.YES_OPTION ) {
           this._allowedInetAddresses.add(addr);           
           return true;
         }
       } else {
           return true;
       }
       return false;
    }
    
    
    @Override
    public final void handle(HttpExchange exchg) throws IOException {
      // First check if handler is active  
      if ( !isActive() ) {
          // Send "Service not available"
          sendResponse(exchg,503,"text/plain","");
          return;
      }      
      
      if ( allowRequest(exchg) ) {
          handleRequest(exchg);
      } else {
          // Client is not allowed to issue this request
          sendResponse(exchg,403,"text/plain","");
      }
    }

    protected abstract void handleRequest(HttpExchange exchg) throws IOException;    
    
}