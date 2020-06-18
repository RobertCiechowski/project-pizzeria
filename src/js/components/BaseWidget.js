export class BaseWidget{
  constructor(wrapperElement, initialValue){ // konstruktow przyjmuje dwa argumenty - wrapperElement i initialValue
    const thisWidget = this; // definicja stałej thisWidget i przypisanie jej obiektu this

    thisWidget.dom = {}; // tworzenie obiektu thisWidget.dom
    thisWidget.dom.wrapper = wrapperElement; // zapisanie w obiekcie thisWidget.dom właściwości wrapper, której wartością jest argument wrapperElement 
    thisWidget.correctValue = initialValue; // właściwość thisWidget.correctValue z zapisaną wartością argumentu initialValue
  }

  get value(){ // metoda (getter - odczytywanie wartości)
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(assignedValue){ // metoda (setter - ustawianie wartości)
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue);

    // if sprawdzający czy czy wartość jest inna od dotychczasowej wartości, 
    // oraz wykorzystuje metodę isValid, do sprawdzenia czy wartość jest poprawna – np. czy jest liczbą
    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      // jeśli oba warunki są spełnione, to:
      thisWidget.correctValue = newValue; // nowa wartość zostaje zapisana we właściwości correctValue
      thisWidget.announce(); // zostaje uruchomiona metoda announce, która wywoła event informujący o zmianie wartości
    }

    thisWidget.renderValue(); // wywołujemy metodę renderującą (wyświetlającą) wartość naszego widgetu
  }

  parseValue(newValue){
    return parseInt(newValue); // zastosowanie funkcji parseInt (konwertowanie przekazany jej argument na liczbę)
  }

  isValid(newValue){
    return !isNaN(newValue); // funkcja isNan sprawdza czy otrzmana wartość jest NaNem (wtedy zwaca prawdę), 
    // a my chcemy sprawdzić czy nie jest NaNem, więc funkcja jest zanegowana
  }

  renderValue(){ // metoda renderująca wrtość widgetu (wyświetlanie)
    const thisWidget = this;

    console.log('widgetValue: ', thisWidget.value);
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}