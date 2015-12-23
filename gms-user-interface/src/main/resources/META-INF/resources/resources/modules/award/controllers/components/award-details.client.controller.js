'use strict';

angular.module('award').controller('Award.DetailsController', ['$scope', '$stateParams', '$translate'
    , 'UtilService', 'ConfigService', 'Case.InfoService', 'MessageService', 'Helper.ObjectBrowserService'
    , function ($scope, $stateParams, $translate
        , Util, ConfigService, CaseInfoService, MessageService, HelperObjectBrowserService) {

        ConfigService.getComponentConfig("cases", "details").then(function (componentConfig) {
            $scope.config = componentConfig;
            return componentConfig;
        });

        var currentObjectId = HelperObjectBrowserService.getCurrentObjectId();
        if (Util.goodPositive(currentObjectId, false)) {
            CaseInfoService.getCaseInfo(currentObjectId).then(function (caseInfo) {
                $scope.caseInfo = caseInfo;
                return caseInfo;
            });
        }


        $scope.options = {
            focus: true
            //,height: 120
        };

        $scope.saveDetails = function() {
            //$scope.editor.destroy();
            var caseInfo = Util.omitNg($scope.caseInfo);
            CaseInfoService.saveCaseInfo(caseInfo).then(
                function (caseInfo) {
                    MessageService.info($translate.instant("cases.comp.details.informSaved"));
                    return caseInfo;
                }
            );

        };
    }
]);