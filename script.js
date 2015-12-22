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
      if(elem == parent) return true;
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
    var ifc = elem;
    ifc.addEventListener('mousedown', downed);
    ifc.addEventListener('touchstart', downed);
    var positions = {
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
    var draggingIndex;

    function downed(event){
      var target = event.target;
      if (target === null) return;
      while(!target.hasAttribute('draggable')){
        target = target.parentNode;
        if(target == ifc || target === null) return;
      }
      if(!hasParent(target, ifc)) return;
      draggingElem = target;
      previousDroppable = parentByAttribute(draggingElem, 'droppable');
      cursor.cursorX = event.pageX || event.targetTouches[0].pageX;
      cursor.cursorY = event.pageY || event.targetTouches[0].pageY;

      document.body.addEventListener('mousemove', prepearDrag);
      document.body.addEventListener('mouseup', removePrepearing);

      document.body.addEventListener('touchmove', prepearDrag);
      document.body.addEventListener('touchend', removePrepearing);

      event.preventDefault();
    }

    function prepearDrag(event){
      if(Math.abs((event.pageX || event.targetTouches[0].pageX) - cursor.cursorX) > 4 || Math.abs((event.pageY || event.targetTouches[0].pageY) - cursor.cursorY) > 4){
        document.body.removeEventListener('mouseup', removePrepearing);
        document.body.removeEventListener('mousemove', prepearDrag);

        document.body.removeEventListener('touchend', removePrepearing);
        document.body.removeEventListener('touchmove', prepearDrag);

        positions.offsetX = Math.abs((event.clientX || event.targetTouches[0].clientX) - draggingElem.getBoundingClientRect().left);
        positions.offsetY = Math.abs((event.clientY || event.targetTouches[0].clientY) - draggingElem.getBoundingClientRect().top);

        var divs = draggingElem.parentNode.children;
        draggingIndex = Array.prototype.indexOf.call(divs, draggingElem);
        avatar = draggingElem.cloneNode(true);
        avatar.classList.add('avatar');
        avatar.style.width = draggingElem.offsetWidth - parseInt(window.getComputedStyle(draggingElem).paddingLeft) - parseInt(window.getComputedStyle(draggingElem).paddingRight) + 'px';
        draggingElem.style.display = 'none';
        avatar.style.position = 'absolute';
        avatar.style.left = (event.pageX || event.targetTouches[0].pageX) - positions.offsetX + 'px';
        avatar.style.top = (event.pageY || event.targetTouches[0].pageY) - positions.offsetY + 'px';
        document.body.appendChild(avatar);

        document.body.addEventListener('mousemove', dragging);
        document.body.addEventListener('mousemove', hoverMargins);
        document.body.addEventListener('mouseup', stopDragging);

        document.body.addEventListener('touchmove', dragging);
        document.body.addEventListener('touchmove', hoverMargins);
        document.body.addEventListener('touchend', stopDragging);
      }
    }

    function dragging(event){
      if((event.pageX || event.targetTouches[0].pageX) - positions.offsetX - parseInt(window.getComputedStyle(avatar).marginLeft) + avatar.offsetWidth < document.documentElement.clientWidth + window.pageXOffset)
        avatar.style.left = (event.pageX || event.targetTouches[0].pageX) - positions.offsetX - parseInt(window.getComputedStyle(avatar).marginLeft) + 'px';
      if((event.pageY || event.targetTouches[0].pageY) - positions.offsetY - parseInt(window.getComputedStyle(avatar).marginTop) + avatar.offsetHeight < document.documentElement.clientHeight + window.pageYOffset)
        avatar.style.top = (event.pageY || event.targetTouches[0].pageY) - positions.offsetY - parseInt(window.getComputedStyle(avatar).marginTop) + 'px';
    }

    function stopDragging(event){
      document.body.removeEventListener('mousemove', dragging);
      document.body.removeEventListener('mousemove', hoverMargins);
      document.body.removeEventListener('mouseup', stopDragging);

      document.body.removeEventListener('touchmove', dragging);
      document.body.removeEventListener('touchmove', hoverMargins);
      document.body.removeEventListener('touchend', stopDragging);

      document.body.removeChild(avatar);
      avatar = null;
      var draggable = ifc.querySelector('.margin-bottom[draggable]');
      var droppable = ifc.querySelector('.padding-top[droppable]');
      if(draggable){
        draggable.style.transition = 'none';
        var fromName = draggingElem.parentNode.getAttribute('id');
        var toName = draggable.parentNode.getAttribute('id');
        var toIndex = Array.prototype.indexOf.call(draggable.parentNode.getElementsByTagName('DIV'), draggable) + 1;
        angular.element(document.body).scope().movePlate({obj: fromName, ind: draggingIndex}, {obj: toName, ind: toIndex});
      }else if(droppable){
        droppable.style.transition = 'none';
        var fromName = draggingElem.parentNode.getAttribute('id');
        var toName = droppable.getAttribute('id');
        var toIndex = 0;
        angular.element(document.body).scope().movePlate({obj: fromName, ind: draggingIndex}, {obj: toName, ind: toIndex});
      }
      draggingElem.style.display = 'block';
      hoverMarginsReset();
      draggingElem = hoveredPrevious = previousDroppable = null;
    }
    //Регулирует отступы во время наведения
    function hoverMargins(event){
      var checkPoint = {x: (event.pageX || event.targetTouches[0].pageX), y: avatar.getBoundingClientRect().top - 1};
      hovered = document.elementFromPoint(checkPoint.x, checkPoint.y);
      if(hovered == avatar) return;
      while(hovered != document.documentElement){
        if(hovered === null) return;
        if((hovered.hasAttribute('draggable') || hovered.hasAttribute('droppable')) && hasParent(hovered, ifc)) break;
        hovered = hovered.parentNode;
      }
      if(hovered.style.transition) hovered.style.transition = null;
      if(hovered.hasAttribute('droppable') && checkPoint.y - hovered.getBoundingClientRect().top < parseInt(window.getComputedStyle(hovered).paddingTop) + parseInt(window.getComputedStyle(hovered).paddingTop)){
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
      //draggingElem.classList.remove('margin-top');
      var allElems = ifc.querySelectorAll('[draggable]');
      for(var i = 0; i < allElems.length; i++)
        allElems[i].classList.remove('margin-bottom');
      allElems = ifc.querySelectorAll('[droppable]');
      for(var i = 0; i < allElems.length; i++)
        allElems[i].classList.remove('padding-top');
    }

    function removePrepearing(event){
      document.body.removeEventListener('mousemove', prepearDrag);
      document.body.removeEventListener('touchmove', prepearDrag);
    }
  }

  function ChangableField(elem){
    var ifc = elem;
    ifc.addEventListener('dblclick', editText);
    ifc.addEventListener('touchstart', editText);
    ifc.addEventListener('touchstart', checkClick);

    function checkClick(event){
      if(event.target.classList.contains('del')){
        var ind = Array.prototype.indexOf.call(event.target.parentNode.parentNode.getElementsByTagName('DIV'), event.target.parentNode)
        angular.element(document.body).scope().delPlate(ind, event.target.parentNode.parentNode.getAttribute('id'));
        angular.element(document.body).scope().$apply();
      }
    }

    function editText(event){
      var target = event.target;
      while(!target.hasAttribute('contenteditable')){
        target = target.parentNode;
        if(target == ifc) return;
      }
      //Для передвижения каретки в конец
      target.focus();
      var range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

//Angular
var app = angular.module('application', []).controller('appController', function($scope){
  $scope.todo = [{title: 'Title1', description: 'Description1'}];
  $scope.inProgress = [{title: 'Title2', description: 'Description2'}];
  $scope.done = [{title: 'Title3', description: 'Description3'}];
  $scope.forTest = "";

  $scope.addPlate = function(){
    if($scope.newTitle.length != 0 && $scope.newDescription.length != 0){
      $scope.todo.push({title: $scope.newTitle, description: $scope.newDescription});
      $scope.newTitle = $scope.newDescription = '';
    }
  }

  $scope.delPlate = function(index, arr){
    $scope[arr].splice(index, 1);
  }

  $scope.movePlate = function(from, to){
    var elem = {title: $scope[from.obj][from.ind].title, description: $scope[from.obj][from.ind].description};
    $scope[from.obj].splice(from.ind, 1);
    $scope[to.obj].splice(to.ind, 0, elem);
    $scope.$apply();
  }
});
//Для contenteditable
app.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      // view -> model
      element.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(element.html());
        });
      });

      // model -> view
      ctrl.$render = function() {
        element.html(ctrl.$viewValue);
      };

      // load init value from DOM
      ctrl.$render();
    }
  };
});

new DragField(document.getElementById('interface'));
new ChangableField(document.getElementById('interface'));