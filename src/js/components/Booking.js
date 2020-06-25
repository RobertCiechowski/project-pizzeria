import {templates, select, settings, classNames} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {utils} from '../utils.js';

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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables); // właściwość thisBooking.dom.tables z
    // zapisanymi w niej wszystkimi znalezionymi we wrapperze elementy pasujące do selektora zapisanego w select.booking.tables
    thisBooking.dom.formSubmit = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit); // przycisk do wysłania formularza z podstrony booking
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); // nowa instancja klasy AmountWidget
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); // nowa instancja klasy AmountWidget
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker); // nowa instancja klasy DatePicker
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.HourPicker); // nowa instancja klasy HourPicker

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    //console.log('thisBooking.dom: ',thisBooking.dom);

    // *** Start kodu odpowiadającego za zaznaczanie stolika
    // pętla iterująca po wszystkich elementach obiektu tables, czyli po wszystkich stołach w knajpie
    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(event){ // event listener na kliknięcie któregokolwiek ze stołów
        event.preventDefault();
        let tableNumber = table.getAttribute(settings.booking.tableIdAttribute); // we właściwości 'tableNumber' zapisujemy jego id
        tableNumber = parseInt(tableNumber); // przerobienie 'tableNumber' na liczbę
        
        if(table.classList.contains(classNames.booking.tableBooked)){ // jeśli stół posiada klasę 'booked'
          alert('This table is already reserved!'); // wyświetl alert, że stół już jest zajęty
          console.log('Reserved table clicked. Alert showed.');
          //return;
        } else if(table.classList.contains(classNames.booking.tableSelected)){ // jeśli stół posiada klasę 'selected' (został już kliknięty przy wyborze stołu)
          table.classList.remove(classNames.booking.tableSelected); // to usuń klasę selected (odznaczamy wcześniej wybrany stół)
          console.log('Table (id:', tableNumber, ') deselected. Removed class selected.');
        } else { // jeśli żadne z powyższych, to
          for(let table of thisBooking.dom.tables){ // pętla która leci przez wszystkie stoły
            table.classList.remove(classNames.booking.tableSelected); // ze wszystkich stołów jest usuwana klasa 'selected'
            console.log('A table was selected. Removing class Selected from all tables.');
          } // koniec pętli
          table.classList.add(classNames.booking.tableSelected); // dodajemy klasę 'selected' do stołu, który został kliknięty
          thisBooking.chosenTable = tableNumber;
          console.log('Table (id:', tableNumber, ') selected. Added class selected.');
        }
      });
    } // *** Koniec kodu odpowiadającego za zaznaczanie stolika

    // *** Start kodu odpowiadającego za wysłanie formularza z podstrony Booking
    thisBooking.dom.formSubmit.addEventListener('click', function(event){
      event.preventDefault();
      console.log('Clicked button "BOOK TABLE"');
      thisBooking.sendBooking(); // wywołanie metody 'sendBooking' - wysłanie bookingu do API
    });
    // *** Koniec kodu odpowiadającego za wysłanie formularza z podstrony Booking
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {}; // nowy objekt - startEndDates (pusty)
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate); // przyposanie wartości (z użyciem funkcji zmiany daty na ciąg znaków) do klucza 'settings.db.dateStartParamKey' w obiekcie startEndDates
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate); // przyposanie wartości (z użyciem funkcji zmiany daty na ciąg znaków) do klucza 'settings.db.dateEndParamKey' w obiekcie startEndDates

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

    //console.log('getData urls: ', urls);

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
    //console.log('First thisBooking.booked: ', thisBooking.booked);

    // pętla iterująca po wszystkich elementach obiektu eventsCurrent (app.json) - przepuszcza je przez metodę makeBooked
    for(let eventCurrent of eventsCurrent){
      //console.log('Elements of eventsCurrent: ', eventCurrent);
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }

    // pętla iterująca po wszystkich elementach obiektu bookings (app.json) - przepuszcza je przez metodę makeBooked
    for(let bookedElement of bookings){
      thisBooking.makeBooked(bookedElement.date, bookedElement.hour, bookedElement.duration, bookedElement.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    //console.log('DATY: ', minDate, maxDate);
    
    // pętla iterująca po wszystkich elementach obiektu eventsRepeat (app.json) - przepuszcza je przez metodę makeBooked
    for(let eventRepeat of eventsRepeat){
      //console.log('@@@@@ eventRepeat: ', eventRepeat);
      if(eventRepeat.repeat == 'daily'){
        for(let repeatDay = minDate; repeatDay <= maxDate; repeatDay = utils.addDays(repeatDay, 1)){
          thisBooking.makeBooked(utils.dateToStr(repeatDay), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
          // console.log('repeatDay: ', repeatDay);
        }
      }         
    }    
    //console.log('eventsCurrent: ', eventsCurrent);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    const bookedHour = utils.hourToNumber(hour);
    //console.log('bookedHour: ', bookedHour);

    // jeżeli nie istnieje klucz z taką datą jaka jest podana w app.json, to jest on tworzony (w obiekcie thisBooking.booked)
    if(!thisBooking.booked[date]){
      thisBooking.booked[date] = {};
    }

    // pętla iterująca po każdym półgodzinnym bloku z zabookowanego przedziału czasowego, z każdym kolejnym przebiegiem zwiększa blok o pół godziny
    for(let blockHour = bookedHour; blockHour < bookedHour + duration; blockHour += 0.5){
      //console.log('blockHour: ', blockHour);
      // jeżeli nie istnieje taki półgodzinny blok, to jest on tworzony
      if(!thisBooking.booked[date][blockHour]){
        thisBooking.booked[date][blockHour] = [];
      } 
      // dodajemy do klucza blockHour w kluczu date w obiekcie booked numer zabookowanego stolika 
      thisBooking.booked[date][blockHour].push(table);
    }

    //console.log('thisBooking.booked: ', thisBooking.booked);
  }

  updateDOM(){
    const thisBooking = this;
    console.log('Method udateDOM');

    

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){
      let tableNumber = table.getAttribute(settings.booking.tableIdAttribute);
      tableNumber = parseInt(tableNumber);
      //console.log('Table: ', table);

      table.classList.remove(classNames.booking.tableSelected);

      if(thisBooking.booked[thisBooking.date] && 
        thisBooking.booked[thisBooking.date][thisBooking.hour] &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  // wysłanie bookingu do API
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const bookingPayload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.chosenTable,
      people: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
      starters: [],
      phone: '000 TEST',
      address: 'TEST address',
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedReponse: ', parsedResponse); // wyśiwtlanie wysłanego zamówienia w konsoli
        // wywoałanie metody makeBooked, żeby wysłany 'booking' sprawił, że stolik stanie się niedostępny w tym czasie
        thisBooking.makeBooked(bookingPayload.date, bookingPayload.hour, bookingPayload.duration, bookingPayload.table);
        thisBooking.updateDOM(); // wywołanie metody 'updateDom'
      });

    // ZŁOŻONE ZAMÓWIENIA MOŻNA SPRAWDZIĆ POD ADRESEM: http://localhost:3131/booking
  }
}