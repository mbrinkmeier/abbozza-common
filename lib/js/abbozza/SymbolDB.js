/**
 *  SymbolDB
 * 
 *  Class to maintain all symbols in one function block.
 * 
 *  Each entry has the form
 *   [ name , type , len , symboltype, comment ]
 * 
 *  (0) name : Name of the symbol
 *  (1) type : Type of the Variable, Arraycell or return type of function, the device
 *  (2) len : array of lengths for arrays (null for functions and variables), or SymbolDB if function
 *  (3) symboltype: Type of symbol 0 = variable/array, 1 = parameter, 2 = function, 3 = device
 *  (4) comment: a comment
 **/
 
// ReservedWords = {
// 	list : "",
//	",setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto," +
//	"#define,#include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,LED_BUILTIN,true,false," +
//	"void,boolean,char,unsigned,byte,int,word,long,short,float,double,string,String," +
//	"sizeof,PROGMEM,pinMode,digitalWrite,digitalRead,analogReference,analogRead," +
//	"analogWrite,analogReadResolution,analogWriteResolutinon,tone,noTone,shiftOut," +
//	"shiftIn,pulseIn,millis,micros,delay,delayMicroseconds,min,max,abs,constrain," +
//	"map,pow,sqrt,sin,cos,tan,randomSeed,random,lowByte,highByte,bitRead,bitWrite,bitSet," +
//	"bitClear,bit,attachInterrupt,detachInterrupt,interrupts,noInterrupts,Serial,Stream,"+
//	"Keyboard,Mouse,"+
//	"Serial.available,Serial.begin,Serial.end,Serial.find,Serial.findUntil,Serial.flush," +
//	"Serial.parseFloat,Serial.parseInt,Serial.peek,Serial.print,Serail.println,Serial.read," +
//	"Serial.readBytes,Serial.readBytesUntil,Serial.setTimeout,Serial.write,Serial.serialEvent," +
//	"Stream.available,Stream.read,Stream.flush,Stream.find,Stream.findUnti,Stream.peek," +
//	"Stream.readBytes,Stream.readBytesUntil,Stream.readString,Stream.readStringUntil,Stream.parseInt," +
//	"Stream.parsefloat,Stream.setTimeout," +
//	"Mouse.begin,Mouse.click,Mouse.end,Mouse.move,Mouse.press,Mouse.release,Mouse.isPressed," +
//	"Keyboard.begin,Keyboard.end,Keyboard.press,Keyboard.print,Keyboard.println,Keyboard.release," +
//	"Keyboard.releaseAll,Keyboard.write",
//	
//	check : function(text) {
//		var myRegExp = new RegExp(".*," + text+ ",.*", 'i');
//		return this.list.match(myRegExp);
//	}
//}

 
 SymbolDB = function(parentDB) {
 	if (parentDB) console.log("SymbolDB: parentDB");
	// this.parentDB = parentDB;

	this.symbols = [];
	this.children = [];
}


SymbolDB.prototype.VAR_SYMBOL = 0;
SymbolDB.prototype.PAR_SYMBOL = 1;
SymbolDB.prototype.FUN_SYMBOL = 2;
SymbolDB.prototype.DEV_SYMBOL = 3;
SymbolDB.prototype.ISR_SYMBOL = 4;


SymbolDB.prototype.addChild = function (child,name) {
	// Check, if symbol name exists
	var symbol = this.getSymbol(name);
	
	// if the symbol doesn't exist, do nothing
	if ( symbol == null ) {
		// console.log("SymbolDB: " + name + " does not exist");
		return;
	}
		
	// If the symbol exists, check if it is a function and has an symbolDB
	if ( (symbol[3] != this.FUN_SYMBOL) && (symbol[3] != this.ISR_SYMBOL) ) {
		// console.log("SymbolDB: " + name + " is no function");
		return;
	}
	
	if ( symbol[2] == null ) {
		this.children.push(child);
		symbol[2] = child;
		child.parentDB = this;
	}
}


SymbolDB.prototype.getChild = function(name) {
	var symbol;
	for ( var i = 0; i < this.symbols.length; i++) {
		symbol = this.symbols[i];
		if ( (symbol[0] == name) && ((symbol[3] == this.FUN_SYMBOL) || (symbol[3] == this.ISR_SYMBOL)) ) {
			return symbol[3];
		}
	}
	return null;
}

/**
 * Local existence check for symbol of given name.
 * Returns null if symbol does not exist
 */
SymbolDB.prototype._exists = function (name) {
	for ( var i = 0; i < this.symbols.length ; i++ ) {
		if ( name == this.symbols[i][0] )
			return this.symbols[i];
	}
	return null
}


/**
 * _("global") existence check. Returns symbol, if found, otherwise null.
 */
SymbolDB.prototype.exists = function(name) {
	var result = null;

	result = this._exists(name);		
	
	// Check parent
	if ( (result == null) && (this.parentDB) ) {
		result = this.parentDB._exists(name);
	}	

	// Check all children
	var i = 0;
	while ( (result == null) && (i < this.children.length) ) {
		result = this.children[i]._exists(name);
		i++;
	}	
	
	return result;
}


/**
 * Throw all entries away.
 */
SymbolDB.prototype.clean = function() {
	this.symbols = [];
}


/**
 * Delete a specific symbol
 **/
SymbolDB.prototype.delete = function(name) {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][0] == name ) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}

/**
 * Set the type of the given symbol
 */
SymbolDB.prototype.setType = function(name,type) {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][0] == name ) {
			this.symbols[i][1] = type;
		}
	}
}


SymbolDB.prototype.deleteVariables = function() {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.VAR_SYMBOL ) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}

SymbolDB.prototype.deleteParameters = function() {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.PAR_SYMBOL ) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}

SymbolDB.prototype.deleteFunctions = function() {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.FUN_SYMBOL) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}

SymbolDB.prototype.deleteISRs = function() {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.ISR_SYMBOL ) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}

SymbolDB.prototype.deleteDevices = function() {
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.DEV_SYMBOL ) {
			this.symbols[i] = this.symbols[this.symbols.length-1];
			i--;
			this.symbols.pop();
		}
	}
}


/**
 * Add a new Variable, if name is unique
 */
SymbolDB.prototype.addVariable = function(name,type,parameter,comment) {
	if ( this._exists(name) == null ) {
		if ( comment == "" ) comment = null;
		this.symbols.push([name,type,null, ((parameter==true) ? this.PAR_SYMBOL : this.VAR_SYMBOL) , comment]);
	}
}

/**
 * Add a new Array, if name is unique
 */
SymbolDB.prototype.addArray = function(name,type,lens,parameter,comment) {
	if ( this._exists(name) == null ) {
		if ( comment == "" ) comment = null;
		this.symbols.push([name,type,lens, ((parameter==true) ? this.PAR_SYMBOL : this.VAR_SYMBOL), comment ]);
	}
}

/**
 * Add a new Function, if name is unique
 */
SymbolDB.prototype.addFunction = function(name,type,comment) {
	if ( this.exists(name) == null ) {
		if ( comment == "" ) comment = null;
		this.symbols.push([name,type,null, this.FUN_SYMBOL, comment]);
	}
}

/**
 * Add a new Device, if name is unique
 */
SymbolDB.prototype.addDevice = function(name,device,comment) {
	if ( this.exists(name) == null ) {
		if ( comment == "" ) comment = null;
		this.symbols.push([name,device,null, this.DEV_SYMBOL, comment]);
	}
}

/**
 * Add a new Function, if name is unique
 */
SymbolDB.prototype.addISR = function(name,comment) {
	if ( this.exists(name) == null ) {
		if ( comment == "" ) comment = null;
		this.symbols.push([name,"VOID",null,this.ISR_SYMBOL, comment]);
	}
}


/**
 * Returns all symbols
 */
SymbolDB.prototype.getSymbols = function() {
	var result = [];
	for ( var i = 0; i < this.symbols.length; i++ ) {
		result.push(this.symbols[i]);
	}

	return result;
}


/**
 * Returns the symbol with the given name
 **/
SymbolDB.prototype.getSymbol = function(name) {
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if ( this.symbols[i][0] == name )
			return this.symbols[i];
	}

	return null;
}

/**
 * Returns an array containing all symbol entries describing variables (includign parameters).
 */
SymbolDB.prototype.getVariables = function(local) {
	var result = [];
	
	if  ( (local==false) && this.parentDB ) {
		result = this.parentDB._getVariables();
	}
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if ( this.symbols[i][3] == this.VAR_SYMBOL ) {
			// Abbozza.log(this.symbols[i]);
			result.push(this.symbols[i]);
		}
	}

	return result;
}


/**
 * Returns an array containing all symbol entries describing variables (includign parameters).
 */
