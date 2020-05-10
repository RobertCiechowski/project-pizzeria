/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;  // Zapisywanie argumentów konstruktora
      thisProduct.data = data; // Zapisywanie argumentów konstruktora

      thisProduct.renderInMenu(); // Renderowanie produktu
      thisProduct.getElements(); // Wywołanie getElementsów - wyszukiwanie elementó DOM
      thisProduct.initAccordion(); // Wywołanie akordeonu
      thisProduct.initOrderForm(); // Wywołanie metody odpowiedzialnej za event listenery formularza
      thisProduct.initAmountWidget(); // Wywołanie metody zmiany ilości składników w danym produkcie
      thisProduct.processOrder(); // Wywołanie *

      console.log('New Product: ', thisProduct);
    }

    renderInMenu(){   //Renderowanie produktu - dodanie metody
      const thisProduct = this;

      /* [DONE] generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('"GENERATED HTML" - renderInMenu: ' + generatedHTML);
      
      /* [DONE] create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* [DONE] add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      
      /* [DONE] find the clickable trigger (the element that should react to clicking) */
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* [DONE] START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(){
    
        /* [DONE] prevent default action for event */
        event.preventDefault();

        /* [DONE] toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /* [DONE] find all active products */
        const allActiveProducts = document.querySelectorAll('article.active');

        /* [DONE] START LOOP: for each active product */
        for(let activeProduct of allActiveProducts) {

          /* [DONE] START: if the active product isn't the element of thisProduct */
          if(activeProduct !== thisProduct.element) {          

            /* [DONE] remove class active for the active product */
            activeProduct.classList.remove('active');

          /* [DONE] END: if the active product isn't the element of thisProduct */
          }

        /* [DONE] END LOOP: for each active product */
        }

        /* [DONE] END: click event listener to trigger */
      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('"initOrderForm": ');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });        
    }

    processOrder(){
      const thisProduct = this;
      //console.log('"processOrder": ');

      /* [DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('"formData": ' + formData);

      /* [DONE] set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      //console.log('Price of this product: ' + price);

      /* [DONE] START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){
      
        /* [DONE] save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        //console.log('"param": ' + param);

        /* [DONE] START LOOP: for each optionId in param.options */
        for(let optionId in param.options){
          
          /* [DONE] save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          //console.log('"option": ' + option);

          /* [DONE] START IF: if option is selected and option is not default */
          if(optionSelected && !option.default){
            /* add price of option to variable price */
            price = price += option.price;
            //console.log('New price: ' + price);
          /* [DONE] END IF: if option is selected and option is not default */
          }
          /* [DONE] START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default){
            /* deduct price of option from price */
            price = price -= option.price;
            //console.log('New price: ' + price);
          /* [DONE] END ELSE IF: if option is not selected and option is default */
          }

          /* [DONE] save images of each option as const optionImage */
          const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          //console.log('"optionImages": ', optionImages);

          /* [DONE] START IF: if option is selected */
          if(optionSelected){
            /* [DONE] START LOOP: for each optionImage in optionImages */
            for(let optionImage of optionImages){
              /* [DONE] add class active to image */
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            /* [DONE] END LOOP: for each optionImage in optionImages */
            }
          /* [DONE] END IF: if option is selected */
          }
          /* [DONE] START ELSE: if option is not selected */
          else{
            /* [DONE] START LOOP: for each optionImage in optionImages */
            for(let optionImage of optionImages){
              /* remove class active from image */
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            /* [DONE] END LOOP: for each optionImage in optionImages */
            }
          /* [DONE] END ELSE: if option is selected */
          }

        /* [DONE] END LOOP: for each optionId in param.options */
        }

      /* [DONE] END LOOP: for each paramId in thisProduct.data.params */
      }

      /* [DONE] multiply price by amount */
      price *= thisProduct.amountWidget.value;

      /* [DONE] set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.initActions();

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.setValue(thisWidget.input.value);

      console.log('AmountWidget: ', thisWidget);
      console.log('Constructor arguments: ', element);
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* [DONE] Add Validation */
      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }      

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      
      //console.log('"thisApp.data" :', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){ 
      const thisApp = this;

      thisApp.data = dataSource;
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}