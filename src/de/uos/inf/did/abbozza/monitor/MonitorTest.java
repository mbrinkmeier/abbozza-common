/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.monitor;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author michael
 */
public class MonitorTest {

    public static void main(String args[]) {
        int value = 1;
        int id = 0;
        final int bufferSize = 1024;
        final char[] buffer = new char[bufferSize];
        final StringBuilder out = new StringBuilder();

        try {
            while (true)  {
                URL url = new URL("http://localhost:54242/abbozza/serial?msg=[[_" + id  + "%20dget%208]]&timeout=10000");
                id = id+1;
                                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                System.out.print(conn.getResponseCode() + " : ");
                System.out.println(conn.getResponseMessage());
                
                Reader in = new InputStreamReader(conn.getInputStream(), "UTF-8");
                
                out.delete(0, out.length());
                for (; ; ) {
                    int rsz = in.read(buffer, 0, buffer.length);
                    if (rsz < 0)
                        break;
                    out.append(buffer, 0, rsz);
                }
                System.out.println(out.toString());

                Thread.sleep(1000);

                URL url2 = new URL("http://localhost:54242/abbozza/serial?msg=[[_" + id + "%20dset%2017%20" + value + "]]");
                id = id+1;
                HttpURLConnection conn2 = (HttpURLConnection) url2.openConnection();
                conn2.setRequestMethod("GET");
                System.out.print(conn2.getResponseCode() + " : ");
                System.out.println(conn2.getResponseMessage());
                in = new InputStreamReader(conn2.getInputStream(), "UTF-8");
                
                out.delete(0, out.length());
                for (; ; ) {
                    int rsz = in.read(buffer, 0, buffer.length);
                    if (rsz < 0)
                        break;
                    out.append(buffer, 0, rsz);
                }
                System.out.println(out.toString());
                
                value=1-value;
                Thread.sleep(1000);
            }
            
        } catch (Exception ex) {
            ex.printStackTrace(System.out);
        }
    }
}
