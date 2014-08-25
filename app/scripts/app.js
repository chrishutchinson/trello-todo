'use strict';

/**
 * @ngdoc overview
 * @name trelloTodoApp
 * @description
 * # trelloTodoApp
 *
 * Main module of the application.
 */
angular
  .module('trelloTodoApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
