﻿angular.module('starter.controllers', ['ngCordova'])




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
                $scope.dateShow = '';
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

                console.log(country);
                if (country == "")
                {
                    alert('You must choose country');
                }
                else
                {
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
})


    .controller('vaccineData', function ($scope,$ionicModal,$stateParams, $cordovaSQLite, $filter, $ionicHistory, $state) {

    $scope.nickname = $stateParams.nickname;
    var id = $stateParams.id;

    $ionicModal.fromTemplateUrl('templates/06_addVaccineData.html', function (modal) {
        $scope.addVaccineData = modal;
    },
        {
            scope: $scope,
            animation: 'slide-in-up'
        });

      var query = "SELECT * FROM test WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id]).then(function (result) {

                    var country = result.rows[0].country;
                    id = result.rows[0].id;
                    var vcdata = result.rows[0].vcdata;

                    if (country == 'Thailand' && vcdata == null)
                    {
                        var itemGrps = {
                            vaccine: [
                                {
                                    index: 1,
                                    title: 'Birth',
                                    items:
                                    [{ vid: 'BCG', vcname: 'BCG', location: '', date: '', vcdescription: '', range: 0, status: false },
                                    { vid: 'HBV1', vcname: 'HBV 1st', location: '', date: '', vcdescription: '', range: 0, status: false }]
                                },
                                {
                                    index: 2,
                                    title: '1 month',
                                    items:
                                    [{ vid: 'HBV2', vcname: 'HBV 2st', location: '', date: '', vcdescription: '', range: 30, status: false }]
                                },
                                {
                                    index: 3,
                                    title: '2 month',
                                    items:
                                    [{ vid: 'DTwP-HB1', vcname: 'DTwP-HB 1st', location: '', date: '', vcdescription: '', range: 60, status: false },
                                    { vid: 'OPV1', vcname: 'OPV 1st', location: '', date: '', vcdescription: '', range: 60, status: false }]
                                },
                                {
                                    index: 4,
                                    title: '4 month',
                                    items:
                                    [{ vid: 'DTwP-HB2', vcname: 'DTwP-HB 2nd', location: '', date: '', vcdescription: '', range: 120, status: false },
                                    { vid: 'OPV2+IPV', vcname: 'OPV 2nd + IPV', location: '', date: '', vcdescription: '', range: 120, status: false }]
                                },
                                {
                                    index: 5,
                                    title: '6 month',
                                    items:
                                    [{ vid: 'DTwP-HB3', vcname: 'DTwP-HB 3rd', location: '', date: '', vcdescription: '', range: 180, status: false },
                                    { vid: 'OPV3', vcname: 'OPV 3rd', location: '', date: '', vcdescription: '', range: 180, status: false }]
                                },
                                {
                                    index: 6,
                                    title: '9 month',
                                    items:
                                    [{ vid: 'MRR1', vcname: 'MRR 1st', location: '', date: '', vcdescription: '', range: 360, status: false },
                                    { vid: 'JE1', vcname: 'JE 1st', location: '', date: '', vcdescription: '', range: 360, status: false }]
                                },
                                {
                                    index: 7,
                                    title: '18 month',
                                    items:
                                    [{ vid: 'DTwPA1', vcname: 'DTwP Active 1st', location: '', date: '', vcdescription: '', range: 540, status: false },
                                    { vid: 'OPVA1', vcname: 'OPV Active 1st', location: '', date: '', vcdescription: '', range: 540, status: false }]
                                },
                                {
                                    index: 8,
                                    title: '2 year 6 month',
                                    items:
                                    [{ vid: 'MRR2', vcname: 'MRR 1st', location: '', date: '', vcdescription: '', range: 900, status: false },
                                    { vid: 'JE2', vcname: 'JE 2nd', location: '', date: '', vcdescription: '', range: 900, status: false }]
                                },
                                {
                                    index: 9,
                                    title: '4 year - 6 year',
                                    items:
                                    [{ vid: 'DTwPA2', vcname: 'DTwP Active 2nd', location: '', date: '', vcdescription: '', range: 2160, status: false },
                                    { vid: 'OPVA2', vcname: 'OPV Active 2nd', location: '', date: '', vcdescription: '', range: 2160, status: false }]
                                },
                                {
                                    index: 10,
                                    title: '11 year - 12 year',
                                    items:
                                    [{ vid: 'Td', vcname: 'TD', location: '', date: '', vcdescription: '', range: 4320, status: false },]
                                },
                            ]
                        };

                        var JsonStringVaccine = JSON.stringify(itemGrps, null, '\t');
                        var query = "UPDATE test SET vcdata = ? WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [JsonStringVaccine, id]);
                        $scope.loadJsondataVaccine();

                    }
                    else if (country == 'US' && vcdata == null)
                    {
                        var itemGrps = {
                            vaccine: [
                                {
                                    index: 1,
                                    title: 'Birth',
                                    items:
                                    [{ vid: 'HepB1', vcname: 'HepB 1st', location: '', date: '', vcdescription: '', range: 0, status: false }]
                                },
                                {
                                    index: 2,
                                    title: '1 month',
                                    items:
                                    [{ vid: 'HepB2', vcname: 'HepB 2nd', location: '', date: '', vcdescription: '', range: 60, status: false }]
                                },
                                {
                                    index: 3,
                                    title: '2 month',
                                    items:
                                    [{ vid: 'RV1', vcname: 'RV 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'DTaP1', vcname: 'DTaP 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib1', vcname: 'Hib 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV1', vcname: 'PCV 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'IPV1', vcname: 'IPV 1st', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 4,
                                    title: '4 month',
                                    items:
                                    [{ vid: 'RV2', vcname: 'RV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'DTaP2', vcname: 'DTaP 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib2', vcname: 'Hib 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV2', vcname: 'PCV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'IPV2', vcname: 'IPV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 5,
                                    title: '6 month',
                                    items:
                                    [{ vid: 'HepB3', vcname: 'HepB 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'RV3', vcname: 'RV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'DTaP3', vcname: 'DTaP 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib3', vcname: 'Hib 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV3', vcname: 'PCV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'IPV3', vcname: 'IPV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Influenza', vcname: 'Influenza', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    ]
                                },
                                {
                                    index: 6,
                                    title: '12 month',
                                    items:
                                    [{ vid: 'Hib4', vcname: 'Hib 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV4', vcname: 'PCV 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MRR1', vcname: 'MRR 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Varicella1', vcname: 'Varicella 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'HepA1', vcname: 'HepA 1st', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 7,
                                    title: '15 month',
                                    items:
                                    [{ vid: 'DTaP4', vcname: 'DTaP 4th', location: '', date: '', vcdescription: '', range: 30, status: false }]
                                },
                                {
                                    index: 8,
                                    title: '4 year - 6 year',
                                    items:
                                    [{ vid: 'DTaP5', vcname: 'DTaP 5th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'IPV4', vcname: 'IPV 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MRR2', vcname: 'MRR 2rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Varicella2', vcname: 'Varicella 2rd', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                            ]
                        };

                        var JsonStringVaccine = JSON.stringify(itemGrps, null, '\t');
                        console.log(JsonStringVaccine);
                        var query = "UPDATE test SET vcdata = ? WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [JsonStringVaccine, id]);
                        $scope.loadJsondataVaccine();
                    }
                    else if (country == 'England' && vcdata == null) {
                        var itemGrps = {
                            vaccine: [
                                {
                                    index: 1,
                                    title: '2 month',
                                    items:
                                    [{ vid: 'DTaP+IPV+Hib1', vcname: 'DTaP+IPV+Hib 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MenB1', vcname: 'MenB 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Rotavirus1', vcname: 'Rotavirus 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV1', vcname: 'PCV 1st', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 2,
                                    title: '3 month',
                                    items:
                                    [{ vid: 'DTaP+IPV+Hib 2', vcname: 'DTaP+IPV+Hib 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Rotavirus2', vcname: 'Rotavirus 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    ]
                                },
                                {
                                    index: 3,
                                    title: '4 month',
                                    items:
                                    [{ vid: 'DTaP+IPV+Hib 3', vcname: 'DTaP/IPV/Hib 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MenB2', vcname: 'MenB 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV2', vcname: 'PCV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 4,
                                    title: '12 month',
                                    items:
                                    [{ vid: 'Hib4/MenC1', vcname: 'Hib 4th /MenC 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MenB3', vcname: 'MenB 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'PCV3', vcname: 'PCV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MMR1', vcname: 'MMR 1st', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 5,
                                    title: '3 - 4 year',
                                    items:
                                    [{ vid: 'DTaP+IPV 4', vcname: 'DTaP+IPV 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MMR2', vcname: 'MMR 2nd', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 6,
                                    title: '12 - 13 year',
                                    items:
                                    [{ vid: 'MenACWY1', vcname: 'MenACWY 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'HPV x2', vcname: 'MMR 2nd', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 7,
                                    title: '13 - 18 year',
                                    items:
                                    [{ vid: 'Td1 + IPV5', vcname: 'Td 1st + IPV 5th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'HPV x2', vcname: 'HPV x2', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                            ]
                        };

                        var JsonStringVaccine = JSON.stringify(itemGrps, null, '\t');
                        console.log(JsonStringVaccine);
                        var query = "UPDATE test SET vcdata = ? WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [JsonStringVaccine, id]);
                        $scope.loadJsondataVaccine();
                    }
                    else if (country == 'Australia' && vcdata == null) {
                        var itemGrps = {
                            vaccine: [
                                {
                                    index: 1,
                                    title: 'Birth',
                                    items:
                                    [{ vid: 'HepB1', vcname: 'HepB 1st', location: '', date: '', vcdescription: '', range: 0, status: false }]
                                },
                                {
                                    index: 2,
                                    title: '2 month',
                                    items:
                                    [{ vid: 'HepB2', vcname: 'HepB 2nd', location: '', date: '', vcdescription: '', range: 60, status: false },
                                    { vid: 'DTPa1', vcname: 'DTPa 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib1', vcname: 'Hib 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: '13vPCV1', vcname: '13vPCV 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'RV1', vcname: 'RV 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    
                                    ]
                                },
                                {
                                    index: 3,
                                    title: '4 month',
                                    items:
                                    [{ vid: 'HepB3', vcname: 'HepB 3rd', location: '', date: '', vcdescription: '', range: 60, status: false },
                                    { vid: 'DTPa2', vcname: 'DTPa 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib2', vcname: 'Hib 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: '13vPCV2', vcname: '13vPCV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'RV2', vcname: 'RV 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },

                                    ]
                                },
                                {
                                    index: 4,
                                    title: '6 month',
                                    items:
                                    [{ vid: 'HepB4', vcname: 'HepB 4th', location: '', date: '', vcdescription: '', range: 60, status: false },
                                    { vid: 'DTPa3', vcname: 'DTPa 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Hib3', vcname: 'Hib 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: '13vPCV3', vcname: '13vPCV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'RV3', vcname: 'RV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },

                                    ]
                                },
                                {
                                    index: 5,
                                    title: '12 month',
                                    items:
                                    [{ vid: 'HepA1', vcname: 'HepA 1st', location: '', date: '', vcdescription: '', range: 60, status: false },
                                    { vid: 'Hib4', vcname: 'Hib 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: '13vPCV3', vcname: '13vPCV 3rd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MMR1', vcname: 'MMR 1st', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MenCCV', vcname: 'MenCCV', location: '', date: '', vcdescription: '', range: 30, status: false }

                                    ]
                                },
                                {
                                    index: 6,
                                    title: '18 month',
                                    items:
                                    [{ vid: 'DTPa4', vcname: 'DTPa 4th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'MMR2', vcname: 'MMR 2nd', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'Varicella', vcname: 'Varicella', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 7,
                                    title: '4 year',
                                    items:
                                    [{ vid: 'DTPa5', vcname: 'DTPa 5th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'IPV4', vcname: 'IPV 5th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: '23vPPV1', vcname: '23vPPV 1st', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                                {
                                    index: 8,
                                    title: '10-15 year',
                                    items:
                                    [{ vid: 'DTPa6', vcname: 'DTPa 6th', location: '', date: '', vcdescription: '', range: 30, status: false },
                                    { vid: 'HPV', vcname: 'HPV', location: '', date: '', vcdescription: '', range: 30, status: false }
                                    ]
                                },
                            ]
                        };

                        var JsonStringVaccine = JSON.stringify(itemGrps, null, '\t');
                        console.log(JsonStringVaccine);
                        var query = "UPDATE test SET vcdata = ? WHERE id = ?";
                        $cordovaSQLite.execute(db, query, [JsonStringVaccine, id]);
                        $scope.loadJsondataVaccine();
                    }
                    else {
                        $scope.loadJsondataVaccine();
                    }
                   


                }, function (error) {
                    console.log("error" + err);
                });
    
   

    $scope.loadJsondataVaccine = function () {

        var query = "SELECT vcdata FROM test WHERE id = ? ";
        $cordovaSQLite.execute(db,query,[id]).then(function (result) {

            var json = JSON.parse(result.rows[0].vcdata);
            $scope.vcdata = json;
        }, function (error) {
            console.log("error" + err);
        });

     }


    $scope.clickVcdata = function (item) {

        var query = "SELECT vcdata FROM test WHERE id = ? ";
        $cordovaSQLite.execute(db, query, [id]).then(function (result) {

            var json = JSON.parse(result.rows[0].vcdata);

            for (i = 0; i < json.vaccine.length; i++)
            {

                for (j = 0; j < json.vaccine[i].items.length; j++) {
                    if (item.vid == json.vaccine[i].items[j].vid && item.status == false) {
                        window.localStorage.setItem("vid", item.vid);
                        $scope.vcname = item.vcname;
                        $scope.action = 'insertVaccineData';
                        $scope.addVaccineData.show();
                    }
                    else if (item.vid == json.vaccine[i].items[j].vid && item.status == true) {

                        var dateVaccine = new Date(json.vaccine[i].items[j].date);
                        var date = $filter('date')(dateVaccine, 'yyyy-MM-dd');

                        window.localStorage.setItem("vid", item.vid);
                        $scope.location = json.vaccine[i].items[j].location;
                        $scope.dateShowVaccineData = date;
                        $scope.vcDescription = json.vaccine[i].items[j].vcdescription;
                        $scope.action = 'editVaccineData';
                        $scope.addVaccineData.show();

                    }
                    
                }

            }

        }, function (error) {
            console.log("error" + err);
        });


    }

    $scope.insertVaccinedata = function (location, dateVaccine, vcDescription) {

        var vid = window.localStorage.getItem("vid");

        var query = "SELECT vcdata FROM test WHERE id = ? ";
        $cordovaSQLite.execute(db, query, [id]).then(function (result) {

            var json = JSON.parse(result.rows[0].vcdata);

            for (i = 0; i < json.vaccine.length; i++) {

                for (j = 0; j < json.vaccine[i].items.length; j++) {
                    if (vid == json.vaccine[i].items[j].vid) {

                        var date = $filter('date')(dateVaccine, 'yyyy-MM-dd');
                        json.vaccine[i].items[j].location = location;
                        json.vaccine[i].items[j].date = date;
                        json.vaccine[i].items[j].vcdescription = vcDescription;
                        json.vaccine[i].items[j].status = true;
                    }

                }

            }

            var jsonVaccine = JSON.stringify(json, null, '\t');
            console.log(jsonVaccine);
            var query = "UPDATE test SET vcdata = ? WHERE id = ?";
            $cordovaSQLite.execute(db, query, [jsonVaccine, id]);
            $scope.leaveAddVaccineData();
            $scope.loadJsondataVaccine();
        }, function (error) {
            console.log("error" + err);
        });

    }


    $scope.editVaccinedata = function (location, dateVaccine, vcDescription) {

        var vid = window.localStorage.getItem("vid");

        var query = "SELECT vcdata FROM test WHERE id = ? ";
        $cordovaSQLite.execute(db, query, [id]).then(function (result) {

            var json = JSON.parse(result.rows[0].vcdata);

            for (i = 0; i < json.vaccine.length; i++) {

                for (j = 0; j < json.vaccine[i].items.length; j++) {
                    if (vid == json.vaccine[i].items[j].vid) {

                        var date = $filter('date')(dateVaccine, 'yyyy-MM-dd');
                        json.vaccine[i].items[j].location = location;
                        json.vaccine[i].items[j].date = date;
                        json.vaccine[i].items[j].vcdescription = vcDescription;
                        json.vaccine[i].items[j].status = true;
                    }

                }

            }

            var jsonVaccine = JSON.stringify(json, null, '\t');
            console.log(jsonVaccine);
            var query = "UPDATE test SET vcdata = ? WHERE id = ?";
            $cordovaSQLite.execute(db, query, [jsonVaccine, id]);
            $scope.leaveAddVaccineData();
            $scope.loadJsondataVaccine();
        }, function (error) {
            console.log("error" + err);
        });

    }

    $scope.leaveAddVaccineData = function () {
        // Remove dialog 

        $scope.location = '';
        $scope.dateShow = '';
        $scope.vcDescription = '';

        $scope.addVaccineData.remove();
        // Reload modal template to have cleared form
        $ionicModal.fromTemplateUrl('templates/06_addVaccineData.html', function (modal) {
            $scope.addVaccineData = modal;
        }, {
                scope: $scope,
                animation: 'slide-in-up'
            });
    };

    $scope.clearCache = function () {

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.profileList');
    }
});
