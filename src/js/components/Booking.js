import {templates, select, settings} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import { utils } from '../utils.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(booking) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); // generowanie HTML za pomocą szablonu templates.bookingWidget
    thisBooking.dom = {}; // tworzenie pustego elmentu thisBooking.dom
    thisBooking.dom.wrapper = booking; // zapisywanie do tego obiektu właściwości wrapper równą otrzymanemu argumentowi
    thisBooking.dom.wrapper.innerHTML = generatedHTML; // zmiana zawartości wrappera na kod HTML wygenerowany z szablonu
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount); // zapisanie we
    // właściwości thisBooking.dom.peopleAmount pojedynczego elementu znalezionego we wrapperze i pasującego do selektora 
    // select.booking.peopleAmount
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount); // znalezienie i zapisanie 
    // elementu dla hourAmount analogicznie do peopleAmount
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.HourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); // nowa instancja klasy AmountWidget
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); // nowa instancja klasy AmountWidget
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker); // nowa instancja klasy DatePicker
    thisBooking.HourPicker = new HourPicker(thisBooking.dom.HourPicker); // nowa instancja klasy HourPicker
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params: ', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls: ', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let eventCurrent of eventsCurrent){
      console.log('Elements of eventsCurrent: ', eventCurrent);
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }

    //console.log('eventsCurrent: ', eventsCurrent);
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    thisBooking.booked = {
      date: {
        hour: [table],
        
      }
    };
    console.log('!thisBooking.booked: ', thisBooking.booked);
  }
}