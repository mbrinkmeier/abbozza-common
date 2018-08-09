/*

 abbozza!

 Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
CKEDITOR.dialog.add("hint",function(b){return{title:"abboza! Hint",minWidth:400,minHeight:200,contents:[{id:"tab1",label:"",tiutle:"",elements:[{type:"textarea",id:"text",validate:CKEDITOR.dialog.validate.notEmpty(""),label:"Text","default":"Text",setup:function(a){this.setValue(a.element.getText())},commit:function(a){a.setData("text",this.getValue())}},{type:"text",id:"block",label:"Block ID",validate:CKEDITOR.dialog.validate.notEmpty(""),"default":"block_id",setup:function(a){this.setValue(a.element.getAttribute("block"))},
commit:function(a){a.setData("block",this.getValue());a.element.setAttribute("block",this.getValue())}},{type:"text",id:"dx",label:"X-Offset [px]",validate:CKEDITOR.dialog.validate.notEmpty(""),"default":"0",setup:function(a){this.setValue(a.element.getAttribute("dx"))},commit:function(a){a.setData("dx",this.getValue());a.element.setAttribute("dx",this.getValue())}},{type:"text",id:"dy",label:"Y-Offset [px]",validate:CKEDITOR.dialog.validate.notEmpty(""),"default":"0",setup:function(a){this.setValue(a.element.getAttribute("dy"))},
commit:function(a){a.setData("dy",this.getValue());a.element.setAttribute("dy",this.getValue())}},{type:"text",id:"width",label:"Width",validate:CKEDITOR.dialog.validate.notEmpty(""),"default":"20em",setup:function(a){this.setValue(a.element.getAttribute("width"))},commit:function(a){a.setData("width",this.getValue());a.element.setAttribute("width",this.getValue())}},{type:"text",id:"height",label:"Height",validate:CKEDITOR.dialog.validate.notEmpty(""),"default":"3em",setup:function(a){this.setValue(a.element.getAttribute("height"))},
commit:function(a){a.setData("height",this.getValue());a.element.setAttribute("height",this.getValue())}}]}]}});