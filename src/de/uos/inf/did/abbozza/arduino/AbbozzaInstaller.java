/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.arduino;

import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.install.InstallTool;
import de.uos.inf.did.abbozza.tools.GUITool;
import java.awt.Dimension;
import java.awt.Toolkit;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.AccessDeniedException;
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
import javax.swing.JTextPane;
import javax.swing.filechooser.FileFilter;
import javax.swing.text.BadLocationException;
import javax.swing.text.Document;
import javax.swing.text.StyledDocument;

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
    private JarFile installerJar;
    private File installerFile;

    /**
     * Creates new form AbbozzaInstaller
     */
    public AbbozzaInstaller() {
        // Get the correct install tool
        installTool = InstallTool.getInstallTool();
        isAdmin = installTool.isAdministrator();

        installerFile = installTool.getInstallerJar();
        if (installerFile == null) {
            System.exit(1);
        }
        try {
            installerJar = new JarFile(installerFile);
            AbbozzaLocale.setLocale(System.getProperty("user.language"), installerJar, "install/languages/");
        } catch (IOException ex) {
            ex.printStackTrace(System.out);
            System.exit(1);
        }

        // Read the arduino preferences
        prefs = getPreferences();

        if (prefs == null) {
            JOptionPane.showMessageDialog(this,
                    AbbozzaLocale.entry("MSG.PREREQUISITES"),
                    AbbozzaLocale.entry("GUI.TITLE"), JOptionPane.ERROR_MESSAGE);
            this.setVisible(false);
            System.exit(1);
        }

        // Initialize the frame
        initComponents();
                
        this.getRootPane().setDefaultButton(installButton);
        installButton.requestFocusInWindow();

        this.setTitle(AbbozzaLocale.entry("GUI.TITLE"));
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        GUITool.centerWindow(this);

        // Set default values for Mac
        String osname = System.getProperty("os.name").toLowerCase();
        if (installTool.getSystem().equals("Mac")) {
            // OsX only requires the command 'open'
            browserField.setText("open");
            // browserField.setEnabled(false);
            // browserButton.setEnabled(false);
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
                    AbbozzaLocale.entry("MSG.ALREADY_INSTALLED") + "\n"
                    + AbbozzaLocale.entry("MSG.CONTINUE_INSTALLATION"),
                    AbbozzaLocale.entry("GUI.TITLE"), JOptionPane.YES_NO_OPTION);
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
     * Get the preferences of the installed arduino app
     *
     * @return A Properties-object containig the preference settings.
     */
    public Properties getPreferences() {

        String osName = installTool.getSystem();
        String userDir = installTool.getUserDir();
        String prefName = userDir;

        if (osName.equals("Linux")) {
            sketchbookDir = prefName + "/Arduino/";
            prefName = prefName + "/.arduino15/preferences.txt";
        } else if (osName.equals("Mac")) {
            sketchbookDir = prefName + "/Documents/Arduino/";
            prefName = prefName + "/Library/Arduino15/preferences.txt";
        } else if (osName.equals("Win")) {
            sketchbookDir = prefName + "\\Documents\\Arduino\\";
            prefName = prefName + "\\AppData\\Local\\Arduino15\\preferences.txt";
        } else {
            sketchbookDir = prefName + "/AppData/Roaming/Arduino/";
            prefName = prefName + "/AppData/Roaming/Arduino15/preferences.txt";
        }

        Properties prefs = new Properties();

        try {
            File file = new File(prefName);
            FileInputStream is = new FileInputStream(file);

            InputStreamReader r = new InputStreamReader(is, Charset.forName("UTF-8"));
            prefs.load(r);
        } catch (IOException e) {
            return null;
        } catch (IllegalArgumentException ex) {
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
        msgPanel = new javax.swing.JTextPane();
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
        jLabel4.setText("");
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

        msgPanel.setEditable(false);
        msgPanel.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        msgPanel.setText(AbbozzaLocale.entry("GUI.MESSAGE"));
        msgPanel.setFocusable(false);
        jScrollPane1.setViewportView(msgPanel);

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
        jLabel2.setText(AbbozzaLocale.entry("GUI.INSTALL_DIR"));
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
        jLabel3.setText(AbbozzaLocale.entry("GUI.BROWSER"));
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

        cancelButton.setText(AbbozzaLocale.entry("GUI.CANCEL"));
        cancelButton.setDefaultCapable(false);
        cancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                cancelButtonActionPerformed(evt);
            }
        });
        buttonPanel.add(cancelButton);

        installButton.setText(AbbozzaLocale.entry("GUI.INSTALL"));
        installButton.setSelected(true);
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
        Document msgDoc = msgPanel.getDocument();

        addMsg(msgDoc, "\n\n\n" + AbbozzaLocale.entry("MSG.STARTING_INSTALLATION"));

        // Get the values in the dialog
        File sketchbookDir = new File(sketchbookField.getText());
        File browserFile = new File(browserField.getText());

        // Find jar used to install
        if (installerJar == null) {
            System.exit(1);
        }

        /**
         * 1st step: Find/create dir
         */
        abbozzaDir = sketchbookDir.getAbsolutePath() + "/tools/Abbozza/tool/";
        addMsg(msgDoc, AbbozzaLocale.entry("MSG.CREATING_DIR", abbozzaDir));
        File abzDir = new File(abbozzaDir);
        abzDir.mkdirs();

        if (!abzDir.canWrite()) {
            JOptionPane.showMessageDialog(this,
                    AbbozzaLocale.entry("ERR.CANNOT_WRITE", abzDir.getAbsolutePath()),
                    AbbozzaLocale.entry("ERR.TITLE"), JOptionPane.ERROR_MESSAGE);
            return;
        }

        /**
         * 2nd step: Backup previous version
         */
        File targetFile = new File(abbozzaDir + "abbozza-arduino.jar");
        File backup = new File(abbozzaDir + "abbozza-arduino_" + System.currentTimeMillis() + "._jar_");
        if (targetFile.exists()) {
            addMsg(msgDoc, AbbozzaLocale.entry("MSG.BACKUP", backup.getAbsolutePath()));
            try {
                Files.move(targetFile.toPath(), backup.toPath(), StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                int opt = JOptionPane.showConfirmDialog(this,
                        AbbozzaLocale.entry("ERR.CANNOT_BACKUP") + "\n"
                        + AbbozzaLocale.entry("MSG.CONTINUE_INSTALLATION"),
                        AbbozzaLocale.entry("ERR.TITLE"), JOptionPane.YES_NO_OPTION);
                if (opt == JOptionPane.NO_OPTION) {
                    this.setVisible(false);
                    System.exit(1);
                }
            }
        }

        /**
         * 3rd step: Copy abbozza-arduino.jar and jssc to target directory
         */
        try {
            targetFile.createNewFile();
            addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING", abbozzaDir + "lib/abbozza-arduino.jar"));
            Files.copy(installerFile.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            File libDir = new File(sketchbookDir.getAbsolutePath() + "/tools/Abbozza/lib/");
            libDir.mkdirs();
            addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING", abbozzaDir + "lib/jssc-2.8.0.jar"));
            installTool.copyFromJar(installerJar,"lib/jssc-2.8.0.jar",libDir.getAbsolutePath() + "/jssc-2.8.0.jar");
            installTool.copyFromJar(installerJar,"lib/license_jssc.txt", libDir.getAbsolutePath() + "/license_jssc.txt");
            
            String scriptPath = sketchbookDir.getAbsolutePath() + "/tools/Abbozza/";
            addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING", scriptPath + "/arduinoMonitor.[sh|bat]"));
            installTool.copyFromJar(installerJar,"lib/arduinoMonitor.sh",scriptPath + "/arduinoMonitor.sh");
            installTool.copyFromJar(installerJar,"lib/arduinoMonitor.bat",scriptPath + "/arduinoMonitor.bat");
            addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING", scriptPath + "/abbozza_icon_monitor.[png|ico]"));
            installTool.copyFromJar(installerJar,"img/abbozza_icon_monitor.png",scriptPath + "lib/abbozza_icon_monitor.png");
            installTool.copyFromJar(installerJar,"img/abbozza_icon_monitor.ico",scriptPath + "lib/abbozza_icon_monitor.ico");
            
            String scriptSuffix = installTool.getScriptSuffix();
            String iconSuffix = installTool.getIconSuffix();

            installTool.addAppToMenu("arduinoMonitor", "abbozza! Monitor Arduino",
                "abbozza! Monitor Arduino",
                scriptPath + "arduinoMonitor."+scriptSuffix, scriptPath + "lib/abbozza_icon_monitor." + iconSuffix, false);
        } catch (IOException ex) {
           JOptionPane.showMessageDialog(this,
                   AbbozzaLocale.entry("ERR.CANNOT_WRITE", targetFile.getAbsolutePath()),
                   AbbozzaLocale.entry("ERR.TITLE"), JOptionPane.ERROR_MESSAGE);
           return;
        }

        /**
         * 4th step: Install libraries
         */
        File libDir = new File(sketchbookDir + "/libraries/Abbozza/");
        addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING", sketchbookDir + "/libraries/Abbozza/"));
        libDir.mkdirs();

        JarEntry entry;
        Enumeration<JarEntry> entries = installerJar.entries();

        while (entries.hasMoreElements()) {
            entry = entries.nextElement();
            if (entry.getName().startsWith("libraries/Abbozza/")) {
                String name = entry.getName().replace("libraries/Abbozza/", "");
                if (name.length() > 0) {
                    installTool.copyFromJar(installerJar,entry.getName(),sketchbookDir + "/libraries/Abbozza/" + name);
                    addMsg(msgDoc, AbbozzaLocale.entry("MSG.WRITING",sketchbookDir + "/libraries/Abbozza/" + name));
                }
            }
        }

        /**
         * 5th step: Create user configuration file
         */
        try {            
            File prefFile = new File(System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg");
            prefFile.getParentFile().mkdirs();
            if (!prefFile.exists()) {
                prefFile.createNewFile();
            }
            Properties config = new Properties();
            config.load(prefFile.toURI().toURL().openStream());

            config.setProperty("freshInstall", "true");
            config.setProperty("browserPath", browserField.getText());

            config.store(new FileOutputStream(prefFile), "abbozza! preferences");
            addMsg(msgDoc,AbbozzaLocale.entry("MSG.WRITING_CONFIGURATION",prefFile.getAbsolutePath()));
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(this, System.getProperty("user.home") + "/.abbozza/arduino/abbozza.cfg could not be created!\n"
                    + ex.getLocalizedMessage(), "abbozza! installation error", JOptionPane.ERROR_MESSAGE);
            this.setVisible(false);
            System.exit(1);
        }

        /**
         * 7th step: Confirm successfull installation
         */
        addMsg(msgDoc,AbbozzaLocale.entry("MSG.SUCCESS"));
        JOptionPane.showMessageDialog(this, new JTextPane((StyledDocument) msgDoc),
                AbbozzaLocale.entry("MSG.SUCCESS"), JOptionPane.INFORMATION_MESSAGE);
        
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
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class

.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        



} catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class

.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        



} catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class

.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        



} catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(AbbozzaInstaller.class

.getName()).log(java.util.logging.Level.SEVERE, null, ex);
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
    private javax.swing.JPanel logoPanel;
    private javax.swing.JPanel mainPanel;
    private javax.swing.JTextPane msgPanel;
    private javax.swing.JButton sketchbookButton;
    private javax.swing.JTextField sketchbookField;
    // End of variables declaration//GEN-END:variables

    private void addMsg(Document msgDoc, String text) {
        try {
            msgDoc.insertString(msgDoc.getLength(), text + "\n", null);
        } catch (BadLocationException ex) {
        }
    }

}
