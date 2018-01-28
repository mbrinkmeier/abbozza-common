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
 * @fileoverview ...
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.arduino.handler;

import cc.arduino.packages.BoardPort;
import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.arduino.Abbozza;
import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.handler.AbstractHandler;
import java.io.IOException;
import java.util.List;
import java.util.Vector;
import javax.swing.JOptionPane;
import processing.app.Base;
import processing.app.BaseNoGui;
import processing.app.debug.TargetBoard;
import processing.app.debug.TargetPackage;
import processing.app.debug.TargetPlatform;

/**
 *
 * @author michael
 */
public class BoardHandler extends AbstractHandler {

    private boolean _query;

    public BoardHandler(Abbozza abbozza, boolean query) {
        super(abbozza);
        this._query = query;
    }

    @Override
    protected void myHandle(HttpExchange exchg) throws IOException {
        connectToBoard(exchg, this._query);
    }
    
    

    public boolean connectToBoard(HttpExchange exchg, boolean query) {
        String port = null;
        String board = null;
        List<BoardPort> ports = Base.getDiscoveryManager().discovery();
        for (int i = 0; i < ports.size(); i++) {
            AbbozzaLogger.out("port " + ports.get(i).getAddress() + " " + ports.get(i).getLabel() + " " + ports.get(i).getBoardName(), AbbozzaLogger.INFO);
            if (ports.get(i).getBoardName() != null) {
                port = ports.get(i).getAddress();
                board = ports.get(i).getBoardName();
                AbbozzaLogger.out("Found '" + board + "' on " + port);

                BaseNoGui.selectSerialPort(port);

                TargetPlatform platform = BaseNoGui.getTargetPlatform();
                for (TargetBoard targetBoard : platform.getBoards().values()) {
                    AbbozzaLogger.out(">> " + targetBoard.getName() + " == " + board);
                    if (targetBoard.getName().equals(board)) {
                        BaseNoGui.selectBoard(targetBoard);
                    }
                }
                
                // Now check all additionally installed packages
                for (TargetPackage targetPackage : BaseNoGui.packages.values()) {
                    for (TargetPlatform targetPlatform : targetPackage.platforms()) {
                        for (TargetBoard targetBoard : targetPlatform.getBoards().values()) {
                            AbbozzaLogger.out(">> " + targetBoard.getName() + " == " + board);
                            if (targetBoard.getName().equals(board)) {
                                BaseNoGui.selectBoard(targetBoard);
                            }
                        }                        
                    }
                }

                Base.INSTANCE.onBoardOrPortChange();
            }
        }

        TargetBoard targetBoard = BaseNoGui.getTargetBoard();
        TargetPlatform platform = BaseNoGui.getTargetPlatform();
        AbbozzaLogger.out("targetBoard: " + targetBoard.getId(), AbbozzaLogger.INFO);

        try {
            if (board != null) {
                AbbozzaLogger.out("board found " + targetBoard.getId() + " " + targetBoard.getName() + " " + port, AbbozzaLogger.INFO);
                sendResponse(exchg, 200, "text/plain", targetBoard.getId() + "|" + targetBoard.getName() + "|" + port);
                return true;
            } else {
                AbbozzaLogger.out("no board found", AbbozzaLogger.INFO);

                if (query == false) {
                    AbbozzaLogger.out("IDE set to : " + targetBoard.getId() + " " + targetBoard.getName() + " " + port, AbbozzaLogger.INFO);
                    sendResponse(exchg, 201, "text/plain", targetBoard.getId() + "|" + targetBoard.getName() + "|" + port);
                    return false;
                } else {
                    // Cycle through all packages
                    Vector<BoardListEntry> boards = new Vector<BoardListEntry>();

                    for (TargetPackage targetPackage : BaseNoGui.packages.values()) {
                        // For every package cycle through all platforms
                        for (TargetPlatform targetPlatform : targetPackage.platforms()) {

                            // Add a title for each platform
                            String platformLabel = targetPlatform.getPreferences().get("name");
                            if (platformLabel != null && !targetPlatform.getBoards().isEmpty()) {

                                for (TargetBoard tboard : targetPlatform.getBoards().values()) {
                                    boards.add(new BoardListEntry(tboard));
                                }
                            }
                        }
                    }
                    BoardListEntry result = (BoardListEntry) JOptionPane.showInputDialog(null, AbbozzaLocale.entry("msg.select_board"), AbbozzaLocale.entry("msg.no_board"), JOptionPane.PLAIN_MESSAGE, null, boards.toArray(), BaseNoGui.getTargetBoard());
                    if (result != null) {
                        AbbozzaLogger.out("selected : " + result.getId(), AbbozzaLogger.INFO);
                        sendResponse(exchg, 201, "text/plain", result.getId() + "|" + result.getName() + "|???");
                        BaseNoGui.selectBoard(result.getBoard());
                        Base.INSTANCE.onBoardOrPortChange();
                    } else {
                        AbbozzaLogger.out("IDE set to : " + targetBoard.getId() + " " + targetBoard.getName() + " " + port, AbbozzaLogger.INFO);
                        sendResponse(exchg, 201, "text/plain", targetBoard.getId() + "|" + targetBoard.getName() + "|" + port);
                        return false;
                    }
                    return false;
                }
            }
        } catch (IOException ex) {
            return false;
        }
    }

}
