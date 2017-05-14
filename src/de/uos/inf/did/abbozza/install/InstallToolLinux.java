/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
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
        "Categories=Development;IDE;Education\n" +
        "Icon=##icon##";
    
    @Override
    public boolean addAppToMenu(String fileName, String name, String genericName, String path, String icon, boolean global) {
        try {
            String entry = desktopEntry;
            entry = entry.replace("##name##",name);
            entry = entry.replace("##genname##",genericName);
            entry = entry.replace("##path##",path);
            entry = entry.replace("##icon##",icon);
            
            File file;
            if ( global ) {
                file = new File("/usr/share/applications/" + fileName + ".desktop");
            } else {
                file = new File( this.getUserDir() + "/.local/share/applications/" + fileName + ".desktop");
            }

            file.createNewFile();
            
            if ( file.exists() ) {
                PrintWriter out = new PrintWriter(file);
                out.print(entry);
                out.close();
            } else {
                System.out.println(file.getAbsolutePath() + " existiert nicht");
            }
        } catch (IOException ex) {
            ex.printStackTrace(System.out);
            return false;
        }
        return true;
    }

    @Override
    public boolean isAdministrator() {
        return false;
    }

    @Override
    public String getSystem() {
        return "Linux";
    }
    
}
