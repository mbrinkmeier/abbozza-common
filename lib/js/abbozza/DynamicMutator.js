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
 * 
 * NOT SYSTEM SPECIFIC
 */
 
/**
 * @fileoverview A Mutator with dynamically generated block set.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

DynamicMutator = function(quarkFunction) {
  DynamicMutator.superClass_.constructor.call(this, null);
  this.quarkFunction_ = quarkFunction;
};
goog.inherits(DynamicMutator, Blockly.Mutator);


DynamicMutator.prototype.createEditor_ = function() {
	this.quarkNames_ = this.quarkFunction_(this);
	
	  this.svgDialog_ = Blockly.createSvgElement('svg',
		      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
		      null);
		  // Convert the list of names into a list of XML objects for the flyout.
		  var quarkXml = goog.dom.createDom('xml');
		  for (var i = 0, quarkName; quarkName = this.quarkNames_[i]; i++) {
		    quarkXml.appendChild(goog.dom.createDom('block', {'type': quarkName}));
		  }
		  var mutator = this;
		  var workspaceOptions = {
		    languageTree: quarkXml,
		    parentWorkspace: this.block_.workspace,
		    pathToMedia: this.block_.workspace.options.pathToMedia,
		    RTL: this.block_.RTL,
		    getMetrics: this.getFlyoutMetrics_.bind(this), // function() {return mutator.getFlyoutMetrics_();},
		    setMetrics: null
		    // svg: this.svgDialog_
		  };
		  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
                  this.workspace_.isMutator = true;
		  this.svgDialog_.appendChild(
		      this.workspace_.createDom('blocklyMutatorBackground'));
		  return this.svgDialog_;
}


DynamicMutator.prototype.setVisible = function(visible) {
    if ((visible == false) && (this.rootBlock_)) this.block_.compose(this.rootBlock_);    
    DynamicMutator.superClass_.setVisible.call(this,visible);
}