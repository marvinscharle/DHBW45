/**
 * Objekt zur Repräsentation eines Auftrags. Dieser kann entweder als Tabellenzeile oder als Eintrag im Kalender existieren.
 * @returns {CalendarObject}
 * @constructor
 */
var CalendarObject = function () {
    var self = this;

    /**
     * Gibt ein Zeitobjekt in einer SAP-Zeit-kompatiblen Darstellung zurück
     * @param object
     * @returns {string}
     */
    this.time = function(object) {
        return "PT"+("00"+(object.getHours())).slice(-2)+"H"+("00"+object.getMinutes()).slice(-2)+"M"+("00"+object.getSeconds()).slice(-2)+"S";
    };

    /**
     * Gibt eine Zeitobjekt in einer SAP-Datum-kompatiblen Darstellung zurück
     * @param object
     * @returns {string}
     */
    this.date = function(object) {
        var start_day = new Date(object.getTime());
        start_day.setHours(0,0,0,0);
        start_day.setDate(start_day.getDate()+1);
        return start_day.toISOString().substring(0, start_day.toISOString().length-5);
    };

    return this;
};
CalendarObject.prototype = {
    start: null,
    end: null,
    duration: 0.0,
    id: 0,
    row: null,
    calendar_item: null,

    /**
     * Gibt die Startzeit als SAP-Zeit zurück
     * @returns {string}
     */
    start_time: function () {
        if (this.start == null) return null;
        //Fixing SAP
        var start = new Date(this.start.getTime());
        start.setHours(start.getHours());
        return this.time(start);
    },

    /**
     * Gibt die Endzeit als SAP-Zeit zurück
     * @returns {string}
     */
    end_time: function () {
        if (this.end == null) return null;
        //Fixing SAP
        var end = new Date(this.end.getTime());
        end.setHours(end.getHours());
        return this.time(end);
    },

    /**
     * Gibt die Startzeit als SAP-Datum zurück
     * @returns {string}
     */
    start_date: function () {
        if (this.start == null) return null;
        return this.date(this.start);
    },

    /**
     * Gibt die Endzeit als SAP-Datum zurück
     * @returns {string}
     */
    end_date: function () {
        if (this.end == null) return null;
        return this.date(this.end);
    },

    /**
     * Gibt true zurück, wenn der Termin im Kalender eingetragen ist
     * @returns {boolean}
     */
    in_calendar: function() {
        return (this.calendar_item != null);
    },

    /**
     * Weist dem Termin ein Element im Kalender zu
     * @param element
     * @param color
     * @returns {CalendarObject}
     */
    assignCalendarEvent: function (element, color) {
        if (this.calendar_item != null) return;
        var color = (color||'green');

        this.calendar_item = element;
        this.row.setVisible(false);

        return this;
    },

    /**
     * Erstellt für den Termin ein Kalenderobjekt
     * @param color
     * @param time_offset
     * @returns {CalendarObject}
     */
    addCalendarEvent: function (color,time_offset) {
        if (this.calendar_item != null) return;
        if (this.start == null || this.end == null) return;
        var color = (color||'green');
        var time_offset = (time_offset||0);

        this.row.setVisible(false);

        // Seltsames SAP-Kalender-Verhalten fixen
        var start = new Date(this.start.getTime());
        var end = new Date(this.end.getTime());
        start.setHours(start.getHours()+time_offset);
        end.setHours(end.getHours()+time_offset);

        this.calendar_item = $("#calendar").fullCalendar('renderEvent', {
            title: this.id,
            start: start,
            end: end,
            color: color
        }, true);

        return this;
    },

    /**
     * Entfernt den Termin aus dem Kalender
     * @returns {CalendarObject}
     */
    removeCalendarEvent: function () {
        if (this.calendar_item == null) return;
        this.calendar_item = null;
        this.row.setVisible(true);

        return this;
    },

    /**
     * Fügt für den Termin eine Spalte in der Listenansicht hinzu
     * @param element
     * @returns {CalendarObject}
     */
    addRow: function (element) {
        element.addEventDelegate({
            onmousedown: function () {
                mouseState = setTimeout(
                    function () {
                        $("#" + element.sId).draggable({
                            appendTo: 'body',
                            helper: 'clone',
                            cursor: 'move',
                            revert: 'invalid',
                            start: function (event, ui) {
                                ui.helper.width($("#" + element.sId).width());
                                $("#box_assign").css("visibility", "visible");
                                $("#box_delete").css("visibility", "visible");
                            },
                            stop: function () {
                                element.removeStyleClass("sapMLIBSelected");
                                $("#box_assign").css("visibility", "hidden");
                                $("#box_delete").css("visibility", "hidden");
                            }
                        });
                        element.addStyleClass("sapMLIBSelected");
                    }, 600
                );
            }
        });
        this.row = element;
        return this;
    },

    /**
     * Aktualisiert den Termin mit den angegebenen Zeiteinheiten
     * @param start {Date}
     * @param end {Date}
     * @returns {CalendarObject}
     */
    updateDate: function (start, end) {
        if (!start instanceof Date ||!end instanceof Date) return;
        if (start.getTime() > end.getTime()) return;

        this.start = new Date(start.getTime());
        this.start.setHours(this.start.getHours()-2);
        this.end = new Date(end.getTime());
        this.end.setHours(this.end.getHours()-2);

        var timeDiff = this.end.getTime()-this.start.getTime();
        this.duration = timeDiff/(1000*3600);

        return this;
    },

    /**
     * Speichert den Termin im SAP-System
     * @param o {object}
     * @returns {CalendarObject}
     */
    save: function(o) {
        var o = (o||{});
        if (o.personal_number == null) return false;
        var success = (o.success||function(){});
        var failure = (o.failure||function(){});

        var sap_data = {
            Aufnr: this.id,
            Pernr: o.personal_number,
            Sdate: this.start_date(),
            Suzeit: this.start_time(),
            Edate: this.end_date(),
            Euzeit: this.end_time()
        };

        getSAPToken({
            successful: function (token) {
                putAuftragsSet({
                    successful: function() {
                        success();
                    },
                    failure: function() {
                        failure();
                    },
                    token: token,
                    data: sap_data
                })
            },
            failure: function () {
                failure();
            }
        });

        return this;
    },

    /**
     * Erstellt den Termin im SAP-System
     * @param o {object}
     * @returns {CalendarObject}
     */
    create: function(o) {
        var o = (o||{});

        if (o.start instanceof Date) {
            this.start = new Date(o.start.getTime());
            this.start.setHours(this.start.getHours()-1);
        }

        if (o.end instanceof Date) {
            this.end = new Date(o.end.getTime());
            this.end.setHours(this.end.getHours()-1);
        }

        return this.save(o);
    }
};
CalendarObject.objectStore = [];
/**
 * Erstellt ein neues Objekt mit den gegebenen Attributen
 * @param o {object}
 * @returns {CalendarObject}
 */
CalendarObject.init = function (o) {
    var o = (o||{});

    var instance = new CalendarObject();
    instance.start = (o.start instanceof Date) ? o.start : null;
    instance.end = (o.end instanceof Date) ? o.end : null;
    instance.duration = (o.duration||0.0);
    instance.id = (o.id||0);

    if (o.row != null) instance.addRow(o.row);

    CalendarObject.objectStore[instance.id] = instance;

    return instance;
};
/**
 * Setzt den Objekt-Cache zurück
 */
CalendarObject.resetObjectStore = function () {
    CalendarObject.objectStore = [];
};
/**
 * Gibt true zurück, wenn ein Objekt mit der gegebenen ID existiert
 * @param id
 * @returns {boolean}
 */
CalendarObject.exists = function (id) {
    var id = parseInt(id);
    return (CalendarObject.objectStore[id] != null);
};
/**
 * Gibt das Objekt mit der gegebenen ID zurück
 * @param id
 * @returns {CalendarObject}
 */
CalendarObject.get = function (id) {
    var id = parseInt(id);
    return CalendarObject.objectStore[id];
};