var app = angular.module('groceryListApp', ['ngRoute','ui.router']);

/* ng Route */
// app.config(['$routeProvider',function($routeProvider) {
// 	$routeProvider
// 	.when("/", {
// 		templateUrl: "views/groceryList.html", 			
// 		controller: "HomeController"
// 	})
// 	.when("/addItem", {
// 		templateUrl: "views/addItem.html", 			
// 		controller: "GroceryListItemController"
// 	})
// 	.when("/addItem/edit/:id/", {
// 		templateUrl: "views/addItem.html", 			
// 		controller: "GroceryListItemController"
// 	})
// 	.otherwise({
// 		redirectTo: "/"
// 	});
// }]);

/* Ui router */


app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state("home", {
		url: '/',
		templateUrl: "views/groceryList.html", 			
		controller: "HomeController"
	})
	.state("addItem", {
		url: "/addItem",
		templateUrl: "views/addItem.html", 			
		controller: "GroceryListItemController"
	})
	.state("editItem", {
		url: "/addItem/edit/:id",
		templateUrl: "views/addItem.html", 			
		controller: "GroceryListItemController"		
	});
	
});

app.service('GroceryService', function($http){

	var groceryService = {};

	groceryService.groceryItems = [];

	$http.get("data/server_data.json")
		.then(function(data){
			groceryService.groceryItems = data.data;
			for (var item in groceryService.groceryItems) {
				groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
			}
		},
		function(data, status) {
			alert("error");
		});

	groceryService.getNewId = function() {
		if(groceryService.newId) {
			groceryService.newId++;			
		}else {
			var maxId = _.max(groceryService.groceryItems, function(entry){return entry.id} )
			groceryService.newId = maxId.id + 1;
		}
		return groceryService.newId;
	};

	groceryService.findById = function(id){
		for (var itemIndex in groceryService.groceryItems) {
			if(groceryService.groceryItems[itemIndex].id === id)
				return groceryService.groceryItems[itemIndex];			
		}
	};
	groceryService.removeItem = function(entry) {

		$http.post("data/delete_item.json", {id: entry.id})
				.then(function(data){
					if(data.data.status) {
						var index = groceryService.groceryItems.indexOf(entry);
						groceryService.groceryItems.splice(index, 1);
					}
				},function(data, status){

				});

		// var index = groceryService.groceryItems.indexOf(entry);
		// groceryService.groceryItems.splice(index, 1);
	};
	groceryService.markCompleted = function(entry) {
		entry.completed = !entry.completed;
	};

	groceryService.save = function(entry) {

		var updatedItem = groceryService.findById(entry.id);
		if(updatedItem){

			$http.post("data/update_item.json")
				.then(function(data){
					if(data.data.status == 1) {
						updatedItem.completed = entry.completed;
						updatedItem.itemName = entry.itemName;
						updatedItem.date = entry.date
					}
				},function(data, status){

				});


			
		} else {

			$http.post("data/added_item.json", entry)
				.then(function(data){
					entry.id = data.data.newId;
				},
				function(data, status){
					alert("error");
				});
;
			// entry.id = groceryService.getNewId();
			groceryService.groceryItems.push(entry);		
		}
	}
	return groceryService;
});

app.controller('HomeController', ['$scope','GroceryService', function($scope, GroceryService){
	$scope.groceryItems = GroceryService.groceryItems;

	$scope.removeItem  = function(entry) {
		GroceryService.removeItem(entry);
	};

	$scope.markCompleted = function(entry) {
		GroceryService.markCompleted(entry);
	};

}]);

// ng -route
// app.controller('GroceryListItemController', ['$scope','$routeParams', '$location','GroceryService',function($scope, $routeParams, $location, GroceryService){
// 	if(!$routeParams.id) {
// 		$scope.groceryItem = {id: 0, completed: true, itemName: 'Grocery Item Z', date: new Date() };
// 	} else {
// 		$scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
// 	}
// 	$scope.save = function(){
// 		GroceryService.save($scope.groceryItem);
// 		$location.path("/");
// 	}	


// 	// $scope.rp = "Route Parameter value: "+$routeParams.id+" "+$routeParams.cat;
// }]);


// ui router
app.controller('GroceryListItemController', ['$scope','$stateParams', '$location','GroceryService',function($scope, $stateParams, $location, GroceryService){
	console.log($stateParams.id);
	if(!$stateParams.id) {
		$scope.groceryItem = {id: 0, completed: true, itemName: 'Grocery Item Z', date: new Date() };
	} else {
		$scope.groceryItem = _.clone(GroceryService.findById(parseInt($stateParams.id)));
	}
	$scope.save = function(){
		GroceryService.save($scope.groceryItem);
		$location.path("/");
	}	


	// $scope.rp = "Route Parameter value: "+$routeParams.id+" "+$routeParams.cat;
}]);


app.directive("tbGroceryItem", function(){
	return {
		restrict: "E",
		templateUrl: "views/groceryItem.html"
	};
});






// for debugging chrome console
// angular.element(document.body).injector().get('GroceryService');