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
package de.uos.inf.did.abbozza.monitor;

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;

/**
 *
 * @author michael
 */


public class Oscillograph extends javax.swing.JPanel {

    private OscillographMonitor _monitor;
    
    /**
     * Creates new form Oszillosgraph
     */
    public Oscillograph(OscillographMonitor monitor) {
        _monitor = monitor;
        
        initComponents();
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 400, Short.MAX_VALUE)
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 300, Short.MAX_VALUE)
        );
    }// </editor-fold>//GEN-END:initComponents


    // Variables declaration - do not modify//GEN-BEGIN:variables
    // End of variables declaration//GEN-END:variables

    int factors[] = {
      2,5,10,20,50  
    };
    
    public void paint(Graphics graphics) {
        try { 
       Graphics2D gr = (Graphics2D) graphics;
       
       int width = this.getWidth();
       int height = this.getHeight();
       int min = _monitor.getMin();
       int max = _monitor.getMax();
       int scale = _monitor.getScale();
       int span = max - min;
       if ( span == 0 ) span = 10;
               
       // clear background
       gr.setColor(Color.WHITE);
       gr.fillRect(0,0,width,height);
        
       // draw marks
       int y;
       gr.setColor(Color.LIGHT_GRAY);
       double tick = 0;
       while ( tick > min ) {
           tick -= scale;
       }
       while ( tick < min ) {
           tick += scale;
       }
       while ( tick <= max ) {
           y = height - ((int) (height * (tick-min)/span));
           gr.drawLine(0,y,width,y);
           gr.drawString(Integer.toString((int) Math.round(tick)) ,0,y);
           tick += scale;
       }
       
       // draw points
       gr.setColor(Color.BLACK);
       int size = _monitor.getBufSize();
       int sidx;
       int eidx;
       int off;
       if ( size < width ) {
           sidx = 0;
           eidx = size;
           off = 0;
       } else {
           eidx = size;
           sidx = size-width;
           off = -sidx;
       }
       int val = _monitor.getInt(sidx);
       int oy = height - ((int) (height * (val-min)/span));
       for (int idx = sidx+1; idx < eidx; idx++) {
           val = _monitor.getInt(idx);
           int yc = height - ((int) (height * (val-min)/span));
           gr.drawLine(idx+off-1,oy,idx+off,yc);
           oy = yc;
           // gr.fillRect(idx+off,yc,1,1);
       }
       } catch (Exception ex) {
            AbbozzaLogger.err("OscillographMonitor: Exception");
            ex.printStackTrace(System.out);
        }
        
    }
    
}
