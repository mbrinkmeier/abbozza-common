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
package de.uos.inf.did.abbozza.monitor.clacks;

/**
 *
 * @author michael
 */


public class ByteRingBuffer {
    
    private int _head;  // The index where the next byte is put
    private int _tail;  // The index where the next byte is read
    private int _capacity = 2048;
    private int _size;
    
    private byte _buf[];
    
    public ByteRingBuffer(int capacity) {
        _capacity = capacity;
        _buf = new byte[_capacity];
        _size = 0;
        _tail = 0;
        _head = 0;
    }
    
    public ByteRingBuffer() {
        _buf = new byte[_capacity];
        _size = 0;
        _tail = 0;
        _head = 0;
    }
    
    
    public int getSize() {
        return _size;
    }
    
    
    public boolean isEmpty() {
        return ( _size == 0 );
    }
    
    
    public void put(byte val) {
        _buf[_head] = val;
        
        if ( _tail != _head ) {
          _size++;
        } else if ( _size != 0 ) {
          // Forget the first int
          _tail = (_tail + 1) % _capacity;
        } else {
            _size = 1;
        }
        _head = (_head+1) % _capacity;
    }
    
    
    public void put(byte[] vals) {
        // Copy bytes
        for ( int i = 0; i < vals.length; i++) {
            put(vals[i]);
        }
    }

    
    public byte get() {
        if ( _size > 0 ) {
            byte val = _buf[_tail];
            _tail = (_tail + 1) % _capacity;
            _size = _size - 1;
            if ( _size == 0 ) {
                _tail = _head;
            }
            return val;
        } else {
            return 0;
        }
    }
    
    
    public int getInt() {
        if ( _size > 3 ) {
            int val = (_buf[_tail] & 0xFF ) << 24
                    | (_buf[(_tail + 1) % _capacity] &0xFF ) << 16
                    | (_buf[(_tail + 2) % _capacity] & 0xFF ) << 8
                    | (_buf[(_tail + 3) % _capacity] & 0xFF );
            _tail = (_tail + 4) % _capacity;
            _size = _size - 4;
            if ( _size == 0 ) {
                _tail = 0;
                _head = 0;
            }
            return val;
        } else {
            return 0;
        }
    }
    
    public int getClacksInt() throws ClacksParseNANException {
        if ( _size >= 6 ) {
            
            byte start = get();
            if ( start != 42 ) {
                throw new ClacksParseNANException();
            }
                        
            byte d0 = _buf[_tail];
            byte d1 = _buf[(_tail + 1) % _capacity];
            byte d2 = _buf[(_tail + 2) % _capacity];           
            byte d3 = _buf[(_tail + 3) % _capacity];
                    
            int val = ( d0 & 0xFF ) << 24
                    | ( d1 & 0xFF ) << 16
                    | ( d2 & 0xFF ) << 8
                    | ( d3 & 0xFF );
            _tail = (_tail + 4) % _capacity;
            _size = _size - 4;
            if ( _size == 0 ) {
                _tail = 0;
                _head = 0;
                // The checksum is missing
                throw new ClacksParseNANException();
            }
            
            byte checksum = get();
            if ( checksum != (d0 ^ d1 ^ d2 ^ d3) ) {
                throw new ClacksParseNANException();
            }
            
            return val;
        } else {
            throw new ClacksParseNANException();
        }
    }
    

    
    public String toString() {
        StringBuffer res = new StringBuffer(_size);
        int j = _tail;
        for (int i = 0; i < _size; i++ ) {
            res.append((char) _buf[j]);
            j = (j + 1) %_capacity;
        }
        return res.toString();
    }
    
    
    public void clear() {
        _head = 0;
        _tail = 0;
        _size = 0;
    }
}
