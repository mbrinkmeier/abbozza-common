/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author mbrinkmeier
 */
public class InstallToolLinux extends InstallTool {

    private String desktopEntry = 
        "[Desktop Entry]\n" + 
        "Type=Application\n" + 
        "Name=##name##\n" +
        "GenericName=##genname##\n" +
        "Exec=##path##\n" + 
        "Path=##working##\n" +
        "Categories=Development;IDE;Education\n" +
        "Icon=##icon##";
    
    @Override
    public boolean addAppToMenu(String fileName, String name, String genericName, String path, String icon, boolean global) {
        File file = null;
        try {
            String working = new File(path).getParentFile().getAbsolutePath();
            String entry = desktopEntry;
            entry = entry.replace("##name##",name);
            entry = entry.replace("##genname##",genericName);
            entry = entry.replace("##path##",path);
            entry = entry.replace("##icon##",icon);
            entry = entry.replace("##working##",working);
            
            if ( global ) {
                file = new File("/usr/share/applications/" + fileName + ".desktop");
            } else {
                Files.createDirectories( new File(this.getUserDir() + "/.local/share/applications/").toPath());
                file = new File( this.getUserDir() + "/.local/share/applications/" + fileName + ".desktop");
            }

            file.createNewFile();
            
            if ( file.exists() ) {
                PrintWriter out = new PrintWriter(file);
                out.print(entry);
                out.close();
            } else {
                System.err.println(file.getAbsolutePath() + " existiert nicht");
            }
        } catch (IOException ex) {
            if ( file != null ) {
                System.err.print("Error while writing shortcut to " + file.getAbsolutePath() + " : ");
                System.err.println(ex.getLocalizedMessage());
            } else {
                System.err.print("Error while writing shortcut : ");
                System.err.println(ex.getLocalizedMessage());
            }
            return false;
        }
        return true;
    }

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
        return "Linux";
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
            return "/usr/local/lib/abbozza";            
        } else {
            return System.getProperty("user.home") + "/abbozza" + system;
        }
    }
    
    
    public String checkBrowsers() {
         String paths[] = {
            "/usr/bin/chromium-browser",
            "/usr/local/bin/chromium-browser",
            "/usr/bin/google-chrome",
            "/usr/local/bin/google-chrome",
            "/usr/bin/firefox",
            "/usr/local/bin/firefox"
         };
        return checkBrowsers(paths);
    }
}
