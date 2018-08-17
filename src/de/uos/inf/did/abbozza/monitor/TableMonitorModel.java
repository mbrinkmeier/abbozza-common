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
 * @fileoverview The table model containing the channel data.
 *
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.monitor;

import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.Vector;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;
import javax.swing.table.TableModel;

/**
 *
 * @author mbrinkmeier
 */
public class TableMonitorModel implements TableModel {

    
    class Entry {
        public long sysTime;
        public long timestamp;
        int[] values;
        
        public Entry(long ts, int[] vs, long st) {
            timestamp = ts;
            values = vs;           
            sysTime = st;
        }
        
        public String toString() {
            return "" + timestamp +"|" + values[0] + "|"+ values[1] + "|"+ values[2] + "|"+ values[3] + "|"+ values[4] + "|" + sysTime;
        }
    }
    
    
    private Vector<Entry> entries;
    private Vector<TableModelListener> listeners;
    public long maxTimestamp = 0;
    public long minTimestamp = -1;
    char[] types;
    
    
    public TableMonitorModel() {
        entries = new Vector<Entry>();
        listeners = new Vector<TableModelListener>();
        types = new char[5];
        types[0] = '2';
        types[1] = '2';
        types[2] = '2';
        types[3] = '2';
        types[4] = '2';
    }


    public void clear() {
        int size = entries.size();
        entries.clear();
        fireTableChanged(0,0,0,TableModelEvent.DELETE);
    }
    
    public void setTypes(String ty) {
        if (ty.length() != 5) return;
        for (int i = 0; i < 5; i++) {
            types[i] = ty.charAt(i);
        }
    }
    
    public char getType(int col) {
        if (col < 0) return ' ';
        else return types[col];
    }
    
    public void addRow(long ts, int[] vs) {
        long recTime = System.currentTimeMillis();
        entries.add(new Entry(ts,vs,recTime));
        if ( ts > maxTimestamp ) maxTimestamp = ts;
        if ( minTimestamp < 0 ) minTimestamp = ts;
        if ( ts < minTimestamp )  minTimestamp = ts;
        fireTableChanged(entries.size()-1,entries.size()-1,0,TableModelEvent.INSERT);
    }
    
    
    public long getMaxTimestamp() {
        return maxTimestamp;
    }

    public long getMinTimestamp() {
        return minTimestamp;
    }

    @Override
    public int getRowCount() {
        return entries.size();
    }

    @Override
    public int getColumnCount() {
        return 7;
    }

    @Override
    public String getColumnName(int columnIndex) {
        switch (columnIndex) {
            case 6: return "SysTime";
            case 0: return "Time";
            default: return "Channel " + columnIndex;
        }
    }

    @Override
    public Class<?> getColumnClass(int columnIndex) {
        switch (columnIndex) {
            case 0: return Long.class;
            case 6: return LocalDateTime.class;
            default: return Short.class;
        }
    }

    @Override
    public boolean isCellEditable(int rowIndex, int columnIndex) {
        return false;
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        Entry entry = entries.get(rowIndex);
        switch (columnIndex) {
            case 0 : return new Long(entry.timestamp);
            case 6 : return LocalDateTime.ofInstant(Instant.ofEpochMilli(entry.sysTime), ZoneId.systemDefault());
            default : return new Integer(entry.values[columnIndex-1]);
        }
    }

    @Override
    public void setValueAt(Object aValue, int rowIndex, int columnIndex) {
        if ( rowIndex < entries.size() ) {
            Entry entry = entries.get(rowIndex);
            switch (columnIndex) {
                case 0 : 
                    if ( aValue instanceof Long ) {
                        entry.timestamp = ((Long) aValue).longValue();
                    }
                    break;
                case 6 : 
                    if ( aValue instanceof Long ) {
                        entry.sysTime = ((Long) aValue).longValue();
                    }
                    break;
                default :
                    if ( aValue instanceof Short ) {
                        entry.values[columnIndex-1] = ((Short) aValue).shortValue();
                    }
            }
            fireTableChanged(rowIndex,rowIndex,columnIndex,TableModelEvent.UPDATE);
        }
    }

    @Override
    public void addTableModelListener(TableModelListener l) {
        listeners.add(l);
    }

    @Override
    public void removeTableModelListener(TableModelListener l) {
        listeners.remove(l);
    }
    
    private void fireTableChanged(int firstRow, int lastRow, int column, int type) {
        TableModelEvent event = new TableModelEvent(this,firstRow,lastRow,column,type);
        Enumeration<TableModelListener> els = listeners.elements();                
        while (els.hasMoreElements()) {
            els.nextElement().tableChanged(event);
        }
    }
    
    public void save(FileWriter writer) throws IOException {
        Enumeration<Entry> el = entries.elements();
        while ( el.hasMoreElements() ) {
            writer.write(el.nextElement().toString()+"\n");
        }
    }
    
    public Enumeration<Entry> getEntries() {
        return entries.elements();
    }
    
}
