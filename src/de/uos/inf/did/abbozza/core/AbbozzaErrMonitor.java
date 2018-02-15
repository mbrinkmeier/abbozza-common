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
 * @fileoverview A thread for the monitoring of stderr  
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

package de.uos.inf.did.abbozza.core;

import java.io.ByteArrayOutputStream;

public class AbbozzaErrMonitor extends Thread {

	private ByteArrayOutputStream logger;
	private String message;
	
	public AbbozzaErrMonitor(ByteArrayOutputStream logger) {
	     this.logger = logger;
	}
	
	public void run() {
            // System.out.println("abbozza! logger : started!");
            int oldSize = -1;
		message = "";
		while ((!this.isInterrupted())) { //  && (connection.isOpen())) {
                   // If there are valid bytes in the buffer
		   if (logger.size()>0) {
                      do {
			 oldSize = logger.size();
			 try {
                            Thread.sleep(100);
                         } catch (InterruptedException e) {
			    e.printStackTrace();
			 }
		      } while ( oldSize != logger.size());
				
		      String msg = logger.toString();
		      logger.reset();
		      message = message + msg;
		   }
		}
    }
	
	
	public String getContent() {
			String result = message;
			message = "";
			return result;
	}

}
