sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("zv.application.profile.controller.Master", {

		cObjtype: "OT_COMPANY",

		onPressListItem: function(oEvent) {
			var oItem = oEvent.getSource();
			var oItemData = this.getView().getModel("oData").getProperty( oItem.getBindingContext("oData").getPath());
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", { objtype: oItemData.Objtype,
									  objid: oItemData.Objid });
		},
		onSearch: function(oEvent) {
			var query = oEvent.getParameter("query");
			var filters = [];
			filters.push(new sap.ui.model.Filter("Objtype", sap.ui.model.FilterOperator.EQ, this.cObjtype));
			if (query && query.length > 0) {
				filters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, query));
			}
			this.getView().byId("idSearchList").getBinding("items").filter(filters, sap.ui.model.FilterType.Application);
		}

	});
});