SymbolDB.prototype.getParameters = function(local) {
	var result = [];
	
	if  ( !local && this.parentDB ) {
		result = this.parentDB._getVariables();
	}
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if ( this.symbols[i][3] == this.PAR_SYMBOL ) {
			result.push(this.symbols[i]);
		}
	}
	
	return result;
}


/**
 * Returns an array containing all symbol entries describing functions.
 */
SymbolDB.prototype.getFunctions = function() {
	var result = [];
	
	if  ( this.parentDB ) {
		result = this.parentDB._getVariables();
	}
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if ((this.symbols[i][3] == this.FUN_SYMBOL) || (this.symbols[i][3] == this.ISR_SYMBOL)) {
			result.push(this.symbols[i]);
		}
	}
	
	return result;
}


/**
 * Returns an array containing all symbol entries describing functions.
 */
SymbolDB.prototype.getISRs = function() {
	var result = [];
	
	if  ( this.parentDB ) {
		result = this.parentDB._getVariables();
	}
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if ((this.symbols[i][3] == this.ISR_SYMBOL)) {
			result.push(this.symbols[i]);
		}
	}
	
	return result;
}


/**
 * Returns an array containing all symbols describing a device
 */
SymbolDB.prototype.getDevices = function() {
	var result = [];
	
	if  ( this.parentDB ) {
		result = this.parentDB.getDevices();
	}
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		if (this.symbols[i][3] == this.DEV_SYMBOL) {
			result.push(this.symbols[i]);
		}
	}
	
	return result;
}
 
 
/**
 * Append a number, if required
 */
SymbolDB.prototype.getLegalName = function(name) {
	var neuname;
	var no;
	if ( ReservedWords.check(name) ) name = name + "0";
	
        name = name.replace(/ä/g,"ae");
        name = name.replace(/ö/g,"oe");
        name = name.replace(/ü/g,"ue");
        name = name.replace(/Ä/g,"Ae");
        name = name.replace(/Ö/g,"Oe");
        name = name.replace(/Ü/g,"Ue");
        name = name.replace(/ß/g,"ss");

    if ( this._exists(name) ) {
		no = 0;
		neuname = name + no;
		while ( this._exists(neuname) ) {
			no = no+1;
			neuname = name+no;
		}
		name = neuname;
	}

	return name;
}


SymbolDB.prototype.variablesAsString = function() {
	var result = "";
	for (var i = 0; i < this.symbols.length; i++ ) {	
		if ( this.symbols[i][3] == this.VAR_SYMBOL ) {
			result = result +" " + this.symbols[i][0];
		}
	}
	return result;
};


SymbolDB.prototype.toDOM = function() {
	var entry = null;
	var container = document.createElement('symbols');
	var child;
	for ( var i = 0; i < this.symbols.length; i ++) {
		entry = this.symbols[i];
		child = document.createElement('symbol');
		child.setAttribute('name', entry[0]);
		child.setAttribute('type', entry[1]);
		if ( entry[2] != null ) {
			child.setAttribute('len', Abbozza.lenAsString(entry[2]));
		}
		child.setAttribute('symboltype', entry[3]);
		if ( (entry[4] != null) && (entry[4] != "") ) {
			var comment = document.createElement('comment');
			comment.appendChild(document.createTextNode(entry[4]));
			child.appendChild(comment);
		}
		container.appendChild(child);
	}
	return container;
};


SymbolDB.prototype.fromDOM = function (xml) {
	var child;
	var entry;
	this.symbols = [];
        var children = xml.getElementsByTagName("symbol");
	for ( var i = 0; i < children.length; i++ ) {
		child = children[i];
		var name = child.getAttribute('name');
		var type = child.getAttribute('type');
		var symboltype = child.getAttribute('symboltype');
		var len;
		var subsymbols;
		var comment;
		for ( var j= 0; j < child.childNodes.length; j++) {
			var subchild = child.childNodes[j];
			if ( subChild.tagName == "comment") {
				comment = comment + "\n" + child.childNodes[j].nodeValue;
			}
		}
		if ( symboltype != this.FUN_SYMBOL ) {
			len = Abbozza.lenFromString(child.getAttribute('len'));
		} else {
			len = null;
		}
		entry = [name,type,len,symboltype,comment];
		this.symbols.push(entry);
	}
}


