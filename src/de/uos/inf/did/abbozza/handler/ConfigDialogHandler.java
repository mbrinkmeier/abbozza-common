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
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.io.IOException;

/**
 *
 * @author michael
 */
public class ConfigDialogHandler extends AbstractHandler {

    public ConfigDialogHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    @Override
    protected void myHandle(HttpExchange exchg) throws IOException {
        if ( this._abbozzaServer.openConfigDialog() == 0 ) {
            sendResponse(exchg, 200, "text/plain", this._abbozzaServer.getConfiguration().get().toString());
        } else {
           sendResponse(exchg, 440, "text/plain", ""); 
        }
    }

}
