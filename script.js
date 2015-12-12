if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement) {
  HTMLElement.prototype.insertAdjacentElement = function(where, parsedNode) {
    switch (where) {
      case 'beforeBegin':
        this.parentNode.insertBefore(parsedNode, this)
        break;
      case 'afterBegin':
        this.insertBefore(parsedNode, this.firstChild);
        break;
      case 'beforeEnd':
        this.appendChild(parsedNode);
        break;
      case 'afterEnd':
        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);
        else this.parentNode.appendChild(parsedNode);
        break;
    }
  }

  HTMLElement.prototype.insertAdjacentHTML = function(where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML)
  }


  HTMLElement.prototype.insertAdjacentText = function(where, txtStr) {
    var parsedText = document.createTextNode(txtStr)
    this.insertAdjacentElement(where, parsedText)
  }
}

function hasParent(elem, parent){
  elem = elem.parentNode;
  while(elem != null){
    if(elem.matches(parent)) return true;
    elem = elem.parentNode;
  }
  return false;
}

function parentByAttribute(elem, attr){
  elem = elem.parentNode;
  while(elem != document.body){
    if(elem.hasAttribute(attr)) return elem;
    elem = elem.parentNode;
  }
  return false;
}

function DragField(elem){
  elem.addEventListener('mousedown', downed);
  var ifc = elem;
  var positions = {
    elementX: 0,
    elementY: 0,
    offsetX: 0,
    offsetY: 0
  };
  var cursor = {
    cursorX: 0,
    cursorY: 0
  };
  var avatar = {};
  var draggingElem = {};
  var over = {};
  var hovered = {};
  var hoveredPrevious = {};
  var previousDroppable = {};

  function downed(event){
    var target = event.target;
    while(!target.hasAttribute('draggable')){
      target = target.parentNode;
      if(target == elem) return;
    }
    draggingElem = target;
    previousDroppable = parentByAttribute(draggingElem, 'droppable');
    cursor.cursorX = event.pageX + window.pageXOffset;
    cursor.cursorY = event.pageY + window.pageYOffset;

    document.body.addEventListener('mousemove', prepearDrag);
    document.body.addEventListener('mouseup', removePrepearing);
  }

  function prepearDrag(event){
    if(Math.abs(event.pageX + window.pageXOffset - cursor.cursorX) > 4 || Math.abs(event.pageY + window.pageYOffset - cursor.cursorY) > 4){
      document.body.removeEventListener('mouseup', removePrepearing);
      document.body.removeEventListener('mousemove', prepearDrag);
      positions.elementX = window.pageXOffset + draggingElem.getBoundingClientRect().left;
      positions.elementY = window.pageYOffset + draggingElem.getBoundingClientRect().top;
      positions.offsetX = Math.abs(cursor.cursorX - draggingElem.getBoundingClientRect().left);
      positions.offsetY = Math.abs(cursor.cursorY - draggingElem.getBoundingClientRect().top);

      avatar = draggingElem.cloneNode(true);
      avatar.style.width = draggingElem.offsetWidth - parseInt(window.getComputedStyle(draggingElem).paddingLeft) - parseInt(window.getComputedStyle(draggingElem).paddingRight) + 'px';
      draggingElem.style.display = 'none';
      avatar.style.position = 'absolute';
      avatar.style.left = window.pageXOffset + event.pageX - positions.offsetX + 'px';
      avatar.style.top = window.pageYOffset + event.pageY - positions.offsetY + 'px';
      document.body.appendChild(avatar);

      document.body.addEventListener('mousemove', dragging);
      document.body.addEventListener('mousemove', hoverMargins);
      document.body.addEventListener('mouseup', stopDragging);
    }
  }

  function dragging(event){
    avatar.style.left = window.pageXOffset + event.pageX - positions.offsetX - parseInt(window.getComputedStyle(avatar).marginLeft) + 'px';
    avatar.style.top = window.pageYOffset + event.pageY - positions.offsetY - parseInt(window.getComputedStyle(avatar).marginTop) + 'px';
  }

  function stopDragging(event){
    document.body.removeEventListener('mousemove', dragging);
    document.body.removeEventListener('mousemove', hoverMargins);
    document.body.removeEventListener('mouseup', stopDragging);
    document.body.removeChild(avatar);
    avatar = null;
    var draggable = ifc.querySelector('.margin-bottom[draggable]');
    var droppable = ifc.querySelector('.padding-top[droppable]');
    if(draggable){
      draggable.insertAdjacentElement('afterEnd', draggingElem);
    }else if(droppable){
      droppable.insertAdjacentElement('afterBegin', draggingElem);
    }else{

    }
    draggingElem.style.display = 'block';
    draggingElem = hoveredPrevious = previousDroppable = null;
    hoverMarginsReset();
    return;
  }

  function hoverMargins(event){
    var checkPoint = {x: event.pageX, y: avatar.getBoundingClientRect().top - 1};
    hovered = document.elementFromPoint(checkPoint.x, checkPoint.y);
    if(hovered == avatar) return;
    while(hovered != document.documentElement){
      if(hovered.hasAttribute('draggable') || hovered.hasAttribute('droppable')) break;
      hovered = hovered.parentNode;
    }

    if(hovered.hasAttribute('droppable') && checkPoint.y - hovered.getBoundingClientRect().top < parseInt(window.getComputedStyle(hovered).paddingTop) + 10){
      hoverMarginsReset();
      hoveredPrevious = null;
      hovered.classList.add('padding-top');
      return;
    }
    if(hovered == previousDroppable || hoveredPrevious == hovered){
      return;
    }
    if(hovered.hasAttribute('droppable') || hovered == document.documentElement){
      hoveredPrevious = null;
      hoverMarginsReset();
      return;
    }
    hoverMarginsReset();
    hovered.classList.add('margin-bottom');
    previousDroppable = parentByAttribute(hovered, 'droppable');
    hoveredPrevious = hovered;
  }

  function hoverMarginsReset(){
    var allElems = ifc.querySelectorAll('[draggable]');
    for(var i = 0; i < allElems.length; i++)
      allElems[i].classList.remove('margin-bottom');
    allElems = ifc.querySelectorAll('[droppable]');
    for(var i = 0; i < allElems.length; i++)
      allElems[i].classList.remove('padding-top');
  }

  function removePrepearing(event){
    document.body.removeEventListener('mousemove', prepearDrag);
  }
}

new DragField(document.getElementById('interface'));