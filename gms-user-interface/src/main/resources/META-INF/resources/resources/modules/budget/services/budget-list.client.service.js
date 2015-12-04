'use strict';

/**
 * @ngdoc service
 * @name service:Budget.ListService
 *
 * @description
 *
 * {@link https://github.com/Armedia/ACM3/blob/develop/acm-user-interface/ark-web/src/main/webapp/resources/modules/budget/services/budget-info.client.service.js modules/budget/services/budget-info.client.service.js}

 * Budget.ListService provides functions for Budget database data
 */
angular.module('services').factory('Budget.ListService', ['$resource', '$translate', 'UtilService', 'ObjectService', 'Object.ListService',
    function ($resource, $translate, Util, ObjectService, ObjectListService) {
        var Service = $resource('proxy/arkcase/api/v1/service/costsheet', {}, {

            /**
             * @ngdoc method
             * @name listObjects
             * @methodOf service:Budget.ListService
             *
             * @description
             * Get list of all budgets from SOLR.
             *
             * @param {Object} params Map of input parameter.
             * @param {String} params.userId  String that contains userId for logged user. List of budgets are generated depending on this userId
             * @param {Number} params.start  Zero based index of result starts from
             * @param {Number} params.n max Number of list to return
             * @param {String} params.sort  Sort value. Allowed choice is based on backend specification
             * @param {Function} onSuccess (Optional)Callback function of success query
             * @param {Function} onError (Optional) Callback function when fail
             *
             * @returns {Object} Object returned by $resource
             */
            listObjects: {
                method: 'GET',
                url: 'proxy/arkcase/api/v1/service/costsheet/user/:userId?start=:start&n=:n&sort=:sort&objectSubType=COSTSHEET_BUDGET',
                cache: false,
                isArray: false
            }
        });

        /**
         * @ngdoc method
         * @name queryBudgetTreeData
         * @methodOf service:Budget.ListService
         *
         * @description
         * Query list of budgets from SOLR and pack result for Object Tree.
         *
         * @param {String} userId  String that contains logged user
         * @param {Number} start  Zero based index of result starts from
         * @param {Number} n max Number of list to return
         * @param {String} sort  Sort value. Allowed choice is based on backend specification
         *
         *
         * @returns {Object} Promise
         */
        Service.queryBudgetTreeData = function (userId, start, n, sort) {
            var treeData = null;

            var param = {};
            param.userId = userId;
            param.start = start;
            param.n = n;
            param.sort = sort;

            return Util.serviceCall({
                service: Service.listObjects
                , param: param
                , onSuccess: function (data) {
                    if (Service.validateBudgetList(data)) {
                        treeData = {docs: [], total: data.response.numFound};
                        var docs = data.response.docs;
                        _.forEach(docs, function (doc) {
                            treeData.docs.push({
                                nodeId: Util.goodValue(doc.object_id_s, 0)
                                , nodeType: ObjectService.ObjectTypes.COSTSHEET
                                , nodeTitle: Util.goodValue(doc.name)
                                , nodeToolTip: Util.goodValue(doc.name)
                            });
                        });
                        return treeData;
                    }
                }
            });
        };

        /**
         * @ngdoc method
         * @name validateBudgetList
         * @methodOf service:Budget.ListService
         *
         * @description
         * Validate budget list data
         *
         * @param {Object} data  Data to be validated
         *
         * @returns {Boolean} Return true if data is valid
         */
        Service.validateBudgetList = function (data) {
            if (!ObjectListService.validateObjects(data)) {
                return false;
            }

            return true;
        };

        return Service;
    }
]);