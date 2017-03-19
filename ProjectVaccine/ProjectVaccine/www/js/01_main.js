
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
        $cordovaSQLite.execute(db,"CREATE TABLE test (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nickname TEXT, firstname TEXT, lastname TEXT, identified INTEGER, date DATE , gender TEXT, bloodtype TEXT,country TEXT, allergic TEXT, vcdata TEXT)");

    });
})


mainApp.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.tabs.position("bottom"); 

    $stateProvider
        .state('tabs', {
            url: '/tab',
            controller: 'TabsCtrl',
            templateUrl: '07_tabs.html'
        })
        .state('home', {
            url: '/home',
            views: {
                'home': {
                    templateUrl: '02_home.html',
                    controller: 'mainCtrl'
                }
            }
        })
        .state('tabs.menu', {
            url: '/menu',
            views: {
                'menu-tab': {
                    templateUrl: '05_menu.html'
                }
            }
        })
        .state('tabs.manage', {
            url: '/manage',
            views: {
                'manage-tab': {
                    templateUrl: '06_manage.html'
                }
            }
        })

    $urlRouterProvider.otherwise('/tab');
});

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


mainApp.controller('mainCtrl', ['$scope', '$ionicModal', '$cordovaSQLite', '$ionicListDelegate', '$ionicPopup','$filter',
    function ($scope, $ionicModal, $cordovaSQLite, $ionicListDelegate, $ionicPopup, $filter) {

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

        $scope.saveEmpty = function () {
            $scope.nickname = '';
            $scope.firstname = '';
            $scope.lastname = '';
            $scope.identified = '';
            $scope.date = '';
            $scope.gender = '';
            $scope.bloodtype = '';
            $scope.country = '';
            $scope.allergy = '';
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

            var date = $filter('date')(date, 'yyyy-MM-dd'); 
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
                console.log(item.id);
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete',
                    template: 'Are you sure you want to delete' +' '+ item.nickname + '  ?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        var query = "DELETE FROM test WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [item.id]);
                        $scope.loadDataDisplay();
                    } else {

                    }
                });

        };
        $scope.edit = function (item, action) {
            $scope.action = action;
            var query = "SELECT * FROM test WHERE id = ?";
            $cordovaSQLite.execute(db, query, [item.id]).then(function (result) {
                $scope.nickname = result.rows[0].nickname;
                $scope.firstname = result.rows[0].firstname;
                $scope.lastname = result.rows[0].lastname;
                $scope.identified = result.rows[0].identified;
                $scope.dateShow = result.rows[0].date;
                $scope.gender = result.rows[0].gender;
                $scope.bloodtype = result.rows[0].bloodtype;
                $scope.country = result.rows[0].country;
                $scope.allergy = result.rows[0].allergic;
                window.localStorage.setItem("itemId", item.id);
            }, function (error) {
                console.log("error" + err);
            });
            $scope.addDialog.show();
            

        };

        $scope.editProfile = function (nickname, firstname, lastname, identified, date, gender, bloodtype, country, allergy) {

            var itemId = window.localStorage.getItem("itemId");
            var date = $filter('date')(date, 'yyyy-MM-dd'); 
            var query = "UPDATE test SET nickname = ?,firstname = ? ,lastname = ?,identified = ?,date = ?,gender = ?,bloodtype = ?,country = ?,allergic = ? WHERE id = ?"
            $cordovaSQLite.execute(db, query, [nickname, firstname, lastname, identified, date, gender, bloodtype, country, allergy, itemId]);
            this.leaveAddChangeDialog();
            $scope.loadDataDisplay();
        };

        $scope.clicker = function (item) {

            window.localStorage.setItem("itemId", item.id);
            window.localStorage.setItem("itemNickname", item.nickname);
            window.location = "04_indexMenu.html";
        };
    }
]);

mainApp.controller('indexMenuCtrl', function ($scope, $ionicSideMenuDelegate) {

    var itemId = window.localStorage.getItem("itemId");
    $scope.itemNickname = window.localStorage.getItem("itemNickname");

});


mainApp.controller('TabsCtrl', function ($scope, $ionicSideMenuDelegate) {

    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

});

mainApp.controller('menuCtrl', function ($scope, $ionicSideMenuDelegate) {

    $scope.clickMenuProfile = function () {

        alert("ok");
    }

});

mainApp.controller('manageCtrl', function ($scope, $ionicSideMenuDelegate) {

    $scope.clickImport = function () {
        alert("ok");
    }

});
