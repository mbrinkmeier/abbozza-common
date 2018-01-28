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
import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaServer;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 *
 * @author michael
 */
public class CheckHandler extends AbstractHandler {

    public CheckHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    @Override
    protected void myHandle(HttpExchange exchg) throws IOException {
        try {            
            InputStreamReader isr =  new InputStreamReader(exchg.getRequestBody());
            BufferedReader br = new BufferedReader(isr);

            int b;
            StringBuilder buf = new StringBuilder(512);
            while ((b = br.read()) != -1) {
                buf.append((char) b);
            }

            br.close();
            isr.close();
            String code = buf.toString();
            
            int response = setCode(code.toString());
            if ( response == 0 ) {
                this.sendResponse(exchg, 200, "text/plain", AbbozzaLocale.entry("msg.done-compiling"));
            } else {
                this.sendResponse(exchg, 400, "text/plain", _abbozzaServer.getCompileErrorMsg() );
            }
        } catch (IOException ioe) {
            this.sendResponse(exchg, 404, "", "");
        }
    }
    
    
    public int setCode(String code) { 
        int response = _abbozzaServer.compileCode(code);
        return response;
    }

}
