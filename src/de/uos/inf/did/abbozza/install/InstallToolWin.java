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
public class InstallToolWin extends InstallTool {

    @Override
    public boolean isAdministrator() {
        return false;
    }

    @Override
    public String getSystem() {
        return "Win";
    }

    private String powershellScript =
       "$WshShell = New-Object -ComObject WScript.Shell; " +
       "$Shortcut = $WshShell.CreateShortcut(\\\"##lnkpath##\\##name##.lnk\\\"); " +
       "$Shortcut.TargetPath = \\\"##path##\\\"; " +
       "$Shortcut.IconLocation = \\\"##icon##\\\"; " +
       "$Shortcut.Description = \\\"##genname##\\\"; " +
       "$Shortcut.WorkingDirectory = \\\"##working##\\\"; " +
       "$Shortcut.Save()";
    
    @Override
    public boolean addAppToMenu(String fileName, String name, String genName, String path, String icon, boolean global) {
        File file;
        if ( global ) {
            file = new File("C:/ProgramData/Microsoft/Windows/Start Menu/Programs/Abbozza");
        } else {
            file = new File( System.getenv("APPDATA") + "/Microsoft/Windows/Start Menu/Programs/Abbozza");
        }
        file.mkdir();
        
        String working = new File(path).getParentFile().getAbsolutePath();
        String entry = powershellScript;
        entry = entry.replace("##lnkpath##",file.getAbsolutePath());
        entry = entry.replace("##name##",name);
        entry = entry.replace("##genname##",genName);
        entry = entry.replace("##path##",path);
        entry = entry.replace("##icon##",icon);
        entry = entry.replace("##working##",working);
        
        ProcessBuilder procBuilder = new ProcessBuilder("powershell","-Command","\"& {" + entry + " }\"");
        procBuilder.inheritIO();
        Process proc = null;
        try {
            proc = procBuilder.start();
            proc.waitFor();
        } catch (InterruptedException ex) {
            Logger.getLogger(InstallToolWin.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(InstallToolWin.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        return true;
    }

    @Override
    public String getScriptSuffix() {
        return "bat";
    }

    @Override
    public String getIconSuffix() {
        return "ico";
    }
    
}
