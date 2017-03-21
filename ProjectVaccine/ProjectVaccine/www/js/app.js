// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var db = null;

angular.module('starter', ['ionic', 'starter.controllers','ngCordova'])

    .run(function ($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    db = window.openDatabase("Profile.db", 1, "demo Sqlite test", 2000);
    $cordovaSQLite.execute(db, "CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nickname TEXT, firstname TEXT, lastname TEXT, identified INTEGER, date DATE , gender TEXT, bloodtype TEXT,country TEXT, allergic TEXT, vcdata TEXT)");

  });
})

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.navBar.alignTitle('center');

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  //    .state('app.tabsMenu', {
  //  url: '/tabsMenu',
  //  views: {
  //    'menuContent': {
  //      templateUrl: 'templates/05_menu.html'
  //    }
  //  }
  // })
  //    .state('app.tabsManage', {
  //  url: '/tabsManage',
  //  views: {
  //    'menuContent': {
  //      templateUrl: 'templates/06_manage.html'
  //    }
  //  }
  //})
  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.profileList', {
      url: '/profileList',
      views: {
        'menuContent': {
          templateUrl: 'templates/01_profileList.html',
          controller: 'mainCtrl'
        }
      }
    })

  .state('app.menuButton', {
    url: '/menuButton/:nickname',
    views: {
      'menuContent': {
        templateUrl: 'templates/02_menuButton.html',
        controller: 'menuButtonCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/profileList');
});
