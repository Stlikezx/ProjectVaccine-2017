angular.module('starter.controllers', ['ngCordova'])




.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

    .controller('mainCtrl', function ($scope, $ionicModal, $cordovaSQLite, $ionicListDelegate, $ionicPopup, $filter, $ionicActionSheet, $timeout) {

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
            $ionicModal.fromTemplateUrl('templates/03_addProfile.html', function (modal) {
                $scope.addDialog = modal;
            }, {
                    scope: $scope,
                    animation: 'slide-in-up'
                });


            $scope.showAddChangeDialog = function (action) {
                $scope.action = action;
                $scope.addDialog.show();
            };

            $scope.session = function (item) {
                console.log(item);

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
                $ionicModal.fromTemplateUrl('templates/03_addProfile.html', function (modal) {
                    $scope.addDialog = modal;
                }, {
                        scope: $scope,
                        animation: 'slide-in-up'
                    });
            };
            $scope.insertProfile = function (nickname, firstname, lastname, identified, date, gender, bloodtype, country, allergy) {

                var date = $filter('date')(date, 'yyyy-MM-dd');
                var query = "INSERT INTO test (nickname,firstname,lastname,identified,date,gender,bloodtype,country,allergic)VALUES(?,?,?,?,?,?,?,?,?)";
                $cordovaSQLite.execute(db, query, [nickname, firstname, lastname, identified, date, gender, bloodtype, country, allergy]).then(function (res) {
                    console.log("insertId: " + res.insertId);
                }, function (err) {
                    console.error(err);
                });
                $scope.loadDataDisplay();
                this.leaveAddChangeDialog();
            }

            $scope.loadDataDisplay = function () {
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
                    console.log("error" + err);
                });

            }

            $scope.delete = function (item) {
                console.log(item.id);
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete',
                    template: 'Are you sure you want to delete' + ' ' + item.nickname + '  ?'
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


            $scope.download = function () {

                // Show the action sheet
                var hidesheet = $ionicActionSheet.show({
                    buttons: [
                        { text: 'PDF' }, //Index = 0
                        { text: 'Import JSON' }, //Index = 1
                        { text: 'Export JSON' },
                    ],
                    titleText: 'Manage Profile',
                    cancelText: 'Cancel',
                    cancel: function () {
                        // add cancel code..
                    },
                    buttonClicked: function (index) {
                        alert('BUTTON CLICKED' + index);
                        return true; //Close the model?
                    }
                });

                // For example's sake, hide the sheet after two seconds
                $timeout(function () {
                    hideSheet();
                }, 5000);

            };
        }
    )


.controller('menuButtonCtrl', function ($scope, $stateParams, $cordovaSQLite) {

    $scope.id = $stateParams.id;
    $scope.nickname = $stateParams.nickname;
    
})

    .controller('profileData', function ($scope, $stateParams, $cordovaSQLite, $filter, $ionicHistory, $state) {

              $scope.nickname = $stateParams.nickname;
              var id = $stateParams.id;

                var query = "SELECT * FROM test WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function (result) {
                    $scope.firstname = result.rows[0].firstname;
                    $scope.lastname = result.rows[0].lastname;
                    $scope.identified = result.rows[0].identified;
                    var date = $filter('date')(result.rows[0].date, 'dd-MM-yyyy');
                    $scope.dateShow = date;
                    $scope.gender = result.rows[0].gender;
                    $scope.bloodtype = result.rows[0].bloodtype;
                    $scope.country = result.rows[0].country;
                    $scope.allergy = result.rows[0].allergic;
                }, function (error) {
                    console.log("error" + err);
                });

                $scope.clearCache = function () {

                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.profileList');
                }
});
