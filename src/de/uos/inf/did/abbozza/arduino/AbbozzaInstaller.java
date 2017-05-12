/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.arduino;

import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.install.InstallTool;
import java.awt.Dimension;
import java.awt.Toolkit;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.Properties;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileFilter;

/**
 *
 * @author michael
 */
public class AbbozzaInstaller extends javax.swing.JFrame {

    // private String toolsDir;
    private String abbozzaDir;
    public Properties prefs;
    private String sketchbookDir;
    private InstallTool installTool;
    private boolean isAdmin;
    
    /**
     * Creates new form AbbozzaInstaller
     */
    public AbbozzaInstaller() {
        // Get the correct install tool
        installTool = InstallTool.getInstallTool();
        isAdmin = installTool.isAdministrator();
        
        // Read the arduino preferences
        prefs = getPreferences();

        // Initialize the frame
        initComponents();
        this.setTitle("abbozza! installer");
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
        int x = (screen.width - getWidth()) / 2;
        int y = (screen.height - getHeight()) / 2;
        setLocation(x, y);

        String osname = System.getProperty("os.name").toLowerCase();
        if (osname.contains("mac")) {
            // OsX only requires the command 'open'
            browserField.setText("open");
            browserField.setEnabled(false);
            browserButton.setEnabled(false);
        }

        AbbozzaLogger.init();
        AbbozzaLogger.setLevel(AbbozzaLogger.DEBUG);

        // Find the sketchbook path
        if (prefs.getProperty("sketchbook.path") != null) {
            abbozzaDir = prefs.getProperty("sketchbook.path") + "/tools/Abbozza/";
        } else {
            abbozzaDir = sketchbookDir + "/tools/Abbozza/";
        }
        File aD = new File(abbozzaDir + "tool/abbozza-arduino.jar");

        if (aD.exists()) {
            int result = JOptionPane.showConfirmDialog(this,
                    "abbozza! scheint bereits installiert zu sein.\n Mit der Installation fortfahren? \n (Version " + Abbozza.VERSION + ")",
                    "abbozza! bereits installiert", JOptionPane.YES_NO_OPTION);
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

        // System.out.println(prefName);
        Properties prefs = new Properties();

        try {
            prefs.load(new FileInputStream(new File(prefName)));
//        } catch (FileNotFoundException e) {
//            JOptionPane.showMessageDialog(null, "Arduino scheint nicht installiert zu sein.",
//                    "abbozza! Installationsfehler ", JOptionPane.ERROR_MESSAGE);
        } catch (IOException e) {
            // JOptionPane.showMessageDialog(null, prefName + " kann nicht gefunden werden.",
            //        "abbozza! Installationsfehler ", JOptionPane.ERROR_MESSAGE);
        }

        if ((prefs != null) && (prefs.getProperty("sketchbook.path") != null)) {
            sketchbookDir = (new File(prefs.getProperty("sketchbook.path"))).getAbsolutePath();
        }
        // System.out.println(sketchbookDir);

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
        jTextPane1 = new javax.swing.JTextPane();
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

        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/abbozza200.png"))); // NOI18N
        jLabel1.setToolTipText("abbozza! logo");
        logoPanel.add(jLabel1, java.awt.BorderLayout.CENTER);

        jLabel4.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        jLabel4.setText(Abbozza.VERSION);
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

        jTextPane1.setEditable(false);
        jTextPane1.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        jTextPane1.setText("\nHerzlich Willkommen!\n\nabbozza! erfordert Arduino 1.6.12 oder höher.\n(https://www.arduino.cc/en/Main/Software)\n\nAußerdem benötigt abbozza! einen JavaScript-fähigen Browser.\nVorzugsweise Google Chrome, da er im Zusammenhang mit abbozza!\nam besten getestet ist.\n\nVielen Dank, dass Sie abbozza! benutzen!\n\nDas abbozza! Team\n");
        jTextPane1.setFocusable(false);
        jScrollPane1.setViewportView(jTextPane1);

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

        sketchbookButton.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/directory24.png"))); // NOI18N
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

        browserButton.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/directory24.png"))); // NOI18N
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

    private void installButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_installButtonActionPerformed
        File sketchbookDir = new File(sketchbookField.getText());
        File browserFile = new File(browserField.getText());
        try {
            // Find jar used to install
            File file = new File(AbbozzaInstaller.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            // If file exists
            if (file.exists()) {
                AbbozzaLogger.out("Jar found at " + file.getCanonicalPath(), AbbozzaLogger.DEBUG);
                abbozzaDir = sketchbookDir.getAbsolutePath() + "/tools/Abbozza/tool/";
                File abzDir = new File(abbozzaDir);
                abzDir.mkdirs();
                File jar = new File(abbozzaDir + "abbozza-arduino.jar");
                File backup = new File(abbozzaDir + "Abbozza_" + System.currentTimeMillis() + ".jar_");
                try {
                    if (jar.exists()) {
                        Files.move(jar.toPath(), backup.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    }
                    jar.createNewFile();
                    // JOptionPane.showMessageDialog(null, "Kopiere " + file.toPath() + " nach " + jar.toPath());
                    Files.copy(file.toPath(), jar.toPath(), StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException ex) {
                    JOptionPane.showMessageDialog(this, "Konnte " + jar.toPath() + " nicht nach " + backup.toPath() + " sichern!", "abbozza! Fehler", JOptionPane.ERROR_MESSAGE);
                    this.setVisible(false);
                    System.exit(1);
                }
                
                try {
                    // Install libraries
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
                            if ( name.length() > 0 ) {
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
                    prefFile.getParentFile().mkdirs();
                    prefFile.createNewFile();
                    Properties config = new Properties();

                    config.setProperty("freshInstall", "true");
                    config.setProperty("browserPath", browserField.getText());

                    config.store(new FileOutputStream(prefFile), "abbozza! preferences");
                } catch (IOException ex) {
                    JOptionPane.showMessageDialog(this, System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg konnte nicht angelegt werden!\n"
                            + ex.getLocalizedMessage(), "abbozza! Fehler", JOptionPane.ERROR_MESSAGE);
                    this.setVisible(false);
                    System.exit(1);
                }

                JOptionPane.showMessageDialog(this, "Die Installation war erfolgreich!", "abbozza! installiert", JOptionPane.INFORMATION_MESSAGE);
                this.setVisible(false);
                System.exit(0);
            } else {
                JOptionPane.showMessageDialog(this, "Jar nicht gefunden!", "abbozza! Installationsfehler ",
                        JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Jar nicht gefunden!", "abbozza! Installationsfehler ",
                        JOptionPane.ERROR_MESSAGE);
                System.exit(1);
        }
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
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new AbbozzaInstaller().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton browserButton;
    private javax.swing.JTextField browserField;
    private javax.swing.JPanel buttonPanel;
    private javax.swing.JButton cancelButton;
    private javax.swing.JButton installButton;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JTextPane jTextPane1;
    private javax.swing.JPanel logoPanel;
    private javax.swing.JPanel mainPanel;
    private javax.swing.JButton sketchbookButton;
    private javax.swing.JTextField sketchbookField;
    // End of variables declaration//GEN-END:variables
}
