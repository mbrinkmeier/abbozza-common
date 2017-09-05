/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.install;

import de.uos.inf.did.abbozza.tools.GUITool;
import java.awt.Dimension;
import java.awt.Toolkit;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.Properties;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileFilter;
import javax.swing.text.BadLocationException;
import javax.swing.text.DefaultStyledDocument;
import javax.swing.text.StyledDocument;

/**
 * The Installer for abbozza! for Arduino
 *
 * The installer copies the Abbozza.jar containg all necessary files to the
 * given directory. Per default the users local Arduino directory is chosen.
 * Other places are possible.
 *
 * The following files are installed: $HOME/.abbozza/arduino/abbozza.cfg - the
 * user specific abbozza configuration
 * $HOME/Arduino/tools/Abbozza/tool/Abbozza.jar - The main jar containing the
 * neccessary files
 *
 * @author michael
 */
public class AbbozzaArduinoInstaller extends javax.swing.JFrame {

    // private String toolsDir;
    private String abbozzaDir;
    public Properties prefs;
    private String sketchbookDir;

    /**
     * Creates new form AbbozzaInstaller
     */
    public AbbozzaArduinoInstaller() {
        // Read the arduino preferences
        prefs = getPreferences();

        // Initialize the frame
        initComponents();
        this.setTitle("abbozza! installer");
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        GUITool.centerWindow(this);
        /* Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
        int x = (screen.width - getWidth()) / 2;
        int y = (screen.height - getHeight()) / 2;
        setLocation(x, y); */

        String osname = System.getProperty("os.name").toLowerCase();
        if (osname.contains("mac")) {
            // OsX only requires the command 'open'
            browserField.setText("open");
            browserField.setEnabled(false);
            browserButton.setEnabled(false);
        }

        // Find the sketchbook path
        if (prefs.getProperty("sketchbook.path") != null) {
            abbozzaDir = prefs.getProperty("sketchbook.path") + "/tools/Abbozza/";
        } else {
            abbozzaDir = sketchbookDir + "/tools/Abbozza/";
        }
        File aD = new File(abbozzaDir + "tool/Abbozza.jar");

        if (aD.exists()) {
            int result = JOptionPane.showConfirmDialog(this,
                    "abbozza! seems to be installed already.\n Continue installation?",
                    "abbozza! already installed", JOptionPane.YES_NO_OPTION);
            if (result == JOptionPane.NO_OPTION) {
                System.exit(1);
            }
            // Write initial configuration file
            File prefFile = new File(System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg");
            Properties config = new Properties();
            try {
                config.load(new FileInputStream(prefFile));
                browserField.setText(config.getProperty("browserPath"));
            } catch (Exception e) {
            }
        }
    }

    /**
     * This operation reads the preferences of the current aArduino
     * installation. If the preferences file can not be read the Arduino
     * software is either missing or wasn't started by the user before.
     *
     * @return The properties containing the Arduino preferences
     */
    public Properties getPreferences() {

        String osName = System.getProperty("os.name");
        String userDir = System.getProperty("user.home");
        String prefName = userDir;

        if (osName.indexOf("Linux") != -1) {
            sketchbookDir = prefName + "/Arduino/";
            prefName = prefName + "/.arduino15/preferences.txt";
        } else if (osName.indexOf("Mac") != -1) {
            sketchbookDir = prefName + "/Documents/Arduino/";
            prefName = prefName + "/Library/Arduino/preferences.txt";
        } else if (osName.indexOf("Windows") != -1) {
            sketchbookDir = prefName + "/Documents/Arduino/";
            prefName = prefName + "/Documents/Arduino/preferences.txt";
        } else {
            sketchbookDir = prefName + "/AppData/Roaming/Arduino/";
            prefName = prefName + "/AppData/Roaming/Arduino/preferences.txt";
        }

        Properties prefs = new Properties();

        try {
            prefs.load(new FileInputStream(new File(prefName)));
        } catch (Exception e) {
            // If the preferences file was not found, either the Arduino
            // software wasn't installed before or the user didn't start it 
            // once.
            JOptionPane.showMessageDialog(null,
                    "Install the arduino software (http://arduino.cc) and start it once.",
                    "abbozza! - Error during installation", JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }

        if ((prefs != null) && (prefs.getProperty("sketchbook.path") != null)) {
            sketchbookDir = (new File(prefs.getProperty("sketchbook.path"))).getAbsolutePath();
        }

        return prefs;
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {
        java.awt.GridBagConstraints gridBagConstraints;

        logoPanel = new javax.swing.JPanel();
        jLabel1 = new javax.swing.JLabel();
        jLabel4 = new javax.swing.JLabel();
        mainPanel = new javax.swing.JPanel();
        jScrollPane1 = new javax.swing.JScrollPane();
        infoPanel = new javax.swing.JTextPane();
        sketchbookField = new javax.swing.JTextField();
        jLabel2 = new javax.swing.JLabel();
        sketchbookButton = new javax.swing.JButton();
        jLabel3 = new javax.swing.JLabel();
        browserField = new javax.swing.JTextField();
        browserButton = new javax.swing.JButton();
        buttonPanel = new javax.swing.JPanel();
        cancelButton = new javax.swing.JButton();
        installButton = new javax.swing.JButton();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setResizable(false);

        logoPanel.setLayout(new java.awt.BorderLayout());

        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/install/abbozza200.png"))); // NOI18N
        jLabel1.setToolTipText("abbozza! logo");
        logoPanel.add(jLabel1, java.awt.BorderLayout.CENTER);

        jLabel4.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        jLabel4.setText(AbbozzaInstaller.VERSION);
        jLabel4.setVerticalAlignment(javax.swing.SwingConstants.TOP);
        jLabel4.setHorizontalTextPosition(javax.swing.SwingConstants.RIGHT);
        jLabel4.setVerticalTextPosition(javax.swing.SwingConstants.BOTTOM);
        logoPanel.add(jLabel4, java.awt.BorderLayout.LINE_END);

        getContentPane().add(logoPanel, java.awt.BorderLayout.PAGE_START);
        logoPanel.getAccessibleContext().setAccessibleName("logoPanel");
        logoPanel.getAccessibleContext().setAccessibleDescription("");

        mainPanel.setBorder(javax.swing.BorderFactory.createEmptyBorder(5, 5, 15, 5));
        java.awt.GridBagLayout mainPanelLayout = new java.awt.GridBagLayout();
        mainPanelLayout.columnWidths = new int[] {350, 50};
        mainPanelLayout.rowHeights = new int[] {180, 15, 30, 30, 30, 30};
        mainPanel.setLayout(mainPanelLayout);

        infoPanel.setEditable(false);
        infoPanel.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        infoPanel.setText("\nHerzlich Willkommen!\n\nabbozza! erfordert Arduino 1.6.12 oder höher.\n(https://www.arduino.cc/en/Main/Software)\n\nAußerdem benötigt abbozza! einen JavaScript-fähigen Browser.\nVorzugsweise Google Chrome, da er im Zusammenhang mit abbozza!\nam besten getestet ist.\n\nVielen Dank, dass Sie abbozza! benutzen!\n\nDas abbozza! Team\n");
        infoPanel.setFocusable(false);
        jScrollPane1.setViewportView(infoPanel);

        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 0;
        gridBagConstraints.gridwidth = 2;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(jScrollPane1, gridBagConstraints);

        sketchbookField.setText(sketchbookDir);
        sketchbookField.setToolTipText("Das Sketchbook-Verzeichnis");
        sketchbookField.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                sketchbookFieldActionPerformed(evt);
            }
        });
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 3;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(sketchbookField, gridBagConstraints);

        jLabel2.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel2.setText("Das Sketchbook-Verzeichnis für die Installation:");
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 2;
        gridBagConstraints.gridwidth = 2;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        gridBagConstraints.anchor = java.awt.GridBagConstraints.SOUTH;
        mainPanel.add(jLabel2, gridBagConstraints);

        sketchbookButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                sketchbookButtonActionPerformed(evt);
            }
        });
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 1;
        gridBagConstraints.gridy = 3;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(sketchbookButton, gridBagConstraints);

        jLabel3.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel3.setText("Der von abbozza! verwendete Browser:");
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 4;
        gridBagConstraints.gridwidth = 2;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(jLabel3, gridBagConstraints);
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 5;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(browserField, gridBagConstraints);

        browserButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                browserButtonActionPerformed(evt);
            }
        });
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 1;
        gridBagConstraints.gridy = 5;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        mainPanel.add(browserButton, gridBagConstraints);

        getContentPane().add(mainPanel, java.awt.BorderLayout.CENTER);

        buttonPanel.setLayout(new java.awt.FlowLayout(java.awt.FlowLayout.RIGHT));

        cancelButton.setText("Abbrechen");
        cancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                cancelButtonActionPerformed(evt);
            }
        });
        buttonPanel.add(cancelButton);

        installButton.setText("Installieren");
        installButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                installButtonActionPerformed(evt);
            }
        });
        buttonPanel.add(installButton);

        getContentPane().add(buttonPanel, java.awt.BorderLayout.SOUTH);

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void cancelButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_cancelButtonActionPerformed
        System.exit(0);
    }//GEN-LAST:event_cancelButtonActionPerformed

    private void addInfoMsg(StyledDocument doc, String msg) {
        try {
            doc.insertString(doc.getLength(), msg + "\n", null);
        } catch (BadLocationException ex) {
        }
    }

    /**
     * This operation is called if the installation is confirmed.
     *
     * @param evt The Event triggering the installation.
     */
    private void installButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_installButtonActionPerformed

        File sketchbookDir = new File(sketchbookField.getText());
        File browserFile = new File(browserField.getText());

        DefaultStyledDocument infoDoc = new DefaultStyledDocument();

        infoPanel.setDocument(infoDoc);
        addInfoMsg(infoDoc, "Installation started ...");

        try {
            // Look for installer jar
            addInfoMsg(infoDoc, "... looking for " + AbbozzaArduinoInstaller.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            JarFile installerJar = new JarFile(new File(AbbozzaArduinoInstaller.class.getProtectionDomain().getCodeSource().getLocation().toURI()));
            addInfoMsg(infoDoc, "... " + installerJar.getName() + " found");

            // Find jar for installation
            ZipEntry abzFile = installerJar.getEntry("files/Abbozza.jar");

            // If file doesn't exists
            if (abzFile == null) {
                addInfoMsg(infoDoc, "... Abbozza.jar not found in archive");
                JOptionPane.showMessageDialog(this, "Abbozza.jar not found in " + installerJar.getName() + "!", "abbozza! installation failed",
                        JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }

            abbozzaDir = sketchbookDir.getAbsolutePath() + "/tools/Abbozza/tool/";
            addInfoMsg(infoDoc,"... copying Abbozza.jar to " + abbozzaDir);
            
            File abzDir = new File(abbozzaDir);
            abzDir.mkdirs();
            addInfoMsg(infoDoc,"... " + abbozzaDir + " created");
            
            File jar = new File(abbozzaDir + "Abbozza.jar");
            
            File backup = new File(abbozzaDir + "Abbozza_" + System.currentTimeMillis() + ".jar_");
            try {
                if (jar.exists()) {
                    addInfoMsg(infoDoc,"... moving old Abbozza.jar to " + backup.getName());
                    Files.move(jar.toPath(), backup.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }

                jar.createNewFile();
                
                InputStream inp = installerJar.getInputStream(abzFile);
                AbbozzaInstaller.copyToFile(inp,jar);
                addInfoMsg(infoDoc,"... copied Abbozza.jar to " + jar.getName());
                
            } catch (IOException ex) {
                addInfoMsg(infoDoc,"... could not move Abbozza.jar to " + backup.getName());
                JOptionPane.showMessageDialog(this, "Could not move " + jar.toPath() + " to " + backup.toPath(), "abbozza! installation failed", JOptionPane.ERROR_MESSAGE);
                this.setVisible(false);
                System.exit(1);
            }

            try {
                // Install libraries
                addInfoMsg(infoDoc,"... installing libraries from Abbozza.jar to " + sketchbookDir + "/libraries/Abbozza/");
                JarFile jarFile = new JarFile(jar);
                File libDir = new File(sketchbookDir + "/libraries/Abbozza/");
                libDir.mkdirs();

                JarEntry entry;
                Enumeration<JarEntry> entries = jarFile.entries();
                File dir = new File(sketchbookDir + "/libraries/Abbozza/");
                try {
                    Files.createDirectory(dir.toPath());
                } catch (FileAlreadyExistsException ex) {}
                
                while (entries.hasMoreElements()) {
                    entry = entries.nextElement();
                    if (entry.getName().startsWith("libraries/Abbozza/")) {
                        String name = entry.getName().replace("libraries/Abbozza/", "");
                        if (name.length() > 0) {
                            addInfoMsg(infoDoc,"... copying " + name);
                            File target = new File(sketchbookDir + "/libraries/Abbozza/" + name);
                            Files.copy(jarFile.getInputStream(entry), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        }
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace(System.err);
            }

            // Create configuration file
            try {
                File prefFile = new File(System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg");
                Properties config = new Properties();
                try {
                    config.load(new FileInputStream(prefFile));
                    addInfoMsg(infoDoc,"... old configuration found");
                } catch (IOException ex) {
                    config = new Properties();
                    addInfoMsg(infoDoc,"... no old configuration found");
                }
                        
                prefFile.getParentFile().mkdirs();
                prefFile.createNewFile();
                addInfoMsg(infoDoc,"... " + System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg created");
                
                if ( config.size() == 0 ) config.setProperty("freshInstall", "true");
                
                config.setProperty("browserPath", browserField.getText());
                config.store(new FileOutputStream(prefFile), "abbozza! preferences");
                
            } catch (IOException ex) {
                addInfoMsg(infoDoc,"... " + System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg could not be created");
            }            
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "abbozza-install.jar not found!", "abbozza! installation failed",
                    JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }

        addInfoMsg(infoDoc, "... Installation successful");

        JOptionPane.showMessageDialog(this, "Installation was successful!", "abbozza! installed", JOptionPane.INFORMATION_MESSAGE);
        this.setVisible(false);
        System.exit(0);

    }//GEN-LAST:event_installButtonActionPerformed

    private void sketchbookButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_sketchbookButtonActionPerformed
        JFileChooser chooser = new JFileChooser(sketchbookField.getText());
        chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        int returnVal = chooser.showOpenDialog(this);
        if (returnVal == JFileChooser.APPROVE_OPTION) {
            sketchbookField.setText(chooser.getSelectedFile().getAbsolutePath());
        }
    }//GEN-LAST:event_sketchbookButtonActionPerformed

    private void browserButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_browserButtonActionPerformed
        JFileChooser chooser = new JFileChooser(browserField.getText());
        int returnVal = chooser.showOpenDialog(this);
        chooser.setFileFilter(new FileFilter() {

            @Override
            public boolean accept(File f) {
                return f.canExecute();
            }

            @Override
            public String getDescription() {
                return "Select executable files";
            }
        });
        if (returnVal == JFileChooser.APPROVE_OPTION) {
            if (chooser.getSelectedFile() != null) {
                browserField.setText(chooser.getSelectedFile().getAbsolutePath());
            }
        }
    }//GEN-LAST:event_browserButtonActionPerformed

    private void sketchbookFieldActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_sketchbookFieldActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_sketchbookFieldActionPerformed

    /**
     * @param args the command line arguments
     */
    public static void main(String args[]) {
        /* Set the Nimbus look and feel */
        //<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
         * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html 
         */
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(AbbozzaArduinoInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(AbbozzaArduinoInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(AbbozzaArduinoInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(AbbozzaArduinoInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>
        //</editor-fold>
        //</editor-fold>
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new AbbozzaArduinoInstaller().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton browserButton;
    private javax.swing.JTextField browserField;
    private javax.swing.JPanel buttonPanel;
    private javax.swing.JButton cancelButton;
    private javax.swing.JTextPane infoPanel;
    private javax.swing.JButton installButton;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JPanel logoPanel;
    private javax.swing.JPanel mainPanel;
    private javax.swing.JButton sketchbookButton;
    private javax.swing.JTextField sketchbookField;
    // End of variables declaration//GEN-END:variables
}
