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
 * @fileoverview A radio button in the option tree of abbozza! 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza;

import java.util.Enumeration;
import javax.swing.AbstractButton;

import javax.swing.event.ChangeEvent;
import javax.swing.tree.DefaultMutableTreeNode;

public class RadioButtonNode extends CheckBoxNode {

	public RadioButtonNode(AbbozzaConfig config, String opt, String txt) {
		super(config,opt,txt);
	}
	
	public RadioButtonNode(String opt, String txt, boolean slc) {
		super(opt,txt,slc);
	}

	@Override
	public void stateChanged(ChangeEvent e) {
            // boolean state = ((AbstractButton) e.getSource()).isSelected();
            DefaultMutableTreeNode parent = (DefaultMutableTreeNode) getNode().getParent();
            if (parent != null) {
                Enumeration<?> it = parent.children();
            	while (it.hasMoreElements()) {
                    DefaultMutableTreeNode child = (DefaultMutableTreeNode) it.nextElement();
                    if ( child.getUserObject() instanceof RadioButtonNode) {
                    // System.out.println(((RadioButtonNode) child.getUserObject()).getText() + " -> false");
                    ((RadioButtonNode) child.getUserObject()).setSelected(false);
		}
            }
            // System.out.println(getText() + " -> true");
            // System.out.println();
            setSelected(true);
            }
	}
	
	
}
