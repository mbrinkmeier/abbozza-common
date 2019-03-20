/**
 * @license abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package de.uos.inf.did.abbozza.tools;

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 *
 * @author mbrinkmeier
 */
public class FileTool {
    
    public static void removeDirectory(File folder) {
        File[] files = folder.listFiles();
        if (files!=null) { 
            for(File f: files) {
                if(f.isDirectory()) {
                    removeDirectory(f);
                } else {
                    f.delete();
                }
            }
        }
        folder.delete();
    }
 
    public static void copyDirectory(File source, File target, boolean onlyIfNewer) throws IOException {
        
        if ( !source.exists() ) {
            AbbozzaLogger.info("FileTool: source " + source.getAbsolutePath() + " does not exist");
            return;
        }
        
        // AbbozzaLogger.out("InstallTool: Copying " + source.getAbsolutePath() + " to " + target.getAbsolutePath());
        // If the source is a directory, copy its content
        if (source.isDirectory()) {
            // create target if it doesn't exist
            if (!target.exists()) {
                target.mkdirs();
            }
            // Copy all children
            String files[] = source.list();
            for (String file : files) {
                File srcFile = new File(source, file);
                File destFile = new File(target, file);
                copyDirectory(srcFile, destFile,onlyIfNewer);
            }
        } else {
            // If it is a file, copy it directly
            if ( (!target.exists()) || (onlyIfNewer == false) || (source.lastModified() > target.lastModified()) ) {
                Files.copy(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }
    
    
    public static void extractJar(ZipFile zipFile, File targetDir) {
        ZipEntry entry;
        Enumeration<ZipEntry> entries = (Enumeration) zipFile.entries();
        while ( entries.hasMoreElements() ) {
            entry = entries.nextElement();
            if ( entry.isDirectory() ) {
                File dir = new File(targetDir.getAbsolutePath()+"/"+entry.getName());
                dir.mkdirs();
            } else {
                copyFromJar(zipFile,entry.getName(),targetDir.getAbsolutePath()+"/"+entry.getName());
            }
        }
    }
    
    
    public static boolean copyFromJar(ZipFile file, String fromEntry, String path) {
        try {
            ZipEntry entry = file.getEntry(fromEntry);
            File target = new File(path);
            Files.copy(file.getInputStream(entry), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
            if ( target.getAbsolutePath().endsWith(".sh") || target.getAbsolutePath().endsWith(".bat")) {
                target.setExecutable(true);
            }
            target.setLastModified(entry.getTime());
            return true;
        } catch (IOException ex) {
            System.out.println(ex.getLocalizedMessage());
            ex.printStackTrace(System.out);
            return false;
        }
    }

}
