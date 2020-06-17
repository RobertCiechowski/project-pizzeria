import {templates, select} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}