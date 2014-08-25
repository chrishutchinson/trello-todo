'use strict';

/**
 * @ngdoc function
 * @name trelloTodoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the trelloTodoApp
 */
angular.module('trelloTodoApp')
  .controller('MainCtrl', function ($scope) {
  	$scope.config = {
  		lists: {
  			'New Task': {
  				class: 'type-1',
  				id: '',
  			},
  			'Next Item': {
  				class: 'type-2',
  				id: '',
  			},
  			'Item Started': {
  				class: 'type-3',
  				id: '',
  			},
  			'Item Halfway Complete': {
  				class: 'type-4',
  				id: '',
  			},
  			'Item Complete': {
  				class: 'type-5',
  				id: '',
  			},
  			'Item Cancelled': {
  				class: 'type-6',
  				id: '',
  			},
  		}
  	};

  	/**
  	* Authorize the user
  	*/
  	$scope.trelloAuthorize = function() {
  		window.Trello.authorize({
  			type: 'popup',
	  		scope: { read: true, write: true, account: false },
	  		success: $scope.trelloSuccess,
	  		error: $scope.trelloError
	  	});
	};

	/**
	* Set the user as logged in or logged out
	*/
	$scope.trelloLoggedIn = function() {
		$scope.authorized = window.Trello.authorized();
	};

	/**
	* Callback on successful authorization
	*/
	$scope.trelloSuccess = function() {
		$scope.trelloLoggedIn();

		$scope.trelloGetMe();
		$scope.trelloGetBoards();
	};

	/**
	* Get the current user data from Trello
	*/
	$scope.trelloGetMe = function() {
		window.Trello.members.get('me').then(function(member) {
			$scope.setMember(member);
			$scope.$apply();
	    });
	};

	/**
	* Set the member data into the scope
	*/
	$scope.setMember = function(member) {
		$scope.member = member;
	};

	/**
	* Get the current users cards
	*/
	$scope.trelloGetCards = function() {
		window.Trello.get('members/me/cards').then(function(cards) {
			$scope.setCards(cards);
			$scope.$apply();
		});
	};

	/**
	* Set the user card data to the scope
	*/
	$scope.setCards = function(cards) {
		$scope.cards = cards;
	};

	/**
	* Get the current users boards
	*/
	$scope.trelloGetBoards = function() {
		window.Trello.get('members/me/boards').then(function(boards) {
			$scope.setBoards(boards);
			$scope.$apply();
		});
	};

	/**
	* Set the user boards data to the scope
	*/
	$scope.setBoards = function(boards) {
		$scope.boards = boards;
	};

	/**
	* Get the specified board
	*/
	$scope.trelloGetBoard = function(boardID) {
		window.Trello.get('boards/' + boardID).then(function(board) {
			$scope.setBoard(board);
			$scope.$apply();
		});
	};

	/**
	* Set the board data to the scope
	*/
	$scope.setBoard = function(board) {
		$scope.board = board;
	};

	/**
	* Get the specified board
	*/
	$scope.trelloCheckBoardListsMatch = function(boardID) {
		window.Trello.get('boards/' + boardID + '/lists').then(function(lists) {
			var listCount = Object.keys($scope.config.lists).length;
			angular.forEach(lists, function(list){
				while(listCount > 0){
					if(typeof $scope.config.lists[list.name] !== 'undefined'){
						listCount--;
					} else {
						break;
					}
				}
			});

			if(listCount === 0){
				// All lists found, yay
				window.Trello.get('boards/' + boardID + '/lists').then(function(lists){
					$scope.lists = [];
					angular.forEach(lists, function(list){
						$scope.lists[list.id] = {
							name: list.name,
							class: $scope.config.lists[list.name].class,
							id: list.id,
						};
						$scope.config.lists[list.name].id = list.id;
					});

					window.Trello.get('boards/' + boardID + '/cards').then(function(cards) {
						var newCards = [];
						angular.forEach(cards, function(card, i){
							card.list = $scope.lists[card.idList];
							card.open = false;
							newCards[i] = card;
						});
						$scope.setCards(newCards);
						$scope.$apply();
					});
				});
				
				$scope.clearMessage();
			} else {
				// Not all lists found, boo
				$scope.errorMessage('This board does not contain all the required lists');
			}

			$scope.$apply();
		});
	};

	/**
	* Callback on Trello error
	*/
	$scope.trelloError = function() {
		$scope.messages = [
			{type: 'error', message: 'Unable to authorize'},
		];
	};

	/**
	* Handle a request to disconnect from Trello
	*/
	$scope.trelloLogout = function() {
	    window.Trello.deauthorize();
	    $scope.trelloLoggedIn();
	};

	/**
	* Run authorization on load
	*/
	window.Trello.authorize({
	    interactive: false,
	    success: $scope.trelloSuccess
	});

	$scope.$watch('selectedBoard', function(boardID){
		if(typeof boardID !== 'undefined'){
			$scope.trelloGetBoard(boardID);
			$scope.trelloCheckBoardListsMatch(boardID);
		}
	});

	$scope.sendMessage = function(type, message) {
		$scope.message = {
			type: type,
			message: message
		};
		$scope.$apply();
	};

	$scope.errorMessage = function(message) {
		$scope.sendMessage('danger', message);
	};

	$scope.successMessage = function(message) {
		$scope.sendMessage('success', message);
	};

	$scope.clearMessage = function() {
		$scope.message = null;
		$scope.$apply();
	};
  });
