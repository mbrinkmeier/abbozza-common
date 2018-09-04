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
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.PipedInputStream;
import java.nio.ByteBuffer;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JPopupMenu;

/**
 *
 * @author mbrinkmeier
 */
public class OscillographMonitor extends MonitorPanel {
    
    private DataInputStream _dataStream;
    
    // Attributes for the view
    private int _minValue;
    private int _maxValue;
    private int _val;
    private int _scale;
    private boolean _scaleKnown;
    private boolean _resetRequested;
    private boolean _resetScaleRequested;
    
    // Attributes for the ring buffer
    private final int _bufSize = 2048;
    private int _buf[];
    private int _head; // The position from which the first int is read
    private int _tail; // The index at which the next int is written
    private int _size; // The number of ints in buffer
    
    /**
     * Creates new form OszillosgraphMonitor
     */
    public OscillographMonitor() {
        _byteStream = null;
        _thread = null;
        _fetchBytes = true;
        _scaleKnown = false;
        
        // Initialize the ring buffer
        _buf = new int[_bufSize];
        _size = 0;
        _head = 0;
        _tail = 0;
        
        _minValue = -64;
        _maxValue = 63;
        computeScale();
        
        initComponents();
        
       oszi.addMouseListener(new MonitorMouseListener(this));
    }

        
    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        _popup = new javax.swing.JPopupMenu();
        resetItem = new javax.swing.JMenuItem();
        resetScaleItem = new javax.swing.JMenuItem();
        oszi = new de.uos.inf.did.abbozza.monitor.Oscillograph(this);

