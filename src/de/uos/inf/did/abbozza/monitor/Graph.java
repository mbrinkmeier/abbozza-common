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
 * @fileoverview This panel plots the channel data send to the abbozza!-monitor.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.monitor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.util.Enumeration;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;

/**
 *
 * @author mbrinkmeier
 */
public class Graph extends javax.swing.JPanel implements TableModelListener {

    public final int TIMESTAMP = 0;
    public final int ROWCOUNT = 1;
    
    private TableMonitorModel tableModel;
    private int xType = ROWCOUNT;
    private int xInterval;
    
    private int xZoom = 1;
    private int yZoom = 1;
    
    private Color colors[] = {
        Color.RED,
        new Color(0,200,0),
        new Color(0,0,255),
        Color.ORANGE,
        Color.MAGENTA
    };
    private Color background = Color.WHITE;
    private Color marks = Color.BLACK;
    
  
    private TableMonitorModel myTable;
    
    public Graph() {
        myTable = null;
        initComponents();
        /*
        colors = new Color[5];
        colors[0] = Color.RED;
        colors[1] = Color.GREEN;
        colors[2] = Color.CYAN;
        colors[3] = Color.ORANGE;
        colors[4] = Color.MAGENTA;
        */
        this.setPreferredSize(new Dimension(512,getHeight()));
    }
    
    /**
     * Creates new form Graph
     * 
     * @param table The table model to be used
     */
    public Graph(TableMonitorModel table) {
        myTable = table;
        myTable.addTableModelListener(this);
        initComponents();
        /*
        colors = new Color[5];
        colors[0] = Color.RED;
        colors[1] = Color.GREEN;
        colors[2] = Color.CYAN;
        colors[3] = Color.ORANGE;
        colors[4] = Color.BLACK;
        */
        // at most a tenth of a second
        this.setPreferredSize(new Dimension(512,getHeight()));
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


    public void setTableModel(TableMonitorModel model) {
        myTable = model;
            int width = 0;
            if ( xType == TIMESTAMP ) {
                width = (int) ((myTable.getMaxTimestamp()-myTable.getMinTimestamp())/100);
            } else {
                width = myTable.getRowCount();
            }
        myTable.addTableModelListener(this);
        this.setPreferredSize(new Dimension(width,getHeight()));
        this.scrollRectToVisible(new Rectangle(width-1,0,width,0));
        this.revalidate();
    }
    
    public void paint(Graphics gr) {
        
        // Fill background
        Graphics2D gr2d = (Graphics2D) gr;
        gr.setColor(background);
        gr.fillRect(0,0,getWidth(), getHeight());

        Rectangle rect = this.getVisibleRect();
        
        // Draw marks
        // Digital marks
        gr.setColor(marks);
        gr.drawLine(rect.x, (getHeight()-1)*6/7, rect.x+rect.width, (getHeight()-1)*6/7);
        gr.drawLine(rect.x, (getHeight()-1)*1/7, rect.x+rect.width, (getHeight()-1)*1/7);
        gr.drawString("low", rect.x + rect.width - 30, (getHeight()-1)*6/7 - 2);
        gr.drawString("high", rect.x + rect.width - 30, (getHeight()-1)*1/7 + 13);
        
        // 10 and 16 Bit marks
        int y1 = (getHeight()-1)*(1023-256)/1023;
        int y2 = (getHeight()-1)*(1023-512)/1023;
        int y3 = (getHeight()-1)*(1023-768)/1023;
        for (int i=0; i < rect.width; i=i+20) {
            gr.drawLine(rect.x+i,y1,rect.x+i+10,y1);
            gr.drawLine(rect.x+i,y2,rect.x+i+10,y2);
            gr.drawLine(rect.x+i,y3,rect.x+i+10,y3);
        }
        
        gr.drawString("512",rect.x+5,y2-2);
        gr.drawString("768",rect.x+5,y3-2);
        gr.drawString("256",rect.x+5,y1-2);
        gr.drawString("32768",rect.x+rect.width/2-15,y2-2);
        gr.drawString("49152",rect.x+rect.width/2-15,y3-2);
        gr.drawString("16348",rect.x+rect.width/2-15,y1-2);
        
        int row = 0;
        Enumeration<TableMonitorModel.Entry> en = myTable.getEntries();
        while ( en.hasMoreElements() ) {
            TableMonitorModel.Entry entry = en.nextElement();
            for (int i = 0; i < 5; i++) {
                gr.setColor(colors[i]);
                int x = 0;
                int y = entry.values[i];
                switch ( myTable.getType(i) ) {
                    case '0' :  // digital
                        y = (getHeight()-1)*(6-5*y)/7;
                        break;  
                    case '1' :  // 0 .. 1023
                        y = (getHeight()-1)*(1023-y)/1023;
                        break;
                    case '2' :  // 0 .. 65535
                        y = (getHeight()-1)*(65535-y)/65535;
                        break;
                    case '3' :  // -32768 .. 32767
                        y = (getHeight()-1)*(32767-y)/65535;
                        break;
                    case '4':  // -1024 .. 1023
                        y = (getHeight()-1)*(1023-y)/2047;
                }
                if ( xType == TIMESTAMP ) {
                    x = (int) (entry.timestamp/100);
                } else if ( xType == ROWCOUNT ) {
                    x = row;
                }
                gr.fillRect(x*xZoom,y*yZoom, 1, 1);          
            }
            row++;
        }
        
        for ( int i = 0; i < 5; i++ ) {
            gr.setColor(colors[i]);
            gr.drawString("Kanal " + (i+1) , rect.x+15, rect.y+15+i*15);
        }
    }
    // Variables declaration - do not modify//GEN-BEGIN:variables
    // End of variables declaration//GEN-END:variables

    @Override
    public void tableChanged(TableModelEvent e) {
        boolean scroll = false;
        if (e.getSource() == myTable) {
            int width = 0;
            if ( xType == TIMESTAMP ) {
                width = (int) ((myTable.getMaxTimestamp()-myTable.getMinTimestamp())/100);
            } else {
                width = myTable.getRowCount();
            }
            Rectangle rect = getVisibleRect();
            if ( rect.x+rect.width >= getWidth() ) scroll = true;
            this.setPreferredSize(new Dimension(width,getHeight()));
            this.revalidate();
            if (scroll) this.scrollRectToVisible(new Rectangle(width-1,0,1,getHeight()));
            this.repaint();
        }
    }

}
