/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza;

import javax.swing.JPanel;

/**
 *
 * @author michael
 */
public abstract class AbbozzaConfigPanel extends JPanel{
    
    public abstract void storeConfiguration(AbbozzaConfig config);
    public abstract String getName();
    
}
