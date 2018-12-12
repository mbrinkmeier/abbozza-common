/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import java.io.File;

/**
 *
 * @author mbrinkmeier
 */
public class InstallToolMac extends InstallTool {

    @Override
    public boolean isAdministrator() {
        try {
            String command = "sudo -v -n";
            Process p = Runtime.getRuntime().exec(command);
            p.waitFor();                            // Wait for for command to finish
            int exitValue = p.exitValue();          // If exit value 0, then admin user.

            if (0 == exitValue) {
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getSystem() {
        return "Mac";
    }

    @Override
    public boolean addAppToMenu(String fileName, String name, String genName, String path, String icon, boolean global) {
        // @TODO Copy start script to Contents/abbozza 
        // and icons to Contents/Resources
        // and Info.plist to Contents
        return false;
    }

    @Override
    public String getScriptSuffix() {
        return ".sh";
    }

    @Override
    public String getIconSuffix() {
        return ".png";
    }

    @Override
    public String getInstallPath(boolean global, String system) {
        if ( global ) {
            return "/Applications/abbozza.app";            
        } else {
            return System.getProperty("user.home") + "/Applications/abbozza" + system + ".app";
        }
    }
    
    public File adaptUserInstallDir(File dir) {
        return new File(dir,"Contents/Resources/");
    }

}
