sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"zv/application/profile/model/formatter",
	'sap/m/MessageBox'
], function(Controller, formatter, MessageBox) {
	"use strict";

	return Controller.extend("zv.application.profile.controller.Detail", {
		formatter: formatter,

		_objtype: null,					// used objtype
		_objid: null,					// selected object
		_oObjectProfileSet: null,		// oData oProfileSet
		_oProfileSettings: null,		// XMLViewFragment for profile selection

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachPatternMatched(this._onPatternMatched, this);
			this._initDetailsModel();
			this._initProfileSettings();
		},
		_messageError: function(oData){
			console.log(oData);
			
			var oErrorBody = JSON.parse(oData.responseText);
			//MessageToast.show(oErrorBody.error.message.value);
			MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "ERROR");
		},
		
		// create JSON model for details
		_initDetailsModel: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "ProfileData");
			oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "ProfileMeta");
		},
		// after navigation to details
		_onPatternMatched: function(oEvent) {
			this._objid = oEvent.getParameter("arguments").objid;
			this._objtype = oEvent.getParameter("arguments").objtype;
			this._loadProfileList();
		},
		// load a profile for an objid
		_loadProfile: function(sProfileId) {
			// odata-read ausführen mit expands
			this.getView().byId("idProfile").setBusy(true);
			this.getOwnerComponent().getModel("oData").read("/ProfileSet(Objtype='"+this._objtype+"',ProfileId='"+sProfileId+"')", {
				"urlParameters": "$expand=PAreaSet,PActionSet,PAreaSet/PAAttributeSet",
				"success": function(oData) {
					console.log(oData);
					this.getView().getModel("ProfileMeta").setData(oData);
					this.getView().byId("idProfile").setBusy(false);

				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			});
			
/*			this.getOwnerComponent().getModel("oData").read("/ObjectSet('" + this._objid + "')", {
				"urlParameters": "$expand=OProfileSet,OProfileSet/OPActionSet",
				"success": function(oData) {
					this.getView().getModel("ProfileMeta").setData(oData);
					this.getView().byId("idProfile").setBusy(false);

					console.log(oData);
				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			}); */
		},
		// load list of possible profiles for selected objid
		_loadProfileList: function() {
			this.getOwnerComponent().getModel("oData").read("/ProfileSet", {
				"filters": [
					new sap.ui.model.Filter({
						path: "Objtype",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: this._objtype
					})
				],
				"success": function(oData) {
					this._oObjectProfileSet = oData;
					this._loadProfile(oData.results[0].ProfileId);	// load default_profile
				}.bind(this),
				"error": function(oError) {
					this._messageError(oError);
				}.bind(this)
			});
		},
		// build profile selection view fragment
		_initProfileSettings: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this._oProfileSettings = sap.ui.xmlfragment("zv.application.profile.view.ProfileSettings", this);
			this._oProfileSettings.setModel(oModel, "ProfileSet");
			this.getView().addDependent(this._actionSheetTransitions);
		},
		// open profile selection
		onPressSettings: function(oEvent) {
			this._oProfileSettings.getModel("ProfileSet").setData(this._oObjectProfileSet);
			this._oProfileSettings.openBy(oEvent.getSource());
		},
		// load selected profile
		onPressProfileSelect: function(oEvent) {
			var oProfile = oEvent.getSource().getModel("ProfileSet").getProperty(oEvent.getSource().getBindingContext("ProfileSet").getPath());
			this._loadProfile(oProfile.ProfileId);
		}

	});

});