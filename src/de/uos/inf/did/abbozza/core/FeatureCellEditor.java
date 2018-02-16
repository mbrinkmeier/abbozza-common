/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * @fileoverview The cell editor for the option tree of abbozza! 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import java.awt.Component;
import java.util.EventObject;

import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JRadioButton;
import javax.swing.JTree;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeCellEditor;
import javax.swing.tree.TreeNode;

public class FeatureCellEditor extends DefaultTreeCellEditor implements ChangeListener {

	public FeatureCellEditor(JTree tree) {
		super(tree, new FeatureCellRenderer());
	}
	
	
	 public boolean isCellEditable(EventObject event) {
		    boolean returnValue = super.isCellEditable(event);
                    /*
		    if (returnValue) {
		      Object node = tree.getLastSelectedPathComponent();
		      if ((node != null) && (node instanceof TreeNode)) {
		        TreeNode treeNode = (TreeNode) node;
		        returnValue = treeNode.isLeaf();
		      }
		    }*/
		    return returnValue;
		  }
	 
	protected boolean canEditImmediately(EventObject event)  {
		return true;
	}
	
	public Component getTreeCellEditorComponent(JTree tree,
            Object value,
            boolean isSelected,
            boolean expanded,
            boolean leaf,
            int row) {
//		if (!leaf) {
//			return null;
//		} else {
			DefaultMutableTreeNode tn = (DefaultMutableTreeNode) value;
			if ( tn.getUserObject() instanceof RadioButtonNode ) {
				RadioButtonNode rbn = (RadioButtonNode) tn.getUserObject();
				JRadioButton jrbn = new JRadioButton(rbn.getText(),rbn.isSelected());
				rbn.setNode(tn);
				jrbn.addChangeListener(rbn);
				jrbn.addChangeListener(this);
				return jrbn;
			} else  if ( tn.getUserObject() instanceof CheckBoxNode ) {
				CheckBoxNode cbn = (CheckBoxNode) tn.getUserObject();
				JCheckBox jcbn = new JCheckBox(cbn.getText(),cbn.isSelected());
				cbn.setNode(tn);
				jcbn.addChangeListener(cbn);
				jcbn.addChangeListener(this);
				return jcbn;
			}
			return new JLabel(tn.toString());
//		}
	}


	@Override
	public void stateChanged(ChangeEvent e) {
            if (e.getSource() instanceof JCheckBox) {
                JCheckBox cb = (JCheckBox) e.getSource();
                if (!cb.isSelected()) {
                    // tree.collapsePath(tree.getSelectionPath());
                } else {
                }
            }
            tree.repaint();
	}
	
}
