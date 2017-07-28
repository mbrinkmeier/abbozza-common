/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.AbbozzaServer;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This HttpHandler handles requests for files which can be in one of several
 * places. 
 * 
 * Upon receiving a request JarDirHandler checks his list of possible locations
 * for the requested path. It returns the first found file.
 * 
 * @author michael
 */
public class JarDirHandler implements HttpHandler {

    // The vector of entries
    private Vector<URI> entries;
    private String sketch;

    /**
     * Initialize the JarDirHandler
     */
    public JarDirHandler() {
        entries = new Vector<URI>();
    }

    /**
     * Add an URL to the list of possible locations.
     * @param uri The URI to be added
     */
    public void addURI(URI uri) {
        entries.add(uri);
    }
    
    /**
     * Add a directory to the list of possible locations.
     * 
     * @param path The path
     * @param name The name for message purposes
     */
    public void addDir(String path, String name) {
        File file = new File(path);
        if (!file.exists()) {
            AbbozzaLogger.out("JarHandler: " + name + " : " + file.toURI().toString() + " not found",AbbozzaLogger.DEBUG);
        } else {
            AbbozzaLogger.out("JarHandler: " + name + " : " + file.toURI().toString() ,AbbozzaLogger.DEBUG);
        }
        entries.add(file.toURI());
    }
    
    /**
     * Add a directory to the list of possible locations.
     * 
     * @param dir The directory
     */
    public void addDir(File dir) {
        entries.add(dir.toURI());
    }

    /**
     * Add a jar to the list of possible locations.
     * 
     * @param path The path to the jar
     * @param name the name for messagaging purposes
     */
    public void addJar(String path, String name) {
        URI uri;
        URI jarUri = new File(path).toURI();
        try {
            uri = new URI("jar:"+ jarUri.toString() +"!");
            AbbozzaLogger.out("JarHandler: " + name + " : " + uri.toString(),AbbozzaLogger.DEBUG);
        } catch (URISyntaxException e) {
            AbbozzaLogger.out("JarHandler: " + name + " not found (" + path + ")",AbbozzaLogger.DEBUG);
            return;
        }        
        entries.add(uri);
    }

    /**
     * Add a jar to the list of possible locations.
     * 
     * @param uri The uri to the jar
     * @param name the name for messagaging purposes
     */
    public void addJar(URI uri, String name) {
        try {
            URI jarUri = new URI("jar:"+ uri.toString() + "!");
            AbbozzaLogger.out("JarHandler: " + name + " : " + jarUri.toString(),AbbozzaLogger.DEBUG);
            entries.add(jarUri);
        } catch (URISyntaxException ex) {
            AbbozzaLogger.err("Malformed URL: jar:" + uri.toString() + "!");
        }
    }
    
    
    public void clear() {
        entries.clear();
    }

    @Override
    public void handle(HttpExchange exchg) throws IOException {

        String path = exchg.getRequestURI().getPath();
        
        OutputStream os = exchg.getResponseBody();
        
        byte[] bytearray = getBytes(path);

        if (bytearray == null) {
            String result = "abbozza! : " + path + " not found!";

            exchg.sendResponseHeaders(400, result.length());
            os.write(result.getBytes());
            os.close();
            return;
        }

        Headers responseHeaders = exchg.getResponseHeaders();
        if (path.equals("/")) {
            responseHeaders.set("Content-Type", "text/html; charset=utf-8");
        } else if (path.endsWith(".css")) {
            responseHeaders.set("Content-Type", "text/css; charset=utf-8");
        } else if (path.endsWith(".js")) {
            responseHeaders.set("Content-Type", "text/javascript; charset=utf-8");
        } else if (path.endsWith(".xml")) {
            responseHeaders.set("Content-Type", "text/xml; charset=utf-8");
        } else if (path.endsWith(".svg")) {
            responseHeaders.set("Content-Type", "image/svg+xml");            
        } else if (path.endsWith(".abz")) {
            responseHeaders.set("Content-Type", "text/xml; charset=utf-8");            
        } else if (path.endsWith(".png")) {
            responseHeaders.set("Content-Type", "image/png");
        } else if (path.endsWith(".html")) {
            responseHeaders.set("Content-Type", "text/html; charset=utf-8");
        } else {
            responseHeaders.set("Content-Type", "text/text; charset=utf-8");            
        }

        // ok, we are ready to send the response.
        exchg.sendResponseHeaders(200, bytearray.length);
        os.write(bytearray, 0, bytearray.length);
        os.close();
    }

    /**
     * Retreive the byte content of the requested file.
     * It is picked from the list of registered directories and jars.
     * 
     * @param path The requested path
     * @return A bytearray containig the contents of the requesed file or null.
     */
    public byte[] getBytes(String path) {
        AbbozzaLogger.out("JarDirHandler: Reading " + path, AbbozzaLogger.DEBUG);
        byte[] bytearray = null;
        int tries = 0;

        if ( path.equals("/") ) {
            path = "/" + AbbozzaServer.getInstance().getSystem() + ".html";
        }

        AbbozzaLogger.out("JarDirHandler: Reading " + path, AbbozzaLogger.INFO);

        while ((tries < 3) && (bytearray == null)) {

            Enumeration<URI> uriIt = entries.elements();

            while (uriIt.hasMoreElements() && (bytearray == null)) {
                try {
                    // The uri contains the base
                    URI uri = uriIt.nextElement();
                    URL fileUrl = new URL(uri.toString() + path);
                
                    URLConnection conn = fileUrl.openConnection();
                    InputStream inStream = conn.getInputStream();
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    int reads = inStream.read(); 
                    while(reads != -1){ 
                        baos.write(reads); 
                        reads = inStream.read(); 
                    } 
                    bytearray = baos.toByteArray();   
                                        
                } catch (IOException ex) {
                    bytearray = null;
                }
            }

            if (bytearray == null) {
                tries++;
                AbbozzaServer.getInstance().findJarsAndDirs(this);
            }
        }

        if (bytearray == null) {
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.not_found",path),AbbozzaLogger.ERROR);
        }
        return bytearray;
    }
    
    
    /**
     * Retreive an InputStream for the requested path.
     * It is picked from the list of registered directories and jars.
     * 
     * @param path The requested path
     * @return An InputStream to the requested file or null.
     */
    public InputStream getInputStream(String path) {
        AbbozzaLogger.out("JarDirHandler: Opening Stream " + path, AbbozzaLogger.DEBUG);
        InputStream inStream = null;
        int tries = 0;
      
        while ((tries < 3) && (inStream == null)) {

            Enumeration<URI> uriIt = entries.elements();
            while (uriIt.hasMoreElements() && (inStream == null)) {
                try {
                    // The uri contains the base
                    URI uri = uriIt.nextElement();
                    URL fileUrl = new URL(uri.toString() + path);
                    
                    URLConnection conn = fileUrl.openConnection();
                    inStream = conn.getInputStream();                        
                } catch (IOException ex) {
                    inStream = null;
                }

                if (inStream == null) {
                    tries++;
                    AbbozzaServer.getInstance().findJarsAndDirs(this);
                }
            }
            
        }
        
        if (inStream == null) {
            AbbozzaLogger.err(AbbozzaLocale.entry("msg.not_found",path));            
        }
        
        return inStream;
    }
    
}
