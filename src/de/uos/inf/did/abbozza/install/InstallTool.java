/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

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
        } else if (osName.indexOf("Mac") != -1) {
            tool = new InstallToolMac();
        } else if (osName.indexOf("Windows") != -1) {
            tool = new InstallToolWin();
        }

        return tool;
    }

    
    /**
     * This operation writes the content of an InputStream to the given file.
     * 
     * @param inp The InputStream from which the content is read.
     * @param file The file to write it to
     * 
     * @throws IOException 
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
     * @param name Name of the menu entry.
     * @param path Path to the executable starting the app.
     * @param icon Path to the icon fpr the entry.
     * @param global If true, the menu entry should be installed for all users.
     */
    public abstract void addAppToMenu(String name, String path, String icon, boolean global);
    
    
    /**
     * This operation checks if the user has administrative rights.
     * Only then the global installation is allowed.
     * 
     * @return True if the user has administrative rights, flase otherwise
     */
    public abstract boolean isAdministrator();
    
    
    /**
     * This operation returns the user directory.
     * 
     * @return the user directory.
     */
    public String userDir() {
        return System.getProperty("user.home");
    }
}
