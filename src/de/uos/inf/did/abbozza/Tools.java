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
package de.uos.inf.did.abbozza;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

/**
 *
 * @author michael
 */
public class Tools {
    
    public static byte[] readBytes(URL url) throws IOException {
        URLConnection conn = url.openConnection();
        InputStream stream = conn.getInputStream();
        return Tools.readBytes(stream);
    }

    public static byte[] readBytes(File file) throws IOException {
        return Tools.readBytes(new FileInputStream(file));
    }
   
    public static byte[] readBytes(InputStream stream) throws IOException {
        byte[] buffer;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        int value = stream.read(); 
        while(value != -1){ 
            baos.write(value); 
            value = stream.read(); 
        } 
        buffer = baos.toByteArray();
        return buffer;
    }
    
}
