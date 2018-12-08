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

/**
 *
 * @author Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>
 */
public class AbbozzaVersion {
    
    private static int majorCommon;
    private static int minorCommon;
    private static int hotfixCommon;
    private static int majorSystem;
    private static int minorSystem;
    private static int hotfixSystem;
    
    private static String codeName;
    
    /**
     * 
     * @param major
     * @param minor
     * @param hotfix 
     */
    protected static void setCommonVersion(int major, int minor, int hotfix) {
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
    protected static void setSystemVersion(int major, int minor, int hotfix) {
        majorSystem = major;
        minorSystem = minor;
        hotfixSystem = hotfix;
    }
    
    /**
     * 
     * @param codename 
     */
    protected static void setCodeName(String codename) {
        codeName = codename;
    }

    /**
     * 
     * @return 
     */
    public static String asString() {
        return majorSystem + "." + minorSystem + "." + hotfixSystem + " (" +
                majorCommon + "." + minorCommon + "." + hotfixCommon + " " + codeName + ")";
    }
    
    /**
     * Checks if the version is newer than the one given as argument.
     * 
     * @param major
     * @param minor
     * @param hotfix
     * @return 
     */
    public boolean isCommonNewerAs(int major, int minor, int hotfix) {
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
    public boolean isSystemNewerAs(int major, int minor, int hotfix) {
       if ( majorSystem < major ) return false;
       if ( majorSystem > major ) return true;
       if ( minorSystem < minor ) return false;
       if ( minorSystem > minor ) return true;
       if ( hotfixSystem < hotfix ) return false;
       if ( hotfixSystem > hotfix ) return true;
       return true;
    }
    
}
 