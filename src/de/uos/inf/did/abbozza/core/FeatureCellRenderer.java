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
 * @fileoverview The cell renderer for the option tree of abbozza! 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

package de.uos.inf.did.abbozza.core;

import java.awt.Color;
import java.awt.Component;

import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JRadioButton;
import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeCellRenderer;

public class FeatureCellRenderer extends DefaultTreeCellRenderer {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public Component getTreeCellRendererComponent(JTree tree,
            Object value,
            boolean sel,
            boolean expanded,
            boolean leaf,
            int row,
            boolean hasFocus) {
		
		// if ( !leaf ) {
		// 	return super.getTreeCellRendererComponent(tree, value, sel, expanded, leaf, row, hasFocus);
		// } else {
			DefaultMutableTreeNode tn = (DefaultMutableTreeNode) value;
			if ( tn.getUserObject() instanceof RadioButtonNode ) {
				RadioButtonNode rbn = (RadioButtonNode) tn.getUserObject();
                                JRadioButton btn = new JRadioButton(rbn.getText(),rbn.isSelected());
                                btn.setBackground(Color.WHITE);
				return btn;
			} else  if ( tn.getUserObject() instanceof CheckBoxNode ) {
				CheckBoxNode cbn = (CheckBoxNode) tn.getUserObject();
                                JCheckBox btn = new JCheckBox(cbn.getText(),cbn.isSelected());
                                btn.setBackground(Color.WHITE);
				return btn;
			}
                        return super.getTreeCellRendererComponent(tree, value, sel, expanded, leaf, row, hasFocus);
                        // return new JLabel(tn.toString());
		//}
	}
}
