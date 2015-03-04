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


/**
 * Erstell einen Token zum Schreiben in das SAP-System und gibt diesen an den successful-Handler zurück
 * @param o {object}
 */
function getSAPToken (o) {
    //Callbacks definieren
    var o = (o||{});
    var successful = (o.successful||function(token){});
    var failure = (o.failure||function(data){});

    //Token via GET holen
    $.ajax({
        type: 'GET',
        url: "/sap/opu/odata/SAP/Z_WP_SRV",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/atom+xml",
            "DataServiceVersion": "2.0",
            "X-CSRF-Token":"Fetch"
        }
    
    }).fail(function (data) {
        //Beim Fehler geht es leer zurück
        failure(data);
    }).done(function (data, status, headers) {
        //Im Erfolgsfall Token extrahieren und zurückgeben
        var token = headers.getResponseHeader('X-CSRF-Token');
        successful(token);
    });
}

/**
 * Sendet die Auftragsdaten an das SAP-System
 * @param o {object}
 */
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

/**
 * Zeigt die Warnung für ein außerhalb der Geschäftszeiten liegendes Ereignis an
 * @param object {object}
 */
function showBusinessHoursWarning(object) {
    sap.m.MessageBox.show("Der Kalendereintrag befindet sich außerhalb der Geschäftszeiten.",
        sap.m.MessageBox.Icon.WARNING, "Hinweis",
        [ sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.DELETE ], $.proxy(function(sAction) {
            if (sAction == 'DELETE') {
                object.removeCalendarEvent({
                    successful: function () { console.log('Successful'); },
                    failure: function () { console.log('Failure'); }
                });
            }
        }, this)
    );
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

                                    if (!CalendarObject.exists(event.title)) return;

                                    CalendarObject.get(event.title).removeCalendarEvent({
                                        successful: function () { console.log('Successful'); },
                                        failure: function () { console.log('Failure'); }
                                    });
                                }
                            }, this));
                },
                businessHours: CalendarObject.businessHours,
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

                },
                drop: function (e, f) {
                    //drop von Listenelementen


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

                    // Warnung zeigen, falls nicht in Geschäftszeiten
                    if (!CalendarObject.isInBusinessHours(object.start, object.end)) {
                        showBusinessHoursWarning(object);
                    }

                },

                select: function (start, end) {

                    $('#calendar').fullCalendar('unselect');
                }

            }
        );


    },

    image: function(){

        html2canvas($('#calendar'), {
            onrendered: function(canvas) {
                window.open(canvas.toDataURL());
            }
        });
    },

    ics: function(){
        var ical = ics();

        var events = $('#calendar').fullCalendar( 'clientEvents');

        for(var i = 0; i < events.length; i++){
            var object = CalendarObject.get(events[i].title);
            if (object == null) continue;

            ical.addEvent(object.id, "", "", object.start, object.end);

        }
        ical.download("wp");
    },

    toggleTable:function(){
        // Wenn die Tabelle eingeblendet ist
        if(this.getView().byId("idTable").getVisible()){
            //Tabelle ausblenden
            this.getView().byId("idTable").setVisible(false);

            //Kalenderhöhe neu berechnen
            $('#calendar').fullCalendar('option', 'height', $(window).height());
            this.getView().byId("toggleTable").setText("Tabelle einblenden");

        } else {
            // Tabelle als sichtbar markieren
            this.getView().byId("idTable").setVisible(true);
            $('#calendar').fullCalendar('option', 'height', ($(window).height()*0.58));
            this.getView().byId("toggleTable").setText("Tabelle ausblenden");
        }
    },


    Back: function () {

        // navigate back to previous page
        window.history.go(-1);

    }
});