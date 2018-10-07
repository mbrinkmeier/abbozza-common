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
CKEDITOR.dialog.add("pagescript",function(a){return{title:"abboza! Page Script",minWidth:400,minHeight:400,contents:[{id:"tab1",label:"",title:"",elements:[{type:"textarea",id:"script",validate:CKEDITOR.dialog.validate.notEmpty(""),height:"100%",label:"Page Script","default":"// Javascript ..."}]}],onShow:function(){TaskWindow&&this.setValueOf("tab1","script",TaskWindow.getPageScript())},onOk:function(){TaskWindow&&TaskWindow.setPageScript(this.getValueOf("tab1","script"))}}});