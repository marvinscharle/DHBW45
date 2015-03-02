jQuery.sap.declare("DHBW.formatter.formatter");

DHBW.formatter.formatter = {
		
		Zeit: function(fValue) {
		try {
			var ret = new Date(fValue.ms);
			
//			ret = ret.toLocaleString();
//			ret = ret.substr(0, (ret.length - 8));
			
			return ret;
			
		} catch (err){ return "None"; 
		
		console.log("Fehler");
		}
		
	
		
	},
		
	Termin: function(fValue) {
		try {
			var ret = new Date(fValue);
			var hilf = ret.toLocaleDateString();
			return hilf;
			
		} catch (err){ return "None"; 
		
		console.log("Fehler");
		}
		
	
		
	},
	
	
	Logtime: function(fValue) {
		try {
			var ret = new Date();
			ret = fValue;
			ret = new Date(ret.ms).toGMTString();
			
			ret = ret.substr(17,5);
			
			
			return ret;
			
		} catch (err){ return "None"; }
		
		

		
	},		
		
	Teventtype: function(fValue) {
		try {
			
			var ret = fValue;
			if (ret == 'P10'){ret = 'Kommen';}
			else{ret = 'Gehen';}
			
			return ret;
			
		} catch (err){ return "None"; }
		
		

		
	}		
	
	
	
	
};