
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