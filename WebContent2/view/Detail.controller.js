jQuery.sap.require('DHBW.formatter.formatter');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-resizable');

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');



jQuery.sap.require('DHBW.script.jquery-touch-punch');
jQuery.sap.require('DHBW.script.moment');
jQuery.sap.require('DHBW.script.FileSaver');
jQuery.sap.require('DHBW.script.Blob');
jQuery.sap.require('DHBW.script.ics');
jQuery.sap.require('DHBW.script.fullcalendar');
jQuery.sap.require('DHBW.script.html2canvas');


sap.ui.controller("DHBW.view.Detail", {


  onInit: function () {
	  	  
	  this.id = "";
	  var that = this;
	  sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) { 
		  if(oEvent.getParameter("name") == "Detail"){
			  try{
				  var hohe = $(window).height();
				  hohe = hohe * 0.58;
				  this.getView().byId("idTable").setVisible(true);
				  $('#calendar').fullCalendar('option', 'height', hohe);
			  
			  }catch(e){}
			  		//Binding aktualisieren wenn nötig
			  var tab =this.getView().byId("idTable");
			  var bind = tab.getBinding("items");
			  if (typeof(bind)!="undefined"){
			  bind.filter([ new sap.ui.model.Filter("Perno",
						sap.ui.model.FilterOperator.EQ,  oEvent.getParameters().arguments.contextPath) ]);
				//
			  }
				
				window.id = oEvent.getParameters().arguments.contextPath;
				window.view = this.getView();
				window.filter = false;
				$('#calendar').fullCalendar( 'removeEvents');
				  this.name = "";
				  that = this;
	this.perwechsel();
						}
		  
	  },this);  
	  
	  var table = this.getView().byId("idTable");
	  table.attachUpdateFinished(function(){
		  
		//Pernr als Filter nehmen
		  if (window.filter == false){
		  //var list = this.getView().byId("idTable");
			var binding = this.getBinding("items");
			
				binding.filter([ new sap.ui.model.Filter("Perno",
						sap.ui.model.FilterOperator.EQ, window.id) ]);
				window.filter = true;
		  }
		  
		 //Sind im context der Tabelle
			var items = this.getItems();
			var events = $('#calendar').fullCalendar( 'clientEvents');
			var da = false;
			for(var index = 0; index < items.length; index++){
				
				if(this.getItems()[index].getCells()[8].getText() != ""){
					for(var z = 0; z < events.length; z++){
						if(events[z].title == this.getItems()[index].getCells()[0].getText()){
							da = true;
						}
					}
					
						if(da != true){
					this.getItems()[index].setVisible(false);
					var start = new Date(this.getItems()[index].getCells()[8].getText());
					var end = new Date(this.getItems()[index].getCells()[9].getText());
					var suzeit = new Date(this.getItems()[index].getCells()[10].getText());
					var euzeit = new Date(this.getItems()[index].getCells()[11].getText());
					
					start.setMinutes(suzeit.getMinutes());
					start.setHours(suzeit.getHours());
					
					end.setMinutes(euzeit.getMinutes());
					end.setHours(euzeit.getHours());
					
					
					var eventData = {
							title: this.getItems()[index].getCells()[0].getText(),
							start: start,
							end: end,
							color: "green"
						};
					
					$('#calendar').fullCalendar('renderEvent', eventData, true);
					da = false;
					}
			}
				
	    		var element = items[index];
	    		(function(element){
		    		element.addEventDelegate({onmousedown: function(){
		                mouseState = setTimeout(		        		
		    	            function () {
	    	                	$("#"+element.sId).draggable({
	    	                		appendTo: 'body',
	    	    					helper: 'clone',
	    	    					cursor: 'move',
	    	    					revert: 'invalid',
	    	                		start: function(event, ui){
	    	    						ui.helper.width($("#"+element.sId).width());
	    	    						$("#box_assign").css("visibility","visible");
	    	    						$("#box_delete").css("visibility","visible");
	    	    				    },
	    	                		stop: function() {
	    	                			element.removeStyleClass("sapMLIBSelected");
	    	                			$("#box_assign").css("visibility","hidden");
	    	                			$("#box_delete").css("visibility","hidden");
	    	                		}
	    	                	});
	    	                    element.addStyleClass("sapMLIBSelected");
		    	            }, 600
		                );
		    		}});
	    		})(element);		  
	  }});	  
  },
  
  perwechsel:function(){
	var tab = this.getView().byId("idTable");  
  },
  onAfterRendering: function(){
	  
	  
	  //Kalender
	  //jQuery.sap.require('DHBW.script.demo');
		var year = new Date().getFullYear();
		var month = new Date().getMonth();
		var day = new Date().getDate();
var hohe = $(window).height();
hohe = hohe * 0.58;
	
		$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			selectable: true,
			editable: true,
			titleFormat: "D. MMM YYYY",
			axisFormat: 'H(:mm)',
			columnFormat: 'ddd DD.MM',
			timeFormat: 'H(:mm)',
			allDaySlot: false,
			firstDay: 1,
			dayNamesShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
			defaultView: "agendaWeek",
			monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
			             'August', 'September', 'Oktober', 'November', 'Dezember'],
			height: hohe,
			buttonText:{
			    today:    'Heute',
			    month:    'Monat',
			    week:     'Woche',
			    day:      'Tag'
			},
			droppable: true, // this allows things to be dropped onto the calendar
			windowResize: function(){
				var hohe = $(window).height() * 0.58;
				$('#calendar').fullCalendar('option', 'height', hohe);
				 
			},
			eventClick: function(event, jsEvent, view){
				sap.m.MessageBox.show("Wollen Sie die Einplanung des Auftrags wirklich löschen?",
						sap.m.MessageBox.Icon.WARNING, "Achtung",
						[ sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO  ], jQuery.proxy(
								function(sAction) {
									if ("YES" === sAction) {

									
				var id= event._id;
				model = window.view.getModel();
				model.remove(  "/AuftragSet('" + event.title +"')", "", function(e,f){
					console.log("Erfolg");
				},function(e,f){
					console.log("Fail");
				}
				);
			var tab = window.view.byId("idTable");
var items = tab.getItems();
			
			for(var index = 0; index < items.length; index++){
			if (tab.getItems()[index].getCells()[0].getText() == id){
				tab.getItems()[index].getCells()[0].setVisible(true);
			}
			}
				$('#calendar').fullCalendar('removeEvents', id);
									}
								}, this));
			},
			businessHours: {
			    start: '10:00', // a start time (10am in this example)
			    end: '18:00', // an end time (6pm in this example)

			    dow: [ 1, 2, 3, 4, 5 ]
			    // days of week. an array of zero-based day of week integers (0=Sunday)
			    // (Monday-Thursday in this example)
			},
			eventDrop: function(event){
//ODATA aktualisieren
				
				
				// Datum bestimmen und umformatieren
				
				var hilf_tag = "";
				if (event.end.date() < 10) {
					hilf_tag = "0" + event.end.date().toFixed(0);
				}else{
					hilf_tag =  event.end.date();
				}
				
				var hilf_monat = "";
				
				if ((event.end.month() + 1) < 10) {
					hilf_monat = "0" + ((event.end.month() + 1 ).toFixed(0));
				}else{
					hilf_monat =  (event.end.month() + 1);
				}
				
				
				var endtag =event.end.year().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (event.end.hours().length < 2) {
					hilf_stunde = "0" + event.end.hours().toFixed(0);
				}else{
					hilf_stunde =  event.end.hours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (event.end.minutes() < 10) {
					hilf_minute = "0" + event.end.minutes().toFixed(0);
				}else{
					hilf_minute =  event.end.minutes();
				}
				
				var hilf_sekunde = "";

				if (event.end.seconds() < 10) {
					hilf_sekunde = "0" + event.end.seconds().toFixed(0);
				}else{
					hilf_sekunde =  event.end.seconds();
				}
				var endzeit = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
				
				var hilf_tag = "";
				if (event.start.date() < 10) {
					hilf_tag = "0" + event.start.date().toFixed(0);
				}else{
					hilf_tag =  event.start.date();
				}
				
				var hilf_monat = "";
				
				if ((event.start.month() + 1) < 10) {
					hilf_monat = "0" + ((event.start.month() + 1).toFixed(0));
				}else{
					hilf_monat =  (event.start.month() + 1);
				}
				
				
				var starttag =event.start.year().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (event.start.hours().length < 2) {
					hilf_stunde = "0" + event.start.hours().toFixed(0);
				}else{
					hilf_stunde =  event.start.hours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (event.start.minutes() < 10) {
					hilf_minute = "0" + event.start.minutes().toFixed(0);
				}else{
					hilf_minute =  event.start.minutes();
				}
				
				var hilf_sekunde = "";

				if (event.start.seconds() < 10) {
					hilf_sekunde = "0" + event.start.seconds().toFixed(0);
				}else{
					hilf_sekunde =  event.start.seconds();
				}
				var startzeit = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
								
				window.data ={
						Aufnr: event.title,
								Pernr: window.id,
									Sdate: starttag,
											Suzeit: startzeit,
												Edate: endtag,
												Euzeit: endzeit
													
							
				};
				
				
				
				//Post
				$.ajax({
					type: 'GET',
					url: "/sap/opu/odata/SAP/Z_WP_SRV",
					headers: {
							"X-Requested-With": "XMLHttpRequest",
					                "Content-Type": "application/atom+xml",
					                "DataServiceVersion": "2.0",      
					                "X-CSRF-Token":"Fetch" 
						 }
					}).fail(function(data){ 
						
						
					}).done(function (data, status, headers){
						var data = window.data;
							var record = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">'+
								'<atom:id>tag:com.sap,2010-06-24:/subscriptions/123</atom:id>'+
								'<atom:title>Create new user</atom:title><atom:author/>'+
								'<atom:updated/>'+
								'<atom:content type="application/xml">'+
								'<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">'+
										'<d:Aufnr m:type="Edm.String">' + data.Aufnr + '</d:Aufnr>'+
										'<d:Pernr m:type="Edm.String">' + data.Pernr + '</d:Pernr>'+
								        '<d:Sdate m:type="Edm.DateTime">' + data.Sdate + '</d:Sdate>'+
										'<d:Edate m:type="Edm.DateTime">' + data.Edate + '</d:Edate>'+
										'<d:Euzeit m:type="Edm.Time">' + data.Euzeit + '</d:Euzeit>'+
										'<d:Suzeit m:type="Edm.Time">' + data.Suzeit + '</d:Suzeit>'+
									'</m:properties>'+
								'</atom:content>'+	
							'</atom:entry>';
							
							$.ajax({
							type: 'PUT',
							url: "/sap/opu/odata/SAP/Z_WP_SRV/AuftragSet('"+data.Aufnr+"')",
							headers: {
							    "X-CSRF-Token": headers.getResponseHeader('X-CSRF-Token'),
					                    "Content-Type": "application/atom+xml"
							},	
							data: record
							}).done(function(data){
							
					console.log("Post erfolgreich");
								
								
							}).fail(function(data){ 
																	
								console.log("Post Fehler!");
								
							});	
						});
			},
			eventResize: function(event){
//ODATA aktualisieren
				
				
				// Datum bestimmen und umformatieren
				
				var hilf_tag = "";
				if (event.end.date() < 10) {
					hilf_tag = "0" + event.end.date().toFixed(0);
				}else{
					hilf_tag =  event.end.date();
				}
				
				var hilf_monat = "";
				
				if ((event.end.month() + 1) < 10) {
					hilf_monat = "0" + ((event.end.month() + 1).toFixed(0));
				}else{
					hilf_monat =  (event.end.month() + 1);
				}
				
				
				var endtag =event.end.year().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (event.end.hours().length < 2) {
					hilf_stunde = "0" + event.end.hours().toFixed(0);
				}else{
					hilf_stunde =  event.end.hours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (event.end.minutes() < 10) {
					hilf_minute = "0" + event.end.minutes().toFixed(0);
				}else{
					hilf_minute =  event.end.minutes();
				}
				
				var hilf_sekunde = "";

				if (event.end.seconds() < 10) {
					hilf_sekunde = "0" + event.end.seconds().toFixed(0);
				}else{
					hilf_sekunde =  event.end.seconds();
				}
				var endzeit = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
				
				var hilf_tag = "";
				if (event.start.date() < 10) {
					hilf_tag = "0" + event.start.date().toFixed(0);
				}else{
					hilf_tag =  event.start.date();
				}
				
				var hilf_monat = "";
				
				if ((event.start.month() + 1) < 10) {
					hilf_monat = "0" + (event.start.month() + 1).toFixed(0);
				}else{
					hilf_monat =  (event.start.month() + 1);
				}
				
				
				var starttag =event.start.year().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (event.start.hours().length < 2) {
					hilf_stunde = "0" + event.start.hours().toFixed(0);
				}else{
					hilf_stunde =  event.start.hours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (event.start.minutes() < 10) {
					hilf_minute = "0" + event.start.minutes().toFixed(0);
				}else{
					hilf_minute =  event.start.minutes();
				}
				
				var hilf_sekunde = "";

				if (event.start.seconds() < 10) {
					hilf_sekunde = "0" + event.start.seconds().toFixed(0);
				}else{
					hilf_sekunde =  event.start.seconds();
				}
				var startzeit = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
				
				
				window.data ={
						Aufnr: event.title,
								Pernr: window.id,
									Sdate: starttag,
											Suzeit: startzeit,
												Edate: endtag,
												Euzeit: endzeit
													
							
				};
				
				
				
				//Post
				$.ajax({
					type: 'GET',
					url: "/sap/opu/odata/SAP/Z_WP_SRV",
					headers: {
							"X-Requested-With": "XMLHttpRequest",
					                "Content-Type": "application/atom+xml",
					                "DataServiceVersion": "2.0",      
					                "X-CSRF-Token":"Fetch" 
						 }
					}).fail(function(data){ 
						
						
					}).done(function (data, status, headers){
						var data = window.data;
							var record = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">'+
								'<atom:id>tag:com.sap,2010-06-24:/subscriptions/123</atom:id>'+
								'<atom:title>Create new user</atom:title><atom:author/>'+
								'<atom:updated/>'+
								'<atom:content type="application/xml">'+
								'<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">'+
										'<d:Aufnr m:type="Edm.String">' + data.Aufnr + '</d:Aufnr>'+
										'<d:Pernr m:type="Edm.String">' + data.Pernr + '</d:Pernr>'+
								        '<d:Sdate m:type="Edm.DateTime">' + data.Sdate + '</d:Sdate>'+
										'<d:Edate m:type="Edm.DateTime">' + data.Edate + '</d:Edate>'+
										'<d:Euzeit m:type="Edm.Time">' + data.Euzeit + '</d:Euzeit>'+
										'<d:Suzeit m:type="Edm.Time">' + data.Suzeit + '</d:Suzeit>'+
									'</m:properties>'+
								'</atom:content>'+	
							'</atom:entry>';
							
							$.ajax({
							type: 'PUT',
							url: "/sap/opu/odata/SAP/Z_WP_SRV/AuftragSet('"+data.Aufnr+"')",
							headers: {
							    "X-CSRF-Token": headers.getResponseHeader('X-CSRF-Token'),
					                    "Content-Type": "application/atom+xml"
							},	
							data: record
							}).done(function(data){
							
					console.log("Post erfolgreich");
								
								
							}).fail(function(data){ 
																	
								console.log("Post Fehler!");
								
							});	
						});
			},
			drop: function(e, f) {
				//drop von Listenelementen

				var tableline = f.target.getElementsByTagName("span");
				var eventname =tableline.item(0).innerText + " " + tableline.item(2).innerText;	
				var dauer = parseInt(tableline.item(7).innerText);
				
				
				var start = new Date();
				start.setMonth(e.month());
				start.setDate(e.date());
				start.setFullYear(e.year());
				start.setUTCHours((e.hours()));
				var hilf = start.getUTCHours() -1;
				start.setUTCHours(hilf); 
				start.setMinutes(e.minutes());
				
				var end = new Date();
				end.setMonth(e.month());
				end.setDate(e.date());
				end.setFullYear(e.year());
				end.setUTCHours((e.hours()) + (dauer - 1) );
				end.setMinutes(e.minutes());
				
				var tableline = f.target.getElementsByTagName("span");
				var eventname =tableline.item(0).innerText;
								
					var eventData = {
						title: eventname,
						start: start,
						end: end
					};
				$('#calendar').fullCalendar('renderEvent', eventData, true);
				
				//
				// is the "remove after drop" checkbox checked?
				if ($('#drop-remove').is(':checked')) {
					// if so, remove the element from the "Draggable Events" list
					$(this).remove();
				}
				//ODATA aktualisieren
				
				
				// Datum bestimmen und umformatieren
				var time = start;

				var day = time.getUTCDate() + "." + (time.getMonth() + 1) + "."
						+ time.getFullYear();
				
				var hilf_tag = "";
				
				if (time.getUTCDate() < 10) {
					hilf_tag = "0" + time.getUTCDate().toFixed(0);
				}else{
					hilf_tag =  time.getUTCDate();
				}
				
				var hilf_monat = "";
				
				if ((time.getMonth() + 1) < 10) {
					hilf_monat = "0" + (time.getMonth() + 1).toFixed(0);
				}else{
					hilf_monat =  (time.getMonth() + 1);
				}
				
				
				var tag =time.getFullYear().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (time.getHours().length < 2) {
					hilf_stunde = "0" + time.getHours().toFixed(0);
				}else{
					hilf_stunde =  time.getHours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (time.getMinutes() < 10) {
					hilf_minute = "0" + time.getMinutes().toFixed(0);
				}else{
					hilf_minute =  time.getMinutes();
				}
				
				var hilf_sekunde = "";

				if (time.getSeconds() < 10) {
					hilf_sekunde = "0" + time.getSeconds().toFixed(0);
				}else{
					hilf_sekunde =  time.getSeconds();
				}
				var zeit = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
				var time = end;

				var day = time.getUTCDate() + "." + (time.getMonth() + 1) + "."
						+ time.getFullYear();
				
				var hilf_tag = "";
				
				if (time.getUTCDate() < 10) {
					hilf_tag = "0" + time.getUTCDate().toFixed(0);
				}else{
					hilf_tag =  time.getUTCDate();
				}
				
				var hilf_monat = "";
				
				if ((time.getMonth() + 1) < 10) {
					hilf_monat = "0" + (time.getMonth() + 1).toFixed(0);
				}else{
					hilf_monat =  (time.getMonth() + 1);
				}
				
				
				var tag2 =time.getFullYear().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				// Uhrzeit bestimmen und umformatieren
				
				
				var hilf_stunde = "";

				if (time.getHours().length < 2) {
					hilf_stunde = "0" + time.getHours().toFixed(0);
				}else{
					hilf_stunde =  time.getHours();
				}
				hilf_stunde = hilf_stunde -1;
				var hilf_minute = "";

				if (time.getMinutes() < 10) {
					hilf_minute = "0" + time.getMinutes().toFixed(0);
				}else{
					hilf_minute =  time.getMinutes();
				}
				
				var hilf_sekunde = "";

				if (time.getSeconds() < 10) {
					hilf_sekunde = "0" + time.getSeconds().toFixed(0);
				}else{
					hilf_sekunde =  time.getSeconds();
				}
				
				
				var zeit2 = "PT" + hilf_stunde + "H" + hilf_minute + "M" + hilf_sekunde + "S";
				// Datum bestimmen und umformatieren
				var time = new Date(tableline.item(4).innerText);

				var day = time.getUTCDate() + "." + (time.getMonth() + 1) + "."
						+ time.getFullYear();
				
				var hilf_tag = "";
				
				if (time.getUTCDate() < 10) {
					hilf_tag = "0" + time.getUTCDate().toFixed(0);
				}else{
					hilf_tag =  time.getUTCDate();
				}
				
				var hilf_monat = "";
				
				if ((time.getMonth() + 1) < 10) {
					hilf_monat = "0" + (time.getMonth() + 1).toFixed(0);
				}else{
					hilf_monat =  (time.getMonth() + 1);
				}
				
				
				var tag3 =time.getFullYear().toFixed(0) + "-" + hilf_monat + "-" + hilf_tag + "T00:00:00";
				
				window.data ={
						Aufnr: tableline.item(0).innerText,
							Dauer: tableline.item(7).innerText,
								Pernr: window.id,
									Termin: tag3,
										Prio: tableline.item(2).innerText,
											Sdate: tag,
											Suzeit: zeit,
												Edate: tag2,
												Euzeit: zeit2,
													Ktext: tableline.item(3).innerText,
														Status: tableline.item(5).innerText,
															Tplatz: tableline.item(6).innerText
							
				};
				
				
				
				//Post
				$.ajax({
					type: 'GET',
					url: "/sap/opu/odata/SAP/Z_WP_SRV",
					headers: {
							"X-Requested-With": "XMLHttpRequest",
					                "Content-Type": "application/atom+xml",
					                "DataServiceVersion": "2.0",      
					                "X-CSRF-Token":"Fetch" 
						 }
					}).fail(function(data){ 
						
						
					}).done(function (data, status, headers){
						var data = window.data;
							var record = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">'+
								'<atom:id>tag:com.sap,2010-06-24:/subscriptions/123</atom:id>'+
								'<atom:title>Create new user</atom:title><atom:author/>'+
								'<atom:updated/>'+
								'<atom:content type="application/xml">'+
								'<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">'+
										'<d:Aufnr m:type="Edm.String">' + data.Aufnr + '</d:Aufnr>'+
										'<d:Dauer m:type="Edm.Decimal">' + data.Dauer + '</d:Dauer>'+
										'<d:Pernr m:type="Edm.String">' + data.Pernr + '</d:Pernr>'+
										'<d:Termin m:type="Edm.DateTime">' + data.Termin + '</d:Termin>'+
										'<d:Prio m:type="Edm.String">' + data.Prio + '</d:Prio>'+
										'<d:Sdate m:type="Edm.DateTime">' + data.Sdate + '</d:Sdate>'+
										'<d:Edate m:type="Edm.DateTime">' + data.Edate + '</d:Edate>'+
										'<d:Ktext m:type="Edm.String">' + data.Ktext + '</d:Ktext>'+
										'<d:Status m:type="Edm.String">' + data.Status + '</d:Status>'+
										'<d:Tplatz m:type="Edm.String">' + data.Tplatz + '</d:Tplatz>'+
										'<d:Euzeit m:type="Edm.Time">' + data.Euzeit + '</d:Euzeit>'+
										'<d:Suzeit m:type="Edm.Time">' + data.Suzeit + '</d:Suzeit>'+
									'</m:properties>'+
								'</atom:content>'+	
							'</atom:entry>';
							
							$.ajax({
							type: 'PUT',
							url: "/sap/opu/odata/SAP/Z_WP_SRV/AuftragSet('"+data.Aufnr+"')",
							headers: {
							    "X-CSRF-Token": headers.getResponseHeader('X-CSRF-Token'),
					                    "Content-Type": "application/atom+xml"
							},	
							data: record
							}).done(function(data){
							
					console.log("Post erfolgreich");
					var tab = window.view.byId("idTable");
					var items = tab.getItems();
								
								for(var index = 0; index < items.length; index++){
								if (tab.getItems()[index].getCells()[0].getText() == window.data.Aufnr){
									tab.getItems()[index].setVisible(false);
								}
								}
								
							}).fail(function(data){ 
																	
								console.log("Post Fehler!");
								
							});	
						});
				
				
			//////////
			},
			
			select: function(start, end) {
				
				$('#calendar').fullCalendar('unselect');
			}
				
		}
						
		);
				
	// DRAGable Listenelemente	
								
  },
  
  tab_aus:function(){
	 
	  var eingeblendet =   this.getView().byId("idTable").getVisible();
	  
	  if(eingeblendet==true){
	  
	  
	  
	  this.getView().byId("idTable").setVisible(false);
	  $('#calendar').fullCalendar('option', 'height', $(window).height());
	  this.getView().byId("tab_a").setText("Tabelle einblenden");
	  }else{
		  var hohe = $(window).height();
		  hohe = hohe * 0.58;
		  this.getView().byId("idTable").setVisible(true);
		  $('#calendar').fullCalendar('option', 'height', hohe);
		  this.getView().byId("tab_a").setText("Tabelle ausblenden");
	  }
  },
bild:function(){
	


	html2canvas($('#calendar'), {
		  onrendered: function(canvas) {
		    var img = canvas.toDataURL()
		    window.open(img);
		  }
		});
},

    outlook: function(){
    	
    	var tab = this.getView().byId("idTable");
    	var cal = ics();

    	var items = tab.getItems();
    	var events = $('#calendar').fullCalendar( 'clientEvents');
		
		for(var index = 0; index < events.length; index++){
    													
				cal.addEvent(events[index].title, "", "", new Date(events[index].start), new Date(events[index].end));				
			
		}
		cal.download("wp");
    },
        
Back: function(){
			
	// navigate back to previous page
	window.history.go(-1);
	
}
});