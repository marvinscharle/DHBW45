
sap.ui.core.mvc.Controller.extend("DHBW.view.Master", {
	
	onInit: function() {
		
		var view = this.getView();
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "Detail") { 
				var oList = view.byId("list"),
					aItems = oList.getItems();
				for (var i = 0; i < aItems.length; i++) { 
					if (aItems[i].getBindingContextPath() === "/"  + oEvent.getParameter("arguments").item +"/" +  oEvent.getParameter("arguments").tab) {
						oList.setSelectedItem(aItems[i], true);
						break;
					}
				}
			}
		}, this);
		
		
		
		
	},
	
//	onBeforeRendering: function() {
//
//	},

			
	onAfterRendering: function() {
		var view = this.getView();
		
		var tab = view.byId("list");
		var m = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z_WP_PER_SRV/", true);
		tab.setModel(m);
	},
	
	//Suche
	
	handleSearch: function() {
		/**
		 * TODO: Anpassen des Filters für die Suche
		 */
		var filters = [];
		var searchString = this.getView().byId("searchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [new sap.ui.model.Filter("Suche", sap.ui.model.FilterOperator.Contains, searchString)];
		}
		
		// update list binding
		var list = this.getView().byId("list");
		var binding = list.getBinding("items");
		binding.filter(filters);
	},
	
	handleSelect: function(oEvent) {
		var oListItem = oEvent.getParameter("listItem"); 
		sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail",{from: "master", contextPath: oListItem.getBindingContext().getPath().substr(33, 4)});
	}
});	