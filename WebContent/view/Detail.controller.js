jQuery.sap.require('DHBW.formatter.formatter');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-resizable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');

$.sap.require('DHBW.script.CalendarObject');
$.sap.require('DHBW.script.jquery-touch-punch');
$.sap.require('DHBW.script.moment');
$.sap.require('DHBW.script.FileSaver');
$.sap.require('DHBW.script.Blob');
$.sap.require('DHBW.script.ics');
$.sap.require('DHBW.script.fullcalendar');
$.sap.require('DHBW.script.html2canvas');

function getFormattedDateObject (start, end, table_item_4_text) {
    var zeit = "PT"+("00"+(start.getHours()-2)).slice(-2)+"H"+("00"+start.getMinutes()).slice(-2)+"M"+("00"+start.getSeconds()).slice(-2)+"S";
    var start_of_start_day = new Date(start.getTime());
    start_of_start_day.setHours(0,0,0,0);
    start_of_start_day.setDate(start_of_start_day.getDate()+1);
    var tag = start_of_start_day.toISOString().substring(0, start_of_start_day.toISOString().length-5);


    var zeit2 = "PT"+("00"+(end.getHours()-2)).slice(-2)+"H"+("00"+end.getMinutes()).slice(-2)+"M"+("00"+end.getSeconds()).slice(-2)+"S";
    var start_of_end_day = new Date(end.getTime());
    start_of_end_day.setHours(0,0,0,0);
    start_of_end_day.setDate(start_of_end_day.getDate()+1);
    var tag2 = start_of_end_day.toISOString().substring(0, start_of_end_day.toISOString().length-5);

    if (typeof table_item_4_text != 'undefined') {
        var t_item_4 = new Date(table_item_4_text);
        t_item_4.setHours(0,0,0,0);
        t_item_4.setDate(t_item_4.getDate()+1);
        var tag3 = t_item_4.toISOString().substring(0, t_item_4.toISOString().length-5);
    }

    return {
        Termin: (tag3||null),
        Sdate: tag,
        Suzeit: zeit,
        Edate: tag2,
        Euzeit: zeit2
    }
}

function getSAPToken (o) {
    var o = (o||{});
    var successful = (o.successful||function(token){});
    var failure = (o.failure||function(data){});

    $.ajax({
        type: 'GET',
        url: "/sap/opu/odata/SAP/Z_WP_SRV",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/atom+xml",
            "DataServiceVersion": "2.0",
            "X-CSRF-Token":"Fetch"
        }
    }).fail(function(data){ failure(data); }).done(function(data, status, headers) { var token = headers.getResponseHeader('X-CSRF-Token'); successful(token); });
}

function putAuftragsSet (o) {
    // Callbacks definieren
    var o = (o||{});
    var successful = (o.successful||function(token){});
    var failure = (o.failure||function(data){});

    // Überprüfen, ob die notwendigen Variablen deklariert sind
    if (typeof o.data == 'undefined' || typeof  o.token == 'undefined') {
        failure();
        return;
    }

    var token = o.token;
    var data = o.data;

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
            "X-CSRF-Token": token,
            "Content-Type": "application/atom+xml"
        },
        data: record
    }).done(function(d){
        successful(d);
    }).fail(function(d){
        failure(d);
    });
}

sap.ui.controller("DHBW.view.Detail", {


    onInit: function () {

        this.id = "";
        var that = this;
        sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function (oEvent) {
            if (oEvent.getParameter("name") == "Detail") {
                try {
                    var hohe = $(window).height();
                    hohe = hohe * 0.58;
                    this.getView().byId("idTable").setVisible(true);
                    $('#calendar').fullCalendar('option', 'height', hohe);

                } catch (e) {
                }
                //Binding aktualisieren wenn nötig
                var tab = this.getView().byId("idTable");
                var bind = tab.getBinding("items");
                if (typeof(bind) != "undefined") {
                    bind.filter([new sap.ui.model.Filter("Perno",
                        sap.ui.model.FilterOperator.EQ, oEvent.getParameters().arguments.contextPath)]);

                }

                window.id = oEvent.getParameters().arguments.contextPath;
                window.view = this.getView();
                window.filter = false;

                $('#calendar').fullCalendar('removeEvents');
                this.name = "";
                that = this;
                this.perwechsel();
            }

        }, this);

        var table = this.getView().byId("idTable");
        table.attachUpdateFinished(function () {


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

            CalendarObject.resetObjectStore();
            // Objekte aufbauen
            for (var i = 0; i < items.length; i++) {
                var start = Date.parse(this.getItems()[i].getCells()[8].getText());
                if (isNaN(start) == false) {
                    start = new Date(start);
                    var suzeit = new Date(this.getItems()[i].getCells()[10].getText());
                    start.setMinutes(suzeit.getMinutes());
                    start.setHours(suzeit.getHours());
                } else {
                    start = null;
                }

                var end = Date.parse(this.getItems()[i].getCells()[9].getText());
                if (isNaN(end) == false) {
                    end = new Date(end);
                    var euzeit = new Date(this.getItems()[i].getCells()[11].getText());
                    end.setMinutes(euzeit.getMinutes());
                    end.setHours(euzeit.getHours());
                }

                var object = CalendarObject.init({
                    start: start,
                    end: end,
                    row: this.getItems()[i],
                    duration: parseFloat(this.getItems()[i].getCells()[7].getText()),
                    id: parseInt(this.getItems()[i].getCells()[0].getText())
                });

                // Kalender-Event suchen
                for (var e = 0; e < events.length; e++) {
                    if (parseInt(events[e].title) == object.id) {
                        object.assignCalendarEvent(events[e]);
                        break;
                    }
                }

                // Falls nicht vorhanden: Kalender-Event erstellen
                object.addCalendarEvent();
            }


            var da = false;
            for (var index = 0; index < items.length; index++) {
                /**
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
**/

            }

        });
    },

    perwechsel:function(){
        var tab = this.getView().byId("idTable");
    },

    onAfterRendering: function () {
        //Kalender
        jQuery.sap.require('DHBW.script.demo');
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
                buttonText: {
                    today: 'Heute',
                    month: 'Monat',
                    week: 'Woche',
                    day: 'Tag'
                },
                droppable: true, // this allows things to be dropped onto the calendar
                windowResize: function () {
                    var hohe = $(window).height() * 0.58;
                    $('#calendar').fullCalendar('option', 'height', hohe);

                },
                eventClick: function (event, jsEvent, view) {
                    //Hier Events löschen
                    sap.m.MessageBox.show("Wollen Sie die Einplanung des Auftrags wirklich löschen?",
                        sap.m.MessageBox.Icon.WARNING, "Achtung",
                        [ sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO  ], $.proxy(
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

                    dow: [1, 2, 3, 4, 5]
                    // days of week. an array of zero-based day of week integers (0=Sunday)
                    // (Monday-Thursday in this example)
                },
                eventDrop: function (event) {
                    //Drop von Events ins Backend schreiben
                    if (!CalendarObject.exists(event.title)) return;

                    var start = event.start.toDate();
                    var end = event.end.toDate();

                    var object = CalendarObject.get(event.title);
                    object.updateDate(start,end);
                    object.save({
                        personal_number: window.id,
                        success: function() { console.log("Success"); },
                        failure: function() { console.log("Failure"); }
                    });


                    /*var dateObject = getFormattedDateObject(start,end);

                    var sap_data ={
                        Aufnr: event.title,
                        Pernr: window.id
                    };

                    $.extend(sap_data, dateObject);

                    getSAPToken({
                        successful: function (token) {
                            putAuftragsSet({
                                successful: function() {
                                    console.log("Success");
                                },
                                failure: function() {
                                    console.log("Failure");
                                },
                                token: token,
                                data: sap_data
                            })
                        },
                        failure: function () {
                            console.log("Failure 2");
                        }
                    });*/
                },
                eventResize: function (event) {
                    //Events größer / kleiner ziehen
                    if (!CalendarObject.exists(event.title)) return;

                    var start = event.start.toDate();
                    var end = event.end.toDate();

                    var object = CalendarObject.get(event.title);
                    object.updateDate(start,end);
                    object.save({
                        personal_number: window.id,
                        success: function() { console.log("Success"); },
                        failure: function() { console.log("Failure"); }
                    });

                    /**

                    console.log ("Event resize");
                    var start = event.start.toDate();
                    var end = event.end.toDate();

                    var dateObject = getFormattedDateObject(start,end);

                    var sap_data ={
                        Aufnr: event.title,
                        Pernr: window.id
                    };

                    $.extend(sap_data, dateObject);

                    getSAPToken({
                        successful: function (token) {
                            putAuftragsSet({
                                successful: function() {
                                    console.log("Success");
                                },
                                failure: function() {
                                    console.log("Failure");
                                },
                                token: token,
                                data: sap_data
                            })
                        },
                        failure: function () {
                            console.log("Failure 2");
                        }
                    });
                    */
                },
                drop: function (e, f) {
                    //drop von Listenelementen
                    /*
                    var eventname =tableline.item(0).innerText + " " + tableline.item(2).innerText;
                    var dauer = parseInt(tableline.item(7).innerText);*/

                    var tableline = f.target.getElementsByTagName("span");
                    var event_id = tableline.item(0).innerText;

                    if (!CalendarObject.exists(event_id)) return;
                    var object = CalendarObject.get(event_id);

                    var start = new Date();
                    start.setMonth(e.month());
                    start.setDate(e.date());
                    start.setFullYear(e.year());
                    start.setHours((e.hours()));
                    start.setMinutes(e.minutes());

                    var end = new Date();
                    end.setMonth(e.month());
                    end.setDate(e.date());
                    end.setFullYear(e.year());
                    end.setHours((e.hours()) + (object.duration) );
                    end.setMinutes(e.minutes());

                    object.create({
                        personal_number: window.id,
                        start: start,
                        end: end,
                        success: function() { console.log("Success"); },
                        failure: function() { console.log("Failure"); }
                    });


                    object.addCalendarEvent(null,1);

/*
                    var tableline = f.target.getElementsByTagName("span");
                    var eventname =tableline.item(0).innerText;

                    var eventData = {
                        title: eventname,
                        start: start,
                        end: end
                    };

                    //
                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }
                    //ODATA aktualisieren

                    var dateObject = getFormattedDateObject(start,end,tableline.item(4).innerText);

                    var sap_data ={
                        Aufnr: tableline.item(0).innerText,
                        Dauer: tableline.item(7).innerText,
                        Pernr: window.id,
                        Prio: tableline.item(2).innerText,
                        Ktext: tableline.item(3).innerText,
                        Status: tableline.item(5).innerText,
                        Tplatz: tableline.item(6).innerText

                    };

                    $.extend(sap_data, dateObject);

                    console.log(sap_data);

                    $('#calendar').fullCalendar('renderEvent', eventData, true);

                    getSAPToken({
                        successful: function (token) {
                            putAuftragsSet({
                                successful: function() {
                                    console.log("Success");
                                },
                                failure: function() {
                                    console.log("Failure");
                                },
                                token: token,
                                data: sap_data
                            })
                        },
                        failure: function () {
                            console.log("Failure 2");
                        }
                    });*/

                },

                select: function (start, end) {

                    $('#calendar').fullCalendar('unselect');
                }

            }
        );


    },


    Back: function () {

        // navigate back to previous page
        window.history.go(-1);

    }
});