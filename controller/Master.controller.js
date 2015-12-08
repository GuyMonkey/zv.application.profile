sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("zv.application.profile.controller.Master", {
		onPressListItem: function(oEvent){
			var oItem = oEvent.getSource();
			console.log(oItem);
			var oItemData = this.getView().getModel("oData").getProperty(oItem.getBindingContext("oData").getPath() + "/ProcessStepSet");
			console.log(oItemData);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			/*
			oRouter.navTo("processdetails", {
				objid: oItemData.Objid
			});
			*/
		}
	});

});