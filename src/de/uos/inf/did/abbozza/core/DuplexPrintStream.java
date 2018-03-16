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
 * @fileoverview A duplexer for print streams 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Locale;

public class DuplexPrintStream extends PrintStream {

	private PrintStream slave;
	
	public DuplexPrintStream(OutputStream master, PrintStream slave) {
		super(master);		
		this.slave = slave;
	}
	@Override
	public void flush() {
		slave.flush();
		super.flush();
	}

	@Override
	public void close() {
		slave.close();
		super.close();
	}

	@Override
	public boolean checkError() {
		// return ( super.checkError());
		return (slave.checkError() || super.checkError());
	}

	@Override
	protected void setError() {
		// slave.setError();
		super.setError();
	}

	@Override
	protected void clearError() {
		// slave.clearError();
		super.clearError();
	}

	@Override
	public void write(int b) {
		slave.write(b);
		super.write(b);
	}

	@Override
	public void write(byte[] buf, int off, int len) {
		slave.write(buf,off,len);
		super.write(buf, off, len);
	}

	@Override
	public void print(boolean b) {
		slave.print(b);
		super.print(b);
	}

	@Override
	public void print(char c) {
		slave.print(c);
		super.print(c);
	}

	@Override
	public void print(int i) {
		slave.print(i);
		super.print(i);
	}

	@Override
	public void print(long l) {
		slave.print(l);
		super.print(l);
	}

	@Override
	public void print(float f) {
		slave.print(f);
		super.print(f);
	}

	@Override
	public void print(double d) {
		slave.print(d);
		super.print(d);
	}

	@Override
	public void print(char[] s) {
		slave.print(s);
		super.print(s);
	}

	@Override
	public void print(String s) {
		slave.print(s);
		super.print(s);
	}

	@Override
	public void print(Object obj) {
		slave.print(obj);
		super.print(obj);
	}

	@Override
	public void println() {
		slave.println();
		super.println();
	}

	@Override
	public void println(boolean x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(char x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(int x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(long x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(float x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(double x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(char[] x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(String x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public void println(Object x) {
		slave.println(x);
		super.println(x);
	}

	@Override
	public PrintStream printf(String format, Object... args) {
		slave.printf(format, args);
		super.printf(format, args);
		return this;
	}

	@Override
	public PrintStream printf(Locale l, String format, Object... args) {
		slave.printf(l, format, args);
		super.printf(l, format, args);
		return this;
	}

	@Override
	public PrintStream format(String format, Object... args) {
		slave.format(format, args);
		super.format(format, args);
		return this;
	}

	@Override
	public PrintStream format(Locale l, String format, Object... args) {
		slave.format(l, format, args);
		super.format(l, format, args);
		return this;
	}

	@Override
	public PrintStream append(CharSequence csq) {
		slave.append(csq);
		super.append(csq);
		return this;
	}

	@Override
	public PrintStream append(CharSequence csq, int start, int end) {
		slave.append(csq, start, end);
		super.append(csq, start, end);
		return this;
	}

	@Override
	public PrintStream append(char c) {
		slave.append(c);
		super.append(c);
		return this;
	}

	@Override
	public void write(byte[] b) throws IOException {
		slave.write(b);
		super.write(b);
	}

}
