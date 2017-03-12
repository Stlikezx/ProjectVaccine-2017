
var db=null;

var mainApp = angular.module('mainApp', ['ionic', 'ngRoute', 'firebase', 'ngCordova']);


mainApp.run(function($ionicPlatform, $cordovaSQLite) {
    $ionicPlatform.ready(function () {
        
 
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }


        db = window.openDatabase("Profile.db",1,"demo Sqlite test",2000 );
        $cordovaSQLite.execute(db,"CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nickname TEXT, firstname TEXT, lastname TEXT, identified INTEGER, date NUMERIC , gender TEXT, bloodtype TEXT,country TEXT, allergic TEXT, vcdata TEXT)");

    });
})


//mainApp.config(function($stateProvider, $urlRouterProvider) {
//    $stateProvider

//      .state('app', {
//          url: "/app",
//          abstract: true,
//          templateUrl: "04_menu.html",
//          controller: 'googleCtrl2'
//      })

//      .state('app.home', {
//          url: '/home',
//          views: {
//              'menuContent': {
//                  templateUrl: "02_home.html",
//                  controller: 'googleCtrl2'
//              }
//          }
//      });

//    // if none of the above states are matched, use this as the fallback
//    $urlRouterProvider.otherwise('/app/home');
//});

var config = {
    apiKey: "AIzaSyCg3zxVD2ykqAhypLZe7rZ4ZjtfnnpEL_k",
    authDomain: "project--6603901669083249275.firebaseapp.com",
    databaseURL: "https://project--6603901669083249275.firebaseio.com",
    storageBucket: "project--6603901669083249275.appspot.com",
    messagingSenderId: "924207543766"
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/plus.login');



mainApp.controller('googleCtrl', ['$scope', '$firebaseAuth', '$location',
     function ($scope, $firebaseAuth, $location) {
         $scope.login = function () {
             
                 firebase.auth().signInWithPopup(provider).then(function (result) {
                     var name = result.user.providerData[0].displayName;
                     var photoUrl = result.user.providerData[0].photoURL
                     console.log(result.user.providerData[0]);
                     $scope.$apply();
                     window.localStorage.setItem("name", name);
                     window.localStorage.setItem("photoURL", photoUrl);
                     window.location = "02_home.html"
                 }).catch(function (error) {

                     var errorCode = error.code;
                     var errorMessage = error.message;
                     var email = error.email;
                     var credential = error.credential;
                 });

         };
     }
]);


mainApp.controller('googleCtrl2', ['$scope', '$ionicModal', '$cordovaSQLite', '$ionicListDelegate', '$ionicPopup',
    function ($scope, $ionicModal, $cordovaSQLite, $ionicListDelegate, $ionicPopup) {

        ionic.Platform.ready(function () {
            $scope.loadDataDisplay();
        });

        $scope.name = window.localStorage.getItem("name");
        $scope.photo = window.localStorage.getItem("photoURL");

        $scope.logout = function () {
            firebase.auth().signOut().then(function () {

                window.location = "01_main.html"

            }, function (error) {
                // An error happened.
            });
        };

        // Load the add / change dialog from the given template URL
        $ionicModal.fromTemplateUrl('03_addProfile.html', function (modal) {
            $scope.addDialog = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });


        $scope.showAddChangeDialog = function (action) {
            $scope.action = action;
            $scope.addDialog.show();
        };

        $scope.leaveAddChangeDialog = function () {
            // Remove dialog 
            $scope.addDialog.remove();
            // Reload modal template to have cleared form
            $ionicModal.fromTemplateUrl('03_addProfile.html', function (modal) {
                $scope.addDialog = modal;
            }, {
                scope: $scope,
                animation: 'slide-in-up'
            });
        };
        $scope.insertProfile = function (nickname, firstname, lastname, identified, date, gender, bloodtype, country, allergy) {

            var query = "INSERT INTO test (nickname,firstname,lastname,identified,date,gender,bloodtype,country,allergic)VALUES(?,?,?,?,?,?,?,?,?)";
            $cordovaSQLite.execute(db, query, [nickname,firstname,lastname,identified,date, gender, bloodtype, country,allergy]).then(function(res) {
                console.log("insertId: " + res.insertId);
            }, function (err) {
                console.error(err);
                });
            $scope.loadDataDisplay();
            this.leaveAddChangeDialog();
        }

        $scope.loadDataDisplay = function(){
            $scope.alldata = [];
            $cordovaSQLite.execute(db, "SELECT * FROM test").then(function (result) {
                if (result.rows.length) {
                    for (var i = 0; i < result.rows.length; i++) {
                        $scope.alldata.push(result.rows.item(i));
                    }
                } else {
                    console.log("no data found");   
                }
            }, function (error) {
                console.log("error"+err);
            });

        }

        $scope.delete = function (item) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete',
                    template: 'Are you sure you want to delete' +' '+ item.nickname + '  ?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        var query = "DELETE FROM test WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [item.id]);
                    } else {

                    }
                });

        };
        $scope.share = function (item) {
            alert('Share Item: ' + item.id);
        };

    }
]);
