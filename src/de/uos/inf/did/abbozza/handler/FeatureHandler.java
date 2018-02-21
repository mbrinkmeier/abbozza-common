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
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.Tools;
import de.uos.inf.did.abbozza.tools.XMLTool;
import java.io.IOException;
import java.io.InputStream;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;

/**
 *
 * @author michael
 */
public class FeatureHandler extends AbstractHandler {

    public FeatureHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        sendResponse(exchg, 200, "text/xml", XMLTool.documentToString(getFeatures()));
    }

    private Document getFeatures() {
        // Read the xml file for the global feature
        Document featureXml = null;

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        String path = "/js/abbozza/" + this._abbozzaServer.getSystem() + "/features.xml";
                
        try {
            AbbozzaLogger.out("FeatureHandler: Loading features from " + path,AbbozzaLogger.INFO);
            InputStream stream = this._abbozzaServer.getJarHandler().getInputStream(path);
            builder = factory.newDocumentBuilder();
            StringBuilder xmlStringBuilder = new StringBuilder();
            featureXml = builder.parse(stream);
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
        }
        
        AbbozzaServer.getPluginManager().mergeFeatures(featureXml);

        return featureXml;
    }
}