        resetItem.setText(AbbozzaLocale.entry("gui.reset_osci")
        );
        resetItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetItemActionPerformed(evt);
            }
        });
        _popup.add(resetItem);

        resetScaleItem.setText(AbbozzaLocale.entry("gui.reset_osci_scale"));
        resetScaleItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetScaleItemActionPerformed(evt);
            }
        });
        _popup.add(resetScaleItem);

        oszi.setInheritsPopupMenu(true);

        javax.swing.GroupLayout osziLayout = new javax.swing.GroupLayout(oszi);
        oszi.setLayout(osziLayout);
        osziLayout.setHorizontalGroup(
            osziLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 400, Short.MAX_VALUE)
        );
        osziLayout.setVerticalGroup(
            osziLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 124, Short.MAX_VALUE)
        );

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 400, Short.MAX_VALUE)
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addComponent(oszi, javax.swing.GroupLayout.Alignment.TRAILING, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 124, Short.MAX_VALUE)
            .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                .addComponent(oszi, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
    }// </editor-fold>//GEN-END:initComponents

    private void resetItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetItemActionPerformed
        _resetRequested = true;
    }//GEN-LAST:event_resetItemActionPerformed

    private void resetScaleItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetScaleItemActionPerformed
        _resetScaleRequested = true;
    }//GEN-LAST:event_resetScaleItemActionPerformed


    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPopupMenu _popup;
    private javax.swing.JPanel oszi;
    private javax.swing.JMenuItem resetItem;
    private javax.swing.JMenuItem resetScaleItem;
    // End of variables declaration//GEN-END:variables
    

    /**
     * The name of the tab.
     * 
     * @return The localized name
     */
    @Override
    public String getName() {
        return AbbozzaLocale.entry("gui.oscillograph");
    }
    
    /**
     * Connect to byte stream
     * 
     * @param monitor 
     */
    @Override
    public void connect(AbbozzaMonitor monitor) {
        _resetRequested = false;
        _resetScaleRequested = false;
        super.connect(monitor);
        _dataStream = new DataInputStream(_byteStream);
        resetScale();
        oszi.repaint();
    }
    
    /**
     * Disconnect from byte stream
     */
    @Override
    public void disconnect() { 
        super.disconnect();
        try {
            _dataStream.close();
        } catch (IOException ex) {
        }
    }

    /**
     * Do nothing if a message is received
     */
    @Override
    public void processMessage(String s) {}
    
    
    /**
     * Add int to buffer
     */
    @Override
    public void processBytes() {
        if ( _resetRequested ) {
            reset();
            _scaleKnown = false;
            _resetRequested = false;
            resetScale();
        }
        
        if ( _resetScaleRequested ) {
            _resetScaleRequested = false;            
        }
        
        try {
           while ( _dataStream.available() >= 4 ) {
                int val = _dataStream.readInt();
                pushInt(val);
           }
        } catch (IOException ex) {
        }
        oszi.repaint();
    }
    
    /**
     * No popup mneu
     * @return 
     */
    @Override
    public JPopupMenu getPopUp() {
        return _popup;
    }
        
    /**
     * The operations for the ring buffer
     */
    
    /**
     * Add an int to the buffer
     * 
     * @param val The int to be added
     */
    private void pushInt(int val) {
        _buf[_tail] = val;
        if ( _tail != _head ) {
          _tail = (_tail+1) % _bufSize;
          _size++;
        } else if ( _size != 0 ) {
          // Forget the first int
          _tail = (_tail+1) % _bufSize;
          _head = _tail;
        } else {
            _tail = ( _tail +1 ) % _bufSize;
            _size = 1;
        }
        
        // Check max and min value
        if ( val > _maxValue ) {
            _maxValue = val;
            computeScale();
        }
        if ( val < _minValue ) {
            _minValue = val;
            computeScale();
        }
    }
        
    /**
     * Get the current number of ints in the buffer
     * 
     * @return The number of ints in the buffer
     */
    public int getBufSize() {
        return _size;
    }
    
    /**
     * Checks if the buffer is empty
     * 
     * @return true if the buffer is empty.
     */
    private boolean isEmpty() {
        return ( _size == 0 );
    }
    
    /**
     * Return the int at the given index, counted from _head.
     * 
     * @param index
     * @return 
     */
    public int getInt(int index) {
        int pos = (index + _head) % _bufSize;
        return _buf[pos];
    }
    
    /**
     * Return the maximum value
     * @return the maximum value
     */
    public int getMax() {
        return _maxValue;
    }
    
    /**
     * Return the minimum value
     * @return the minimum value
     */
    public int getMin() {
        return _minValue;
    }
    
    /**
     * Reset the scale
     */
    public void resetScale() {
        if ( _size == 0 ) {
         _minValue = -10;   
         _maxValue = 10;   
         _scaleKnown = false;
         _scale = 5;
        } else {
            _maxValue = getInt(0);
            _minValue = getInt(0);
            for (int i = 1; i < _size; i++ ) {
                int val = getInt(i);
                if ( val > _maxValue ) _maxValue = val;
                if ( val < _minValue ) _minValue = val;
            }
            if ( _minValue == _maxValue ) {
                _minValue -= 10;
                _maxValue += 10;
            }
            computeScale();
        }
    }
    
    /**
     * Return the scale width
     * 
     * @return 
     */
    private void computeScale() {
        try { 
        int span = (int) (_maxValue - _minValue);
        if ( span < 5 ) {
            _scaleKnown = false;
            span = 200;
        } else {
            _scaleKnown = true;            
        }
       int x = ((int) Math.round( Math.ceil( Math.log10(span/5) ) )) - 1;
       int scale = (int) Math.round( Math.pow(10,x) );
       if ( scale == 0 ) scale = 1;
       if ( span / scale <= 1 ) {
           _scale = 2 * scale;
       } else if ( 2*span / scale <= 5 ) {
           _scale = 5 * scale;
       } else {
           _scale = 10 * scale;
       }
        } catch (Exception ex) {
            AbbozzaLogger.err("OscillographMonitor: Exception");
            ex.printStackTrace(System.out);
        }
    }
    
    
    public int getScale() {
        if ( !_scaleKnown ) {
            resetScale();
        }
        return _scale;
    }
    
    
    public void reset() {
        _head = 0;
        _tail = 0;
        _size = 0;
        _scaleKnown = false;
        _scale = 5;
        _minValue = -10;
        _maxValue = 10;
    }
    
}
