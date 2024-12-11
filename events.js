window.events={};
const addEvent=(query, type, func, init=function(){}) => {
    if(typeof query!=="string") {
       console.error("addEvent: Expected string, instead got "+typeof query); // also handles undefined luckily
       return;
    }
    if(typeof func!=="function") {
       console.error("addEvent: Expected function, instead got "+typeof func);
       return;
    }
    if(typeof type!=="string") {
       console.error("addEvent: Expected string, instead got "+typeof type);
       return;
    }
    let element=document.querySelector(query);
    if(element===null) {
       console.warn("addEvent: Element not found for query of "+query);
       return;
    }
    if(window.events[query]) {
       if(window.events[query].type==type) {
          console.error("addEvent: An event with the query of "+query+" and type "+type+" already exists");
          return;
       }
    }
    window.events[query]={element, func, type};
    element.addEventListener(type, func);
    init.call(element);
}
const removeEvent = (query) => {
   if(typeof query!=="string") {
      console.error("removeEvent: Expected string, instead got "+typeof query);
      return;
   }
   const event = window.events[query];
   if(event===undefined) {
      console.warn("removeEvent: Event with the query "+query+" has not been found in window.events, are you sure you used the query instead of the element?");
      return;
   }
   // below code will only run if event exists because we know that it isn't non-existent from the above conditional code not running
   event.element.removeEventListener(event.type, event.func);
   delete window.events[query]; 
}