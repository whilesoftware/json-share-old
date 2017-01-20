the_module = angular.module('jsonHelper', ['ui.router']);

the_module.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'view/home.html',
        controller: 'homeController'
      })
      .state('document', {
        url: '/{shortid}',
        templateUrl: 'view/document.html',
        controller: 'documentController',
        resolve: {
          resolved_doc: [
            '$stateParams',
            'documents',
            function($stateParams, posts) {
              return documents.get($stateParams.shortid);
            }
          ]
        }
      });

    $urlRouterProvider.otherwise('/whoops');
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.cache = true;
  }
]);

the_module.service(
  'documents',
  [
    '$http',
    function($http) {
      var self = this;

      self.get = function(shortid) {
        return $http( {
          method: 'GET',
          url: '/api/document/' + shortid
        });
      };

      self.get_games_list = function() {

        return $http( { method: 'GET', url: '/api/games' })
          .then(function(response) {
            self.games = response.data;
            console.log(JSON.stringify(self.games));
          },function() {
            $log.debug('failed to fetch /api/games');
          });
      };
    }
  ]
);

the_module.controller(
  'homeController',
  [
    '$scope',
    '$window',
    function ($scope, $window) {
      $scope.window = $window;
    }
  ]
);

the_module.controller(
  'documentController',
  [
    '$scope',
    'resolved_doc',
    function ($scope, resolved_doc) {
      $scope.document = resolved_doc.data;
      console.log('document: ' + JSON.stringify($scope.document));
    }
  ]
);

