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
package de.uos.inf.did.abbozza.monitor.clacks;

import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;

/**
 * This class just wraps a PipedInputStream
 * 
 * @author mbrinkmeier
 */
public class ClacksInputStream extends InputStream {

    
    private PipedInputStream pipe;
    
    public ClacksInputStream(PipedInputStream pip) {
        pipe = pip;
    }

    @Override
    public int read() throws IOException {
        return pipe.read();
    }
    
}
