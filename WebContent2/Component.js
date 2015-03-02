jQuery.sap.declare("DHBW.Component");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("sap.ui.model.odata.datajs");
jQuery.sap.require("sap.m.MessageBox");


sap.ui.core.UIComponent.extend("DHBW.Component", {
	metadata : {
		"name" : "DHBW",
		"version" : "1.0",
		"library" : "DHBW",
		"includes" : ["script/icalendar.css", "script/fullcalendar.css"],
		"dependencies" : {
			"libs" : ["sap.m", "sap.me", "sap.ushell"],
			"components" : []
		},

		"config" : {
			"resourceBundle" : "i18n/messageBundle.properties",
			"titleResource" : "Zeitkorrektur Manager",
			
			"serviceConfig" : {
				name: "MOBILE_QM_SRV",
				// serviceUrl: http://campus.sap.itulm.lan:50000/sap/opu/odata/sap/Z_SAPUI5_TEMPLATE_SRV/	
				//http://campus.sap.itulm.lan:50000/sap/opu/odata/sap/Z_TEST_WAHL_SRV/KDList_Collection
				/**
				 * TODO: Link zum OData Service ändern
				 */
				serviceUrl: "/sap/opu/odata/SAP/Z_WP_SRV"
			}
		},

		routing: {
			config: {
				viewType : "XML",
				viewPath: "DHBW.view",  // common prefix
				targetAggregation: "detailPages",
				clearTarget: false
			},
			routes:
				[{
					name : "Master",
					view : "Master",
					targetAggregation : "masterPages",
					targetControl: "fioriContent",
					subroutes : [
									{
										pattern : "Detail/{contextPath}", // will be the url and from has to be provided in the data
										view : "Detail",
										name : "Detail" // name used for listening or navigating to this route
									},
									{
										pattern : ":all*:", // catchall
										view : "Empty",
										name : "catchall", // name used for listening or navigating to this route
									}
								]
				}]
		}
	},

	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());
		this.getRouter().initialize();
		var rootPath = jQuery.sap.getModulePath("DHBW");

		// Laden der Sprachdateien
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : rootPath + "/i18n/messageBundle.properties"
		});
		this.setModel(i18nModel, "i18n");
		
		
		var oServiceConfig = this.getMetadata().getConfig()["serviceConfig"];
		
		// Anbindung des OData Services	    
	    var sServiceUrl = oServiceConfig.serviceUrl;
		var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		  var oModel = new sap.ui.model.json.JSONModel();
          // Load JSON in model
             oModel.loadData("model/data.json");
		this.setModel(m);
		

		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : jQuery.device.is.phone,
			isNoPhone : !jQuery.device.is.phone,
			listMode : (jQuery.device.is.phone) ? "None" : "SingleSelectMaster",
					listItemType : (jQuery.device.is.phone) ? "Active" : "Inactive"
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");
	},

	/**
	 *  
	 */
	createContent : function() {
		var oViewData = {
				component : this
		};
		return sap.ui.view({
			viewName : "DHBW.view.App",
			type : sap.ui.core.mvc.ViewType.XML,
			viewData : oViewData
		});
	
	
	
	}
	
	
});

