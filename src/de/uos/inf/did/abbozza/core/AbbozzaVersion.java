/*
 * Copyright 2018 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.uos.inf.did.abbozza.core;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Michael Brinkmeier (michael.brinkmeier@uni-osnabrueck.de)
 */
public class AbbozzaVersion {
    
    private static int majorCommon;
    private static int minorCommon;
    private static int hotfixCommon;
    private static int majorSystem;
    private static int minorSystem;
    private static int hotfixSystem;
    
    private static String systemName;
    
    static {
        int major = -1;
        int minor = -1;
        int revision = -1;
        String system = "null";
        Properties version;
        InputStream in;
        try {
            version = new Properties();
            in = AbbozzaVersion.class.getResourceAsStream("/de/uos/inf/did/abbozza/VERSION_COMMON");
            version.load(in);
            in.close();
            major = Integer.parseInt(version.getProperty("MAJOR"));
            minor = Integer.parseInt(version.getProperty("MINOR"));
            revision = Integer.parseInt(version.getProperty("REVISION"));
        } catch (IOException ex) {
            Logger.getLogger(AbbozzaVersion.class.getName()).log(Level.SEVERE, null, ex);
        }
        AbbozzaVersion.setCommonVersion(major,minor,revision);
        major = -1;
        minor = -1;
        revision = -1;
        system = "null";
        try {
            version = new Properties();
            in = AbbozzaVersion.class.getResourceAsStream("/de/uos/inf/did/abbozza/VERSION_SYSTEM");
            version.load(in);
            in.close();
            major = Integer.parseInt(version.getProperty("MAJOR"));
            minor = Integer.parseInt(version.getProperty("MINOR"));
            revision = Integer.parseInt(version.getProperty("REVISION"));
            system = version.getProperty("SYSTEM");
        } catch (IOException ex) {
            AbbozzaVersion.setSystemVersion(major,minor,revision);
        }
        AbbozzaVersion.setSystemVersion(major,minor,revision);
        AbbozzaVersion.setSystemName(system);
        
        System.out.println("abbozza! Version " + AbbozzaVersion.asString());
    }
    
    
    /**
     * 
     * @param major
     * @param minor
     * @param hotfix 
     */
    public static void setCommonVersion(int major, int minor, int hotfix) {
        majorCommon = major;
        minorCommon = minor;
        hotfixCommon = hotfix;
    }
    
    /**
     * 
     * @param major
     * @param minor
     * @param hotfix 
     */
    public static void setSystemVersion(int major, int minor, int hotfix) {
        majorSystem = major;
        minorSystem = minor;
        hotfixSystem = hotfix;
    }
    
    /**
     * 
     * @param systemname 
     */
    public static void setSystemName(String systemname) {
        systemName = systemname;
    }

    /**
     * 
     * @return 
     */
    public static String asString() {
        return majorSystem + "." + minorSystem + "." + hotfixSystem + " (" +
                majorCommon + "." + minorCommon + "." + hotfixCommon + " " + systemName + ")";
    }
    
    public static String getCommonVersion() {
        return majorCommon + "." + minorCommon + "." + hotfixCommon;        
    }
    
    public static String getSystemVersion() {
        return majorSystem + "." + minorSystem + "." + hotfixSystem + " (" + systemName+ ")";        
    }
    
    /**
     * Checks if the version is newer than the one given as argument.
     * 
     * @param major
     * @param minor
     * @param hotfix
     * @return 
     */
    public static boolean isCommonNewerAs(int major, int minor, int hotfix) {
       if ( majorCommon < major ) return false;
       if ( majorCommon > major ) return true;
       if ( minorCommon < minor ) return false;
       if ( minorCommon > minor ) return true;
       if ( hotfixCommon < hotfix ) return false;
       if ( hotfixCommon > hotfix ) return true;
       return true;
    }
    
    /**
     * 
     * @param major
     * @param minor
     * @param hotfix
     * @return 
     */
    public static boolean isSystemNewerAs(int major, int minor, int hotfix) {
       if ( majorSystem < major ) return false;
       if ( majorSystem > major ) return true;
       if ( minorSystem < minor ) return false;
       if ( minorSystem > minor ) return true;
       if ( hotfixSystem < hotfix ) return false;
       if ( hotfixSystem > hotfix ) return true;
       return true;
    }
    
    
}
 