sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"zv/application/profile/model/formatter",
	'sap/m/MessageBox'
], function(Controller, formatter, MessageBox) {
	"use strict";

	return Controller.extend("zv.application.profile.controller.Detail", {
		formatter: formatter,

//		_objtype: null,					// used objtype
		_oObjectProfileSet: null,		// oData oProfileSet
		_oProfileSettings: null,		// XMLViewFragment for profile selection


		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachPatternMatched(this._onPatternMatched, this);
			
			this._initObjectDataModel();
			
			this._initProfileSettings();
			this._loadProfileList();

		},
		
		_onPatternMatched: function(oEvent) {
			//this._objtype = oEvent.getParameter("arguments").objtype;
			this._loadObjectData(oEvent.getParameter("arguments").objid);
		},
		
		_loadObjectData: function(sObjid){
			this.getView().byId("idProfile").setBusy(true);
			
			this.getOwnerComponent().getModel("oData").read("/ObjectSet('" + sObjid + "')", {
				"urlParameters": "$expand=OAttributeSet,OSubSet,OSubSet/OSAttributeSet",
				"success": function(oData) {
					//console.log(oData);
					
					// OBJECT HEADER
					this.getView().getModel("ObjectData").setProperty("/Objid", oData.Objid);
					this.getView().getModel("ObjectData").setProperty("/Objtype", oData.Objtype);
					this.getView().getModel("ObjectData").setProperty("/ExternalKey", oData.ExternalKey);
					this.getView().getModel("ObjectData").setProperty("/Name", oData.Name);
					this.getView().getModel("ObjectData").setProperty("/Visible", false);
					
					// OBJECT ATTRIBUTES
					var oAttributes = {};
					for(var i = 0; i < oData.OAttributeSet.results.length; i++){
						oAttributes[oData.OAttributeSet.results[i].Attribute] = oData.OAttributeSet.results[i].Value;
					}
					this.getView().getModel("ObjectData").setProperty("/Attributes", oAttributes);
					
					// OBJECT SUBOBJECTS (WITH ATTRIBUTES)
					var oLists = {};
					for(var j = 0; j < oData.OSubSet.results.length; j++){
						if(!oLists[oData.OSubSet.results[j].Type]){
							oLists[oData.OSubSet.results[j].Type] = [];
						}
						
						var oSAttributes = {};
						for(var k = 0; k < oData.OSubSet.results[j].OSAttributeSet.results.length; k++){
							oSAttributes[oData.OSubSet.results[j].OSAttributeSet.results[k].Attribute] = oData.OSubSet.results[j].OSAttributeSet.results[k].Value;
						}
						oLists[oData.OSubSet.results[j].Type].push(oSAttributes);
					}
					this.getView().getModel("ObjectData").setProperty("/Lists", oLists);
					
					this.getView().byId("idProfile").setBusy(false);
					//console.log(this.getView().getModel("ObjectData").getData());
				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			});
		},
		
		_loadObjectProfile: function(sProfileId){
			this.getOwnerComponent().getModel("oData").read("/ProfileSet(Objtype='OT_COMPANY',ProfileId='" + sProfileId + "')", {
				"urlParameters": "$expand=PAreaSet,PActionSet,PAreaSet/PAAttributeSet",
				"success": function(oData) {
					this._buildProfile(oData);
				}.bind(this),
				"error": function(oError) {
					this.getView().byId("idProfile").setBusy(false);
					this._messageError(oError);
				}.bind(this)
			});
		},
		
		_buildProfile: function(oProfile){
			var oDetailPage = this.getView().byId("idProfile");
			oDetailPage.destroyContent();
			oDetailPage.setTitle(oProfile.ProfileText);
			
			oDetailPage.addContent(new sap.m.ObjectHeader({
				title: "{ObjectData>/Name}",
				number: "{ObjectData>/ExternalKey}",
				attributes: [
					new sap.m.ObjectAttribute({ title: "Objid", text: "{ObjectData>/Objid}" }),
					new sap.m.ObjectAttribute({ title: "Objtype", text: "{ObjectData>/Objtype}" })
				]
			}));
			
			for(var i = 0; i < oProfile.PAreaSet.results.length; i++){
				var oProfileArea = oProfile.PAreaSet.results[i];
				
				if(oProfileArea.ProfileAreaType){
					var oContent = null;
					var sVisible = true;
					
					if(oProfileArea.IsTable === false){
						var oGrid = new sap.ui.layout.Grid({
							defaultSpan: "XL12 L12 M12 S12",
							defaultIndent: "XL0 L0 M0 S0",
							hSpacing: 0,
							position: "Left"
						});
						
						for(var j = 0; j < oProfileArea.PAAttributeSet.results.length; j++){
							oGrid.addContent(
								new sap.m.Text({
									text: oProfileArea.PAAttributeSet.results[j].Text + ":"
								}).setLayoutData(new sap.ui.layout.GridData({ span: "XL3 L3 M6 S12" }))
							);
							
							oGrid.addContent(
								new sap.m.Text({
									text: "{ObjectData>/Attributes/" + oProfileArea.PAAttributeSet.results[j].Attribute + "}"
								}).setLayoutData(new sap.ui.layout.GridData({ span: "XL3 L3 M6 S12" }))
							);
						}
						oContent = oGrid;
						
						
						/*
						var oVboxTmp = new sap.m.VBox(); // Should be grid in future ...
						for(var j = 0; j < oProfileArea.PAAttributeSet.results.length; j++){
							oVboxTmp.addItem(new sap.m.Text({ text: oProfileArea.PAAttributeSet.results[j].Text + ": {ObjectData>/Attributes/" + oProfileArea.PAAttributeSet.results[j].Attribute + "}" }));
						}
						oContent = oVboxTmp;
						*/
					}else{
						var aColumns = [];
						var aCells = [];
						
						sVisible = "{= ${ObjectData>/Lists/" + oProfileArea.ProfileAreaType + "} ? true : false }";
						
						for(var k = 0; k < oProfileArea.PAAttributeSet.results.length; k++){
							var oAttribute = oProfileArea.PAAttributeSet.results[k];
							aColumns.push(new sap.m.Column({ header: new sap.m.Label({text: oAttribute.Text})}));
							aCells.push(new sap.m.Text({ text: "{ObjectData>" + oAttribute.Attribute + "}" }));
						}
						
						var oTable = new sap.m.Table({columns: aColumns});
						oTable.bindItems("ObjectData>/Lists/" + oProfileArea.ProfileAreaType, new sap.m.ColumnListItem({
							cells : aCells
						}));
						oContent = oTable;
					}
					
					oDetailPage.addContent(new sap.m.Panel({
						headerText: oProfileArea.AreaText,
						content: [ oContent ],
						visible: sVisible,
						width: "auto"
					}).addStyleClass("sapUiResponsiveMargin"));
				}
			}
		},

		_messageError: function(oData){
			var oErrorBody = JSON.parse(oData.responseText);
			MessageBox.show(oErrorBody.error.message.value, sap.m.MessageBox.Icon.ERROR, "ERROR");
		},
		
		_initObjectDataModel: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "ObjectData");
		},

		_initProfileSettings: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this._oProfileSettings = sap.ui.xmlfragment("zv.application.profile.view.ProfileSettings", this);
			this._oProfileSettings.setModel(oModel, "ProfileSet");
			this.getView().addDependent(this._actionSheetTransitions);
		},

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
					this._loadObjectProfile(oData.results[0].ProfileId);	// load default_profile
				}.bind(this),
				"error": function(oError) {
					this._messageError(oError);
				}.bind(this)
			});
		},

		onPressSettings: function(oEvent) {
			this._oProfileSettings.getModel("ProfileSet").setData(this._oObjectProfileSet);
			this._oProfileSettings.openBy(oEvent.getSource());
		},

		onPressProfileSelect: function(oEvent) {
			var oProfile = oEvent.getSource().getModel("ProfileSet").getProperty(oEvent.getSource().getBindingContext("ProfileSet").getPath());
			this._loadObjectProfile(oProfile.ProfileId);
		}
		
	});
});