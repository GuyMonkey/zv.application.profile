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
			
			this._loadProfileList();
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
			this._loadObjectData();
			
		},
		// load a profile for an objid
		_loadProfile: function(sProfileId) {
			// odata-read ausführen mit expands
			this.getView().byId("idProfile").setBusy(true);
			this.getOwnerComponent().getModel("oData").read("/ProfileSet(Objtype='"+this._objtype+"',ProfileId='"+sProfileId+"')", {
				"urlParameters": "$expand=PAreaSet,PActionSet,PAreaSet/PAAttributeSet",
				"success": function(oData) {
					this.getView().getModel("ProfileMeta").setData(oData);
					this.getView().byId("idProfile").setBusy(false);
					
			console.log("Build profile!");

			var oDetailPage = this.getView().byId("idProfile");
			oDetailPage.destroyContent();
			
			var oVbox = new sap.m.VBox();
			oDetailPage.addContent(oVbox);
			//oDetailPage.addDependent(oVbox);
			
			
			//oVbox.bindAggregation("items", "ProfileMeta>/PAreaSet/results ", new sap.m.Text({text: "Text"}));
			//oVbox.addItem(new sap.m.Text({text: "Text"}));
			
			
			oVbox.bindAggregation("items", "ProfileMeta>/PAreaSet/results", function(sId, oContext){
				//console.log(oContext);
				return new sap.m.Text({text: "{ProfileData>/OAttributeSet(Objid='" + this._objid + "',Attribute='NAME')/Value}"});
			}.bind(this));
			
			//oVbox.setModel(this.getView().getModel("ProfileMeta"));
			
			//console.log(oVbox);
			console.log("Build profile end!");


					
//					this._buildProfile();
				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			});
		},
		
		_loadObjectData: function(){
			this.getOwnerComponent().getModel("oData").read("/ObjectSet('" + this._objid + "')", {
				"urlParameters": "$expand=OAttributeSet",
				"success": function(oData) {
//					console.log(oData);
					this.getView().getModel("ProfileData").setData(oData);
				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			});
		},
		
		// load list of possible profiles for selected objid
		_loadProfileList: function() {
			this.getOwnerComponent().getModel("oData").read("/ProfileSet", {
				"filters": [
					new sap.ui.model.Filter({
						path: "Objtype",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "OT_COMPANY"
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
		
		_buildProfile: function(){
			console.log("Build profile!");

			var oDetailPage = this.getView().byId("idProfile");
			
			oDetailPage.destroyContent();
			
			var oVbox = new sap.m.VBox();
			oDetailPage.addContent(oVbox);
			oDetailPage.addDependent(oVbox);
			
			
			//oVbox.bindAggregation("items", "ProfileMeta>/PAreaSet/results ", new sap.m.Text({text: "Text"}));
			//oVbox.addItem(new sap.m.Text({text: "Text"}));
			
			oVbox.bindAggregation("items", "ProfileMeta>/PAreaSet/results ", function(sId, oContext){
				console.log("Test");
				return new sap.m.Text({text: "Text"});
			});
			
			console.log("Build profile end!");
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