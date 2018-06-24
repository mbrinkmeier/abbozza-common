/*
 * Copyright 2018 michael.
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
package de.uos.inf.did.abbozza.core;

/**
 *
 * @author michael
 */
public class AbbozzaServerException extends Exception {
    
    private int type;
    
    public static final int SERVER_PORT_DENIED = 1;
    public static final int SERVER_RUNNING = 2;
   
    public AbbozzaServerException(int type, String msg) {
        super(msg);
        this.type = type;
    }
    
    public int getType() {
        return type;
    }
}