SymbolDB.prototype.toString = function() {
	var result = "";
	
	if ( this.parentDB != null ) {
		result = result + this.parentDB.toString(name);
		result = result + "----- " + _("LOCALVARS")+" -----\n";
	} else {
		result = "----- " + _("GLOBALVARS")+" -----\n";
	}

	for ( var i = 0; i < this.symbols.length; i++ ) {
		var entry = this.symbols[i];
		if ( entry[3] != this.FUN_SYMBOL ) {
			result = result + _(entry[1]) + " " + entry[0] + Abbozza.lenAsString(entry[2]);
			if ( entry[3] == this.PAR_SYMBOL ) result = result + " (Parameter)";
			result = result + "\n";
		}
	}

	return result;
}


SymbolDB.prototype.getVarMenu = function(suffix) {        
	var menu = [];
        
        if (!this.symbols) return [];
        
	for ( var i = 0; i < this.symbols.length; i++ ) {
		var entry = this.symbols[i];
		if ( (entry[3] != this.FUN_SYMBOL) && (entry[3] != this.ISR_SYMBOL) ) {
			result = entry[0]; // + Abbozza.lenAsEmptyString(entry[2]);
			menu.push([result + suffix,result]);
		}
	}

	if ( this.parentDB != null ) {
		menu = menu.concat(this.parentDB.getVarMenu(" ("+_("var.GLOBAL")+ ")"));
	}
	if ((menu.length == 0) && ( suffix=="")) return [[_("<name>"),_("<name>")]];
	return menu;
}

SymbolDB.prototype.getVarTypedMenu = function(type,suffix) {
	var menu = [];
	
	for ( var i = 0; i < this.symbols.length; i++ ) {
		var entry = this.symbols[i];
		if ( (entry[3] != this.FUN_SYMBOL) && (entry[3] != this.ISR_SYMBOL) && (entry[1] == type) && (entry[2] == null) ) {
			result = entry[0]; // + Abbozza.lenAsEmptyString(entry[2]);
			menu.push([result + " " + suffix,result]);
		}
	}

	if ( this.parentDB != null ) {
		menu = menu.concat(this.parentDB.getVarTypedMenu(type,"("+_("var.GLOBAL")+")"));
	}
	if ((menu.length == 0) && ( suffix=="")) return [[_("<name>"),_("<name>")]];
	return menu;
}


SymbolDB.prototype.getFuncMenu = function() {
	var menu = [];
	
	if ( this.parentDB != null ) {
		menu = this.parentDB.getFuncMenu();
	}
	for ( var i = 0; i < this.symbols.length; i++ ) {
            var entry = this.symbols[i];
            if ( ((entry[3] == this.FUN_SYMBOL) || (entry[3] == this.ISR_SYMBOL)) && (entry[0] != 'setup') && ( entry[0]!='loop')) {
                result = entry[0]; // + Abbozza.lenAsEmptyString(entry[2]);
		menu.push([result,result]);
            }
	}

	if ( menu.length == 0) return [[_("<name>"),_("<name>")]];
	// console.log(menu);
	return menu;
}

SymbolDB.prototype.getISRMenu = function() {
	var menu = [];
	
	if ( this.parentDB != null ) {
		menu = this.parentDB.getISRMenu();
	}
	for ( var i = 0; i < this.symbols.length; i++ ) {
            var entry = this.symbols[i];
            if ( (entry[3] == this.ISR_SYMBOL) && (entry[0] != 'setup') && ( entry[0]!='loop')) {
                result = entry[0]; // + Abbozza.lenAsEmptyString(entry[2]);
		menu.push([result,result]);
            }
	}

	if ( menu.length == 0) return [[_("<name>"),_("<name>")]];
	// console.log(menu);
	return menu;
}


SymbolDB.prototype.getArrayMenu = function(type) {
	var menu = [];
	
	if ( this.parentDB != null ) {
		menu = this.parentDB.getNumberArrayMenu();
	}
	for ( var i = 0; i < this.symbols.length; i++ ) {
            var entry = this.symbols[i];
            if ( (entry[3] <= this.PAR_SYMBOL) && ( entry[2] != null ) && (entry[1] == type) ) {
                result = entry[0]; // + Abbozza.lenAsEmptyString(entry[2]);
		menu.push([result,result]);
            }
	}

	if ( menu.length == 0) return [[_("<name>"),_("<name>")]];
	// console.log(menu);
	return menu;
}



SymbolDB.prototype.toCode = function(prefix) {
    console.log("SymbolDB.toCode deprecated");
    return "";
}
