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
 * @fileoverview A check box node in the option tree of the abbozza! server 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import java.util.Enumeration;
import javax.swing.AbstractButton;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.MutableTreeNode;

public class CheckBoxNode implements ChangeListener {

	private String text;
	private boolean selected;
	private String option;
	
	private DefaultMutableTreeNode node;
	
	public CheckBoxNode(AbbozzaConfig config, String opt, String txt) {
		option = opt;
		text =txt;
		selected = config.getOption(option);
	}

	public CheckBoxNode(String opt, String txt, boolean slc) {
		option = opt;
		text =txt;
		selected = slc;
	}

	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	
	public boolean isSelected() {
		return selected;
	}
	
	public void setSelected(boolean selected) {
            this.selected = selected;
            if ( (this.node != null) && selected ) {
                if ( (this.node.getParent() != null) && ( this.node.getParent() instanceof DefaultMutableTreeNode) ) {
                    Object userObj = ((DefaultMutableTreeNode) this.node.getParent()).getUserObject();
                    if ( userObj instanceof CheckBoxNode ) {
                        ((CheckBoxNode) userObj).setSelected(selected);
                    }
                }
            }
            if ( (this.node != null) && !selected ) {
                Enumeration children = this.node.children();
                while (children.hasMoreElements()) {
                    DefaultMutableTreeNode child = (DefaultMutableTreeNode) children.nextElement();
                    Object userObj = child.getUserObject();
                    if ( userObj instanceof CheckBoxNode ) {
                        ((CheckBoxNode) userObj).setSelected(selected);
                    }
                }
            }
	}
	
	public String getOption() {
		return option;
	}
	
	public void storeOption(AbbozzaConfig config) {
		config.setOption(option,selected);
	}

	@Override
	public void stateChanged(ChangeEvent e) {
            setSelected(((AbstractButton) e.getSource()).isSelected());
	}

	public DefaultMutableTreeNode getNode() {
		return node;
	}

	public void setNode(DefaultMutableTreeNode node) {
		this.node = node;
	}
        
}
