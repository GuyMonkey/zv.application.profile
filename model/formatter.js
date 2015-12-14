sap.ui.define([], function () {
	"use strict";
		
	return {
		// --------------------------------------------------
		// OTHER
		// --------------------------------------------------
		
		getAttributeValue: function(oData){
			var oAttributeSet = this.getView().getModel("ProfileData").getProperty("/OAttributeSet/results");
			for(var i = 0; i < oAttributeSet.length; i++){
				if(oAttributeSet[i].Attribute === oData){
					return oAttributeSet[i].Value;
				}
			}
		},
		
		getFlatAreaValue: function(oData){
			//return this.convertSMValueText(oData.Value, oData.Type);
			 var sValue = "";
			
//			var oTemp = this.getView().getModel("Profile").getData(); //.getProperty("OPAreaSet");
			var oTemp = this.getView().getModel("ProfileMeta").getProperty("/PAreaSet/results");
//			for (var i = 0, i < oTemp.length, i++) {
//				if (oTemp.getProperty("/0/"))
//			}
			
//			console.log(oTemp);
			sValue = "Wert";
			/*
			if(oData.Type === "DT"){
				if(oData.Value === "00000000"){
					sValue = "";
				}else{
					jQuery.sap.require("sap.ui.core.format.DateFormat");  
					var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({UTC: true});
					sValue = oDateFormat.format(new Date(Date.UTC(oData.Value.slice(0, 4), oData.Value.slice(4, 6) - 1, oData.Value.slice(6, 8))));
				}
			}else if(oData.Type === "CB"){
				if(oData.Value === "X"){
					sValue = "yes";
				}else{
					sValue = "no";
				}
			}else{
				sValue = oData.Value;
			}
			*/
			return sValue;
		},
		
		convertSMValueText: function(sValue, sType){
			return "";
		}
	};
});