/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.core;

// import de.uos.inf.did.abbozza.arduino.Abbozza;
import java.io.File;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Properties;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JFileChooser;
import javax.swing.filechooser.FileFilter;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.TreeNode;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 *
 * @author michael
 */
public class AbbozzaConfigDialog extends javax.swing.JDialog {

    private AbbozzaConfig config;
    
    private DefaultTreeModel optionTree;
    private CheckBoxNode option_operations;
    private CheckBoxNode option_localVars;
    private CheckBoxNode option_serial;
    // private CheckBoxNode option_serialRate;
    private RadioButtonNode option_noArrays;
    private RadioButtonNode option_oneArray;
    private RadioButtonNode option_multiArrray;

    private int state;

    /**
     * Creates new form AbbozzaConfigDialog
     * 
     * @param props The properties displayed and modified in the dialog.
     * @param parent The parent frame.
     * @param showServer This flag inidcates if the server tab shoulkd be shown ({@code true})
     * or not ({@code fale})
     * @param modal A flag inidcating, wether the dialog should be modal ({@code true}) or not ({@code false}).
     */
    public AbbozzaConfigDialog(Properties props, java.awt.Frame parent, boolean showServer, boolean modal) {
        super(parent, modal);      

        config = new AbbozzaConfig();
        config.set(props);

        initComponents();
        
        loadConfiguration();

        if ( System.getProperty("os.name").toLowerCase().contains("mac") ) {
            // browserPathField.setText("open");
            browserPathField.setEnabled(false);
            browserButton.setEnabled(false);
        }
        
        if (showServer) {
            tabbedPane.setSelectedComponent(serverPanel);
        }
        
        // AbbozzaLogger.out(AbbozzaLocale.getLocale());
    }

    public int getState() {
        return state;
    }

    private void loadConfiguration() {
        autoStartBox.setSelected(config.startAutomatically());
        browserStartBox.setSelected(config.startBrowser());
        browserPathField.setText(config.getBrowserPath());
        serverPortSpinner.setValue(config.getServerPort());
        int i = findLocaleIndex(config.getLocale());
        localeComboBox.setSelectedIndex(i);
        updateBox.setSelected(config.getUpdate());
        updateUrlField.setText(config.getUpdateUrl());
        
        buildOptionTree();
    }

    public void setConfiguration(Properties props) {
        config = new AbbozzaConfig();
        config.set(props);
        loadConfiguration();
    }

    public Properties getConfiguration() {
        if (config == null) return null;
        return config.get();
    }
    
    private void storeConfiguration() {
        config.setAutoStart(autoStartBox.isSelected());
        config.setBrowserStart(browserStartBox.isSelected());
        config.setBrowserPath(browserPathField.getText());
        config.setServerPort(Integer.parseInt(serverPortSpinner.getValue().toString()));
        LocaleEntry le = (LocaleEntry) localeComboBox.getSelectedItem();
        config.setLocale(le.getLocale());
        config.setUpdate(this.updateBox.isSelected());
        config.setUpdateUrl(this.updateUrlField.getText());
        config.setTaskPath(this.taskPathField.getText());
        config.setTasksEditable(this.editableTasks.isSelected());
        
        storeOptions();

        for (int comp = 3; comp < tabbedPane.getTabCount(); comp++ ) {
            try {
                AbbozzaConfigPanel panel = (AbbozzaConfigPanel) tabbedPane.getComponentAt(comp);
                panel.storeConfiguration(config);
            } catch (ClassCastException ex) {
                AbbozzaLogger.stackTrace(ex);
            }
        }
        
        config.write();
    }

    public String chooseBrowser() {
        File file;
        JFileChooser chooser = new JFileChooser(AbbozzaServer.getConfig().getBrowserPath());
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
        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            file = chooser.getSelectedFile();
        } else {
            return null;
        }
        if (file == null) {
            return null;
        }
        return file.getAbsolutePath();
    }

    public String chooseTaskPath() {
        File file;
        JFileChooser chooser = new JFileChooser(AbbozzaServer.getConfig().getTaskPath());
        chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        chooser.setFileFilter(new FileFilter() {
            @Override
            public boolean accept(File f) {
                return f.isDirectory();
            }

            @Override
            public String getDescription() {
                return "Select readable directory";
            }
        });
        if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            file = chooser.getSelectedFile();
        } else {
            return null;
        }
        if (file == null) {
            return null;
        }
        return file.getAbsolutePath();
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jPanel1 = new javax.swing.JPanel();
        jScrollPane1 = new javax.swing.JScrollPane();
        jTextArea1 = new javax.swing.JTextArea();
        jScrollPane2 = new javax.swing.JScrollPane();
        jList1 = new javax.swing.JList<>();
        buttonPanel = new javax.swing.JPanel();
        storeButton = new javax.swing.JButton();
        cancelButton = new javax.swing.JButton();
        contentPanel = new javax.swing.JPanel();
        logoPanel = new javax.swing.JPanel();
        jLabel1 = new javax.swing.JLabel();
        jLabel2 = new javax.swing.JLabel();
        tabbedPane = new javax.swing.JTabbedPane();
        scrollPane = new javax.swing.JScrollPane();
        featureTree = new javax.swing.JTree();
        taskPanel = new javax.swing.JPanel();
        jLabel7 = new javax.swing.JLabel();
        taskPathField = new javax.swing.JTextField();
        taskPathButton = new javax.swing.JButton();
        editableTasks = new javax.swing.JCheckBox();
        serverPanel = new javax.swing.JPanel();
        autoStartBox = new javax.swing.JCheckBox();
        browserStartBox = new javax.swing.JCheckBox();
        jLabel3 = new javax.swing.JLabel();
        browserPathField = new javax.swing.JTextField();
        browserButton = new javax.swing.JButton();
        serverPortSpinner = new javax.swing.JSpinner();
        jLabel5 = new javax.swing.JLabel();
        localeComboBox = new javax.swing.JComboBox();
        updateBox = new javax.swing.JCheckBox();
        jLabel4 = new javax.swing.JLabel();
        updateUrlField = new javax.swing.JTextField();
        jLabel6 = new javax.swing.JLabel();
        jButton1 = new javax.swing.JButton();

        javax.swing.GroupLayout jPanel1Layout = new javax.swing.GroupLayout(jPanel1);
        jPanel1.setLayout(jPanel1Layout);
        jPanel1Layout.setHorizontalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 100, Short.MAX_VALUE)
        );
        jPanel1Layout.setVerticalGroup(
            jPanel1Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 100, Short.MAX_VALUE)
        );

        jTextArea1.setColumns(20);
        jTextArea1.setRows(5);
        jScrollPane1.setViewportView(jTextArea1);

        jList1.setModel(new javax.swing.AbstractListModel<String>() {
            String[] strings = { "Item 1", "Item 2", "Item 3", "Item 4", "Item 5" };
            public int getSize() { return strings.length; }
            public String getElementAt(int i) { return strings[i]; }
        });
        jScrollPane2.setViewportView(jList1);

        setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);

        buttonPanel.setLayout(new java.awt.FlowLayout(java.awt.FlowLayout.RIGHT));

        storeButton.setText(AbbozzaLocale.entry("gui.save"));
        storeButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                storeButtonActionPerformed(evt);
            }
        });
        buttonPanel.add(storeButton);

        cancelButton.setText(AbbozzaLocale.entry("gui.cancel"));
        cancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                cancelButtonActionPerformed(evt);
            }
        });
        buttonPanel.add(cancelButton);

        getContentPane().add(buttonPanel, java.awt.BorderLayout.SOUTH);

        contentPanel.setLayout(new java.awt.BorderLayout());

        logoPanel.setBorder(javax.swing.BorderFactory.createEmptyBorder(1, 1, 5, 1));
        logoPanel.setLayout(new java.awt.BorderLayout());

        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/abbozza200.png"))); // NOI18N
        jLabel1.setVerticalAlignment(javax.swing.SwingConstants.TOP);
        jLabel1.setVerifyInputWhenFocusTarget(false);
        logoPanel.add(jLabel1, java.awt.BorderLayout.LINE_START);

        jLabel2.setFont(new java.awt.Font("Dialog", 0, 10)); // NOI18N
        jLabel2.setText(AbbozzaServer.getInstance().getVersion());
        jLabel2.setVerticalAlignment(javax.swing.SwingConstants.TOP);
        logoPanel.add(jLabel2, java.awt.BorderLayout.LINE_END);
        jLabel2.getAccessibleContext().setAccessibleName("");

        contentPanel.add(logoPanel, java.awt.BorderLayout.PAGE_START);

        featureTree.setToolTipText("");
        featureTree.setCellEditor(new FeatureCellEditor(featureTree));
        featureTree.setCellRenderer(new FeatureCellRenderer());
        featureTree.setEditable(true);
        scrollPane.setViewportView(featureTree);

        tabbedPane.addTab(AbbozzaLocale.entry("gui.feature_title"), scrollPane);

        jLabel7.setText(AbbozzaLocale.entry("gui.task_path"));

        taskPathField.setText(config.getTaskPath());

        taskPathButton.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/directory24.png"))); // NOI18N
        taskPathButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                taskPathButtonActionPerformed(evt);
            }
        });

        editableTasks.setSelected(config.areTasksEditable());
        editableTasks.setText(AbbozzaLocale.entry("gui.tasks_editable"));
        editableTasks.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                editableTasksActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout taskPanelLayout = new javax.swing.GroupLayout(taskPanel);
        taskPanel.setLayout(taskPanelLayout);
        taskPanelLayout.setHorizontalGroup(
            taskPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, taskPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(taskPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addComponent(editableTasks, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addGroup(taskPanelLayout.createSequentialGroup()
                        .addGroup(taskPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(taskPanelLayout.createSequentialGroup()
                                .addComponent(jLabel7, javax.swing.GroupLayout.PREFERRED_SIZE, 412, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addGap(0, 117, Short.MAX_VALUE))
                            .addComponent(taskPathField))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(taskPathButton, javax.swing.GroupLayout.PREFERRED_SIZE, 64, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap())
        );
        taskPanelLayout.setVerticalGroup(
            taskPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(taskPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(jLabel7)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(taskPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                    .addComponent(taskPathField)
                    .addComponent(taskPathButton, javax.swing.GroupLayout.DEFAULT_SIZE, 35, Short.MAX_VALUE))
                .addGap(18, 18, 18)
                .addComponent(editableTasks)
                .addContainerGap(203, Short.MAX_VALUE))
        );

        tabbedPane.addTab(AbbozzaLocale.entry("gui.tasks"), taskPanel);

        autoStartBox.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        autoStartBox.setSelected(config.startAutomatically());
        autoStartBox.setText(AbbozzaLocale.entry("gui.start_directly"));

        browserStartBox.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        browserStartBox.setSelected(config.startBrowser());
        browserStartBox.setText(AbbozzaLocale.entry("gui.start_browser"));

        jLabel3.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel3.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);
        jLabel3.setText(AbbozzaLocale.entry("gui.language"));
        jLabel3.setHorizontalTextPosition(javax.swing.SwingConstants.RIGHT);

        browserPathField.setText(config.getBrowserPath());

        browserButton.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/directory24.png"))); // NOI18N
        browserButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                browserButtonActionPerformed(evt);
            }
        });

        serverPortSpinner.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        serverPortSpinner.setModel(new javax.swing.SpinnerNumberModel(config.getServerPort(), 49152, 65535, 1));

        jLabel5.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel5.setText(AbbozzaLocale.entry("gui.server_port") + " (IP: " + AbbozzaServer.getInstance().getIp4Address() + " )");

        localeComboBox.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        localeComboBox.setModel(new DefaultComboBoxModel(AbbozzaServer.getInstance().getLocales()));
        localeComboBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                localeComboBoxActionPerformed(evt);
            }
        });

        updateBox.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        updateBox.setSelected(AbbozzaServer.getConfig().getUpdate());
        updateBox.setText(AbbozzaLocale.entry("gui.update_option"));
        updateBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                updateBoxActionPerformed(evt);
            }
        });

        jLabel4.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel4.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);
        jLabel4.setText(AbbozzaLocale.entry("gui.update_url"));
        jLabel4.setHorizontalTextPosition(javax.swing.SwingConstants.RIGHT);

        updateUrlField.setText(config.getUpdateUrl());

        jLabel6.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jLabel6.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);
        jLabel6.setText(AbbozzaLocale.entry("gui.browser_path"));
        jLabel6.setHorizontalTextPosition(javax.swing.SwingConstants.RIGHT);

        jButton1.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        jButton1.setText(AbbozzaLocale.entry("gui.update_button"));
        jButton1.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                updateActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout serverPanelLayout = new javax.swing.GroupLayout(serverPanel);
        serverPanel.setLayout(serverPanelLayout);
        serverPanelLayout.setHorizontalGroup(
            serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(serverPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jButton1, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .addGroup(serverPanelLayout.createSequentialGroup()
                        .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabel5)
                            .addComponent(jLabel6, javax.swing.GroupLayout.Alignment.TRAILING))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                            .addGroup(serverPanelLayout.createSequentialGroup()
                                .addComponent(browserPathField, javax.swing.GroupLayout.DEFAULT_SIZE, 440, Short.MAX_VALUE)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addComponent(browserButton, javax.swing.GroupLayout.PREFERRED_SIZE, 56, javax.swing.GroupLayout.PREFERRED_SIZE))
                            .addGroup(serverPanelLayout.createSequentialGroup()
                                .addComponent(serverPortSpinner, javax.swing.GroupLayout.PREFERRED_SIZE, 73, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addGap(0, 0, Short.MAX_VALUE))))
                    .addGroup(serverPanelLayout.createSequentialGroup()
                        .addComponent(jLabel4)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(updateUrlField))
                    .addGroup(serverPanelLayout.createSequentialGroup()
                        .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(serverPanelLayout.createSequentialGroup()
                                .addComponent(autoStartBox)
                                .addGap(18, 18, 18)
                                .addComponent(browserStartBox))
                            .addGroup(serverPanelLayout.createSequentialGroup()
                                .addGap(2, 2, 2)
                                .addComponent(jLabel3)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                                .addComponent(localeComboBox, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                            .addComponent(updateBox))
                        .addGap(0, 0, Short.MAX_VALUE)))
                .addContainerGap())
        );
        serverPanelLayout.setVerticalGroup(
            serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(serverPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(localeComboBox, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel3))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(browserStartBox)
                    .addComponent(autoStartBox))
                .addGap(14, 14, 14)
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                    .addComponent(browserButton, javax.swing.GroupLayout.PREFERRED_SIZE, 0, Short.MAX_VALUE)
                    .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                        .addComponent(browserPathField)
                        .addComponent(jLabel6)))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(serverPortSpinner, javax.swing.GroupLayout.PREFERRED_SIZE, 27, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel5))
                .addGap(18, 18, Short.MAX_VALUE)
                .addComponent(updateBox)
                .addGroup(serverPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(serverPanelLayout.createSequentialGroup()
                        .addGap(10, 10, 10)
                        .addComponent(jLabel4))
                    .addGroup(serverPanelLayout.createSequentialGroup()
                        .addGap(18, 18, 18)
                        .addComponent(updateUrlField, javax.swing.GroupLayout.PREFERRED_SIZE, 27, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addGap(50, 50, 50)
                .addComponent(jButton1)
                .addContainerGap())
        );

        tabbedPane.addTab(AbbozzaLocale.entry("gui.server_and_browser"), serverPanel);
        serverPanel.getAccessibleContext().setAccessibleDescription("");

        contentPanel.add(tabbedPane, java.awt.BorderLayout.CENTER);
        tabbedPane.getAccessibleContext().setAccessibleDescription("");

        getContentPane().add(contentPanel, java.awt.BorderLayout.CENTER);

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void cancelButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_cancelButtonActionPerformed
        setVisible(false);
        dispose();
        state = 1;
    }//GEN-LAST:event_cancelButtonActionPerformed

    private void storeButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_storeButtonActionPerformed
        storeConfiguration();
        state = 0;
        setVisible(false);
        dispose();
    }//GEN-LAST:event_storeButtonActionPerformed

    private void updateBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_updateBoxActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_updateBoxActionPerformed

    private void localeComboBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_localeComboBoxActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_localeComboBoxActionPerformed

    private void browserButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_browserButtonActionPerformed
        String browser = chooseBrowser();
        if (browser != null) {
            browserPathField.setText(browser);
        }
    }//GEN-LAST:event_browserButtonActionPerformed

    private void updateActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_updateActionPerformed
        AbbozzaServer.getInstance().checkForUpdate(true,updateUrlField.getText());
    }//GEN-LAST:event_updateActionPerformed

    private void taskPathButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_taskPathButtonActionPerformed
        String taskPath = chooseTaskPath();
        if (taskPath != null) {
            taskPathField.setText(taskPath);
        }
    }//GEN-LAST:event_taskPathButtonActionPerformed

    private void editableTasksActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_editableTasksActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_editableTasksActionPerformed

    
    private void parseOptionNode(Node node, DefaultMutableTreeNode root, String prefix) {
        String type = node.getNodeName();
        switch (type) {
            case "group":
                {
                    String groupName = node.getAttributes().getNamedItem("name").getNodeValue();
                    DefaultMutableTreeNode group = new DefaultMutableTreeNode(AbbozzaLocale.entry(groupName));
                    NodeList children = node.getChildNodes();
                    for (int i = 0; i < children.getLength(); i++) {
                        parseOptionNode(children.item(i),group, prefix);
                    }       root.add(group);
                    break;
                }
            case "item":
                {
                    String optionName  = node.getAttributes().getNamedItem("option").getNodeValue();
                    String itemName = node.getAttributes().getNamedItem("name").getNodeValue();
                    CheckBoxNode treeNode = new CheckBoxNode(config,prefix+optionName, AbbozzaLocale.entry(itemName));
                    DefaultMutableTreeNode group = new DefaultMutableTreeNode(treeNode);
                    NodeList children = node.getChildNodes();
                    for (int i = 0; i < children.getLength(); i++) {
                        parseOptionNode(children.item(i),group,prefix);
                    }       root.add(group);
                    break;
                }
            case "choice":
                {
                    String optionName  = node.getAttributes().getNamedItem("option").getNodeValue();
                    String itemName = node.getAttributes().getNamedItem("name").getNodeValue();
                    RadioButtonNode treeNode = new RadioButtonNode(config,prefix+optionName, AbbozzaLocale.entry(itemName));
                    root.add(new DefaultMutableTreeNode(treeNode));
                    break;
                }
            case "options":
                {
                    // Plugin Options found
                    String pluginName = node.getAttributes().getNamedItem("plugin").getNodeValue();
                    CheckBoxNode pluginNode = new CheckBoxNode(config, pluginName+".enabled", AbbozzaServer.getPlugin(pluginName).getName());
                    DefaultMutableTreeNode group = new DefaultMutableTreeNode(pluginNode);
                    NodeList children = node.getChildNodes();
                    for (int i = 0; i < children.getLength(); i++) {
                        parseOptionNode(children.item(i),group,pluginName+".");
                    }       root.add(group);
                    break;
                }
            default:
                break;
        }
    }
    
        
    public DefaultTreeModel buildOptionTree() {
        DefaultMutableTreeNode root = new DefaultMutableTreeNode(AbbozzaLocale.entry("gui.options"));
        optionTree = new DefaultTreeModel(root);
                
        
        // Read DOM from options.xml
        Document optionXml = AbbozzaServer.getInstance().getOptionTree();

        NodeList roots = optionXml.getElementsByTagName("options");
        for (int i = 0; i < roots.getLength(); i++) {   
            Node node = roots.item(i);
            if ( node.getAttributes().getNamedItem("plugin") == null) {
                NodeList children = node.getChildNodes();
                for (int j = 0; j < children.getLength(); j++) {
                    Node child = children.item(j);
                    parseOptionNode(child,root,"");
                }
            }
        }

        featureTree.setModel(optionTree);
        for (int row = 0; row < featureTree.getRowCount(); row++ )
            featureTree.expandRow(row);

        return optionTree;
    }

    
    public void storeOptions() {
        // Iterate through optionTree

        DefaultMutableTreeNode node;
        ArrayList<DefaultMutableTreeNode> queue = new ArrayList<DefaultMutableTreeNode>();
        queue.add((DefaultMutableTreeNode) optionTree.getRoot());
        while (!queue.isEmpty()) {
            node = queue.get(0);
            queue.remove(0);
            if (node.isLeaf()) {
                if (node.getUserObject() instanceof RadioButtonNode) {
                    RadioButtonNode rbn = (RadioButtonNode) node.getUserObject();
                    rbn.storeOption(config);
                } else if (node.getUserObject() instanceof CheckBoxNode) {
                    CheckBoxNode cbn = (CheckBoxNode) node.getUserObject();
                    cbn.storeOption(config);
                }
            } else {
                if (node.getUserObject() instanceof CheckBoxNode) {
                    CheckBoxNode cbn = (CheckBoxNode) node.getUserObject();
                    cbn.storeOption(config);                    
                }
                Enumeration<TreeNode> it = node.children();
                while (it.hasMoreElements()) {
                    DefaultMutableTreeNode child = (DefaultMutableTreeNode) it.nextElement();
                    queue.add(child);
                }
            }
        }
    }

    public int findLocaleIndex(String loc) {
        int len = localeComboBox.getItemCount();
        int i = 0;
        while ( (i<len) && ( !loc.equals(((LocaleEntry)localeComboBox.getItemAt(i)).getLocale())) ) {
            i++;
        }
        if (i == len) return -1;
        return i;
    }
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JCheckBox autoStartBox;
    private javax.swing.JButton browserButton;
    private javax.swing.JTextField browserPathField;
    private javax.swing.JCheckBox browserStartBox;
    private javax.swing.JPanel buttonPanel;
    private javax.swing.JButton cancelButton;
    private javax.swing.JPanel contentPanel;
    private javax.swing.JCheckBox editableTasks;
    private javax.swing.JTree featureTree;
    private javax.swing.JButton jButton1;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel3;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JLabel jLabel5;
    private javax.swing.JLabel jLabel6;
    private javax.swing.JLabel jLabel7;
    private javax.swing.JList<String> jList1;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JScrollPane jScrollPane2;
    private javax.swing.JTextArea jTextArea1;
    private javax.swing.JComboBox localeComboBox;
    private javax.swing.JPanel logoPanel;
    private javax.swing.JScrollPane scrollPane;
    private javax.swing.JPanel serverPanel;
    private javax.swing.JSpinner serverPortSpinner;
    private javax.swing.JButton storeButton;
    private javax.swing.JTabbedPane tabbedPane;
    private javax.swing.JPanel taskPanel;
    private javax.swing.JButton taskPathButton;
    private javax.swing.JTextField taskPathField;
    private javax.swing.JCheckBox updateBox;
    private javax.swing.JTextField updateUrlField;
    // End of variables declaration//GEN-END:variables

    public void addPanel(AbbozzaConfigPanel panel) {
        tabbedPane.add(panel, tabbedPane.getTabCount());
        tabbedPane.setTitleAt(tabbedPane.getTabCount()-1, panel.getName());
    }
    
    @Override
    public void dispose() {
        AbbozzaServer.instance.resetFrame();
        super.dispose();
    }
}
