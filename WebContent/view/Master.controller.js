
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
	
	handleSearch: function(oEvt) {
		var sQuery = oEvt.getSource().getValue().toLowerCase();

		$.each($('#__xmlview1--list').find('li'), function (i, element) {
			var number = $(element).find('.sapMObjLNumber')[0];
			if (!number) {
				number = '';
			} else {
				number = number.innerText;
			}

			var name = $(element).find('.sapMTextLineClamp')[0];
			if (!name) {
				name = '';
			} else {
				name = name.innerText.toLowerCase();
			}

			if (sQuery == '') {
				// Suche leer -> alle Elemente anzeigen
				$(element).css("display", "block");
				return;
			}

			if (number.indexOf(sQuery) > -1 || name.indexOf(sQuery) > -1) {
				// String gefunden -> Element zeigen
				$(element).css('display', 'block');
			}
			else {
				$(element).css('display', 'none');
			}
		});

		/* Suche serverseitig, falls irgendwann einsatzfähig var aFilters = [];
		var sQuery = oEvt.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			var filter = new sap.ui.model.Filter("Nname", sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}
		
		// update list binding
		var list = this.getView().byId("list");
		var binding = list.getBinding("items");
		binding.filter(aFilters, "Application");*/
	},
	
	handleSelect: function(oEvent) {
		var oListItem = oEvent.getParameter("listItem"); 
		sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail",{from: "master", contextPath: oListItem.getBindingContext().getPath().substr(33, 4)});
	}
});	