/*
 * Copyright 2019 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
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

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksBytes;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksService;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksSubscriber;
import java.net.InetSocketAddress;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

/**
 *
 * @author Michael Brinkmeier (michael.brinkmeier@uni-osnabrueck.de)
 */
public class AbbozzaWebSocketServer extends WebSocketServer implements ClacksSubscriber {

    private AbbozzaMonitor monitor;
    private ClacksService clacksService;
    private WebSocket lastWebSocket = null;
    
    public AbbozzaWebSocketServer(AbbozzaMonitor monitor) {
        this.monitor = monitor;
        clacksService = this.monitor.getClacksService();
        AbbozzaLogger.info("Starting");     
    }
    
    public AbbozzaWebSocketServer(AbbozzaMonitor monitor, int port) throws Exception {
        super(new InetSocketAddress("localhost",port));
        this.monitor = monitor;
        clacksService = this.monitor.getClacksService();
        AbbozzaLogger.info("AbbozzaWebSocketServer: Starting at address " + this.getAddress().toString() );
    }
    
    public AbbozzaWebSocketServer(AbbozzaMonitor monitor,  InetSocketAddress socket) throws Exception {
        super(socket);
        AbbozzaLogger.info("B");
        this.monitor = monitor;
        AbbozzaLogger.info("C");
        clacksService = this.monitor.getClacksService();
        AbbozzaLogger.info("D");
        AbbozzaLogger.info("AbbozzaWebSocketServer: Starting at address " + this.getAddress().toString() );
        AbbozzaLogger.info("E");        
    }
    
    
    @Override
    public void onOpen(WebSocket ws, ClientHandshake ch) {
        ws.send("[[ Connected to abbozza! serial stream at " + ws.getLocalSocketAddress().toString() + "]]");
        AbbozzaLogger.info("AbbozzaWebSocketServer: Client connected from " + ws.getRemoteSocketAddress().toString() );
        lastWebSocket = ws;
    }

    @Override
    public void onClose(WebSocket ws, int i, String string, boolean bln) {
        AbbozzaLogger.info("AbbozzaWebSocketServer: Connection to client " + ws.getRemoteSocketAddress().toString() + " closed");
    }

    @Override
    public void onMessage(WebSocket ws, String string) {
        clacksService.sendBytes(string.getBytes());
    }

    @Override
    public void onError(WebSocket ws, Exception excptn) {
        AbbozzaLogger.err("AbbozzaWebSocketServer: Error " + excptn.getLocalizedMessage() );
    }

    @Override
    public void onStart() {
        clacksService.subscribe(this);
        AbbozzaLogger.info("AbbozzaWebSocketServer: Listening on " + this.getAddress().toString() );
    }

    @Override
    public void process(ClacksBytes bytes) {
        broadcast(new String(bytes.getBytes()));
    }
}
