/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.tools.FileTool;
import java.awt.Rectangle;
import java.awt.Window;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.swing.JDialog;
import javax.swing.JOptionPane;

/**
 *
 * @author mbrinkmeier
 */
public abstract class InstallTool {

    
    /**
     * This operation checks the operating system and returns the specific
     * install tool.
     * 
     * @return An instance of the system specific InstallTool
     */
    public static InstallTool getInstallTool() {
        InstallTool tool = null;
        
        // Determine OS
        String osName = System.getProperty("os.name");
        
        if (osName.indexOf("Linux") != -1) {
            tool = new InstallToolLinux();
        } else if (osName.indexOf("Mac") != -1) {
            tool = new InstallToolMac();
        } else if (osName.indexOf("Windows") != -1) {
            tool = new InstallToolWin();
        }

        return tool;
    }

    public abstract String getInstallPath(boolean global);


    /**
     * Returns the id of the system.
     * 
     * @return The id of the system.
     */
    public abstract String getSystem();
    
   
    /**
     * This operation writes the content of an InputStream to the given file.
     * 
     * @param inp The InputStream from which the content is read.
     * @param file The file to write it to
     * 
     * @throws IOException An exception is thrown if an error occured.
     */
    public void writeToFile(InputStream inp, File file) throws IOException {
        try (FileOutputStream out = new FileOutputStream(file)) {
            byte buf[] = new byte[1024];
            while ( inp.available() > 0 ) {
                int len = inp.read(buf);
                out.write(buf, 0, len);
            }
        }
        inp.close();
    }
    
    /**
     * This operation adds a given app to the start menu. It has to be
     * implemented in the OS-specific install tools.
     * 
     * @param fileName The file of the program to be started.
     * @param name Name of the menu entry.
     * @param genName The general name of the entry.
     * @param path Path to the executable starting the app.
     * @param icon Path to the icon fpr the entry.
     * @param global If true, the menu entry should be installed for all users.
     * 
     * @return {@code true} if successful, {@code false} otherwise. 
     */
    public abstract boolean addAppToMenu(String fileName, String name, String genName, String path, String icon, boolean global);
    
    
    /**
     * This operation checks if the user has administrative rights.
     * Only then the global installation is allowed.
     * 
     * @return True if the user has administrative rights, flase otherwise
     */
    public abstract boolean isAdministrator();
    
    public abstract String getScriptSuffix();
    
    public abstract String getIconSuffix();
    
    
    /**
     * This operation returns the user directory.
     * 
     * @return the user directory.
     */
    public String getUserDir() {
        return System.getProperty("user.home");
    }
    
    public File getInstallerJar() {
        URI uri = null;
        File installFile;
        try {
            uri = InstallTool.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            installFile = new File(uri);
        } catch (URISyntaxException ex) {
            JOptionPane.showMessageDialog(null, "Unexpected error: Malformed URL " + uri.toString()
                    + "Start installer from jar!", "abbozza! installation error", JOptionPane.ERROR_MESSAGE);
            return null;
        }
        return installFile;
    }
    
    public boolean copyFromJar(ZipFile file, String fromEntry, String path) {
        try {
            ZipEntry entry = file.getEntry(fromEntry);
            File target = new File(path);
            Files.copy(file.getInputStream(entry), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
            if ( target.getAbsolutePath().endsWith(".sh") || target.getAbsolutePath().endsWith(".bat")) {
                target.setExecutable(true);
            }
            return true;
        } catch (IOException ex) {
            System.out.println(ex.getLocalizedMessage());
            ex.printStackTrace(System.out);
            return false;
        }
    }
    
    public boolean copyDirFromJar(JarFile file, String fromEntry, String path, boolean delete) {
        if (delete) {
            FileTool.removeDirectory(new File(path));
        }
        return copyDirFromJar(file,fromEntry,path);
    }
        
    public boolean copyDirFromJar(JarFile file, String fromEntry, String path) {
        try {
            Enumeration<JarEntry> entries = file.entries();
            while ( entries.hasMoreElements() ) {
                JarEntry entry = entries.nextElement();
                if ( entry.getName().startsWith(fromEntry)) {
                    String name = entry.getName().replace(fromEntry, "");
                    File target = new File(path + name);
                    if (entry.isDirectory()) {
                        target.mkdir();
                    } else {
                        Files.copy(file.getInputStream(entry), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        if ( target.getAbsolutePath().endsWith(".sh") || target.getAbsolutePath().endsWith(".bat")) {
                            target.setExecutable(true);
                        }
                    }
                }
            }
            return true;
        } catch (IOException ex) {
            System.out.println(ex.getLocalizedMessage());
            ex.printStackTrace(System.out);
            return false;
        }
    }
    
    public static void centerWindow(Window window) {
        Rectangle screen = window.getGraphicsConfiguration().getBounds();
        window.setLocation(
            screen.x + (screen.width - window.getWidth()) / 2,
            screen.y + (screen.height - window.getHeight()) / 2
        );        
    }    
    
    public String expandPath(String path) {
        if ( path == null ) return null;
        
        String xPath = path;
        if (path.contains("%HOME%")) {
            xPath = xPath.replace("%HOME%", System.getProperty("user.home"));
        }
        return xPath;
    }
    
    public File adaptUserInstallDir(File dir) {
        return new File(dir.getAbsolutePath());
    }

}
