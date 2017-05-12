/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

/**
 *
 * @author mbrinkmeier
 */
public class InstallToolWin extends InstallTool {

    @Override
    public void addAppToMenu(String name, String path, String icon, boolean global) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public boolean isAdministrator() {
        return false;
    }
    
}
