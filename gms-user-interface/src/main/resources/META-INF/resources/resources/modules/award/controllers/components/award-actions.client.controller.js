'use strict';

angular.module('award').controller('Award.ActionsController', ['$scope', '$state', '$stateParams', '$q','$modal', 'UtilService', 'ConfigService'
    , 'ObjectService', 'Authentication', 'Object.LookupService', 'Case.LookupService', 'Object.SubscriptionService', 'Object.ModelService', 'Case.InfoService', 'Case.MergeSplitService'
    , function ($scope, $state, $stateParams, $q, $modal, Util, ConfigService, ObjectService, Authentication, ObjectLookupService,
                CaseLookupService, ObjectSubscriptionService, ObjectModelService, CaseInfoService, MergeSplitService) {

        ConfigService.getComponentConfig("award", "actions").then(function (componentConfig) {
            $scope.config = componentConfig;
            return componentConfig;
        });

        ConfigService.getModuleConfig("cases").then(function (moduleConfig) {
            $scope.caseFileSearchConfig = _.find(moduleConfig.components, {id: "merge"});
        });

        var promiseQueryUser = Authentication.queryUserInfo();
        var promiseGetGroups = ObjectLookupService.getGroups();

        var previousId = null;
        $scope.$on('object-updated', function (e, data) {
            if (!CaseInfoService.validateCaseInfo(data)) {
                return;
            }
            $scope.caseInfo = data;

            var group = ObjectModelService.getGroup(data);
            var assignee = ObjectModelService.getAssignee(data);
            if (previousId != $stateParams.id) {
                var promiseGetApprovers = CaseLookupService.getApprovers(group, assignee);
                $q.all([promiseQueryUser, promiseGetGroups, promiseGetApprovers]).then(function (data) {
                    var userInfo = data[0];
                    var groups = data[1];
                    var assignees = data[2];
                    $scope.restricted = ObjectModelService.checkRestriction(userInfo.userId, assignee, group, assignees, groups);
                });


                promiseQueryUser.then(function (userInfo) {
                    $scope.userId = userInfo.userId;
                    ObjectSubscriptionService.getSubscriptions(userInfo.userId, ObjectService.ObjectTypes.CASE_FILE, $scope.caseInfo.id).then(function (subscriptions) {
                        var found = _.find(subscriptions, {
                            userId: userInfo.userId,
                            subscriptionObjectType: ObjectService.ObjectTypes.CASE_FILE,
                            objectId: $scope.caseInfo.id
                        });
                        $scope.showBtnSubscribe = Util.isEmpty(found);
                        $scope.showBtnUnsubscribe = !$scope.showBtnSubscribe;
                    });
                });

                previousId = $stateParams.id;
            }
        });

        $scope.restricted = false;
        $scope.onClickRestrict = function ($event) {
            if ($scope.restricted != $scope.caseInfo.restricted) {
                $scope.caseInfo.restricted = $scope.restricted;

                var caseInfo = Util.omitNg($scope.caseInfo);
                CaseInfoService.saveCaseInfo(caseInfo);
            }
        };

        $scope.createNew = function () {
            $state.go("frevvo", {
                name: "new-case"
            });
            //$state.go('newCase');
        };

        $scope.edit = function (caseInfo) {
            $state.go("frevvo", {
                name: "edit-case"
                , arg: {
                    caseId: caseInfo.id
                    , caseNumber: caseInfo.caseNumber
                    , mode: "edit"
                    , containerId: caseInfo.containerId
                    , folderId: caseInfo.folderId
                }
            });
            //if (caseInfo && caseInfo.id && caseInfo.caseNumber && caseInfo.status) {
            //    $state.go('editCase', {id: caseInfo.id, caseNumber: caseInfo.caseNumber, containerId: caseInfo.container.id, folderId: caseInfo.container.folder.id});
            //}
        };

        $scope.changeStatus = function (caseInfo) {
            $state.go("frevvo", {
                name: "change-case-status"
                , arg: {
                    caseId: caseInfo.id
                    , caseNumber: caseInfo.caseNumber //or is it actionNumber?
                    , status: caseInfo.status
                }
            });
            //if (caseInfo && caseInfo.id && caseInfo.caseNumber && caseInfo.status) {
            //    $state.go('status', {id: caseInfo.id, caseNumber: caseInfo.caseNumber, status: caseInfo.status});
            //}
        };
        $scope.reinvestigate = function (caseInfo) {
            $state.go("frevvo", {
                name: "reinvestigate"
                , arg: {
                    caseId: caseInfo.id
                    , caseNumber: caseInfo.caseNumber
                    , mode: "reinvestigate"
                    , containerId: caseInfo.containerId
                    , folderId: caseInfo.folderId
                }
            });
        };
        $scope.subscribe = function (caseInfo) {
            ObjectSubscriptionService.subscribe($scope.userId, ObjectService.ObjectTypes.CASE_FILE, $scope.caseInfo.id).then(function (data) {
                $scope.showBtnSubscribe = false;
                $scope.showBtnUnsubscribe = !$scope.showBtnSubscribe;
                return data;
            });
        };
        $scope.unsubscribe = function (caseInfo) {
            ObjectSubscriptionService.unsubscribe($scope.userId, ObjectService.ObjectTypes.CASE_FILE, $scope.caseInfo.id).then(function (data) {
                $scope.showBtnSubscribe = true;
                $scope.showBtnUnsubscribe = !$scope.showBtnSubscribe;
                return data;
            });
        };

        $scope.merge = function () {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/cases/views/components/case-merge.client.view.html',
                controller: 'Cases.MergeController',
                size: 'lg',
                resolve: {
                    $clientInfoScope: function () {
                        return $scope.caseFileSearchConfig;
                    },
                    $filter: function () {
                        return $scope.caseFileSearchConfig.caseInfoFilter;
                    }
                }
            });
            modalInstance.result.then(function (selectedCase) {
                if(selectedCase){
                    if(selectedCase.parentId != null){
                        //Already Merged
                    }
                    else{
                        MergeSplitService.mergeCaseFile(caseInfo.id, selectedCase.object_id_s).then(
                            function(data) {
                                ObjectService.gotoUrl(ObjectService.ObjectTypes.CASE_FILE, data.id);
                            });
                    }
                }
            }, function () {
                // Cancel button was clicked
            });
        };

        $scope.split = function () {
            console.log('split');
        };

    }
]);