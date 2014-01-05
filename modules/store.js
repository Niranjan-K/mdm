var store = (function () {
    var configs = {
        CONTEXT: "/"
    };
    var routes = new Array();
    var log = new Log();
    var db;

    var module = function (dbs) {
        db = dbs;
        //mergeRecursive(configs, conf);
    };
    var userModule = require('user.js').user;
    var user = new userModule();
    var sqlscripts = require("/resources/mysqlscripts.js");

    function mergeRecursive(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = MergeRecursive(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }

    // prototype
    module.prototype = {
        constructor: module,
        getAllDevicesFromEmail: function(ctx){
            log.info("Test platform :"+ctx.data.platform);
            var devicesArray;
            if(ctx.data.platform=='webapp'){
                user.getUser(ctx.user)
                var userID = user.getUser({userid:ctx.data.email}).id;

                //var devices = db.query(sqlscripts.devices.select37, userID);
                var devices = db.query(sqlscripts.devices.select37, userID);
                devicesArray = new Array();
                for(var i=0;i<devices.length;i++){
                    var deviceID = devices[i].id;

                    var properties = devices[i].properties;
                    var propertiesJsonObj = parse(properties);
                    var name = propertiesJsonObj.device;
                    var model = propertiesJsonObj.model;

                    var platforms = db.query(sqlscripts.devices.select38, deviceID);
                    var platform = platforms[0].platform

                    var packet = {};

                    packet.id = deviceID;
                    packet.name = name;
                    packet.model = model;
                    packet.platform = platform;

                    devicesArray.push(packet);
                }
                return devicesArray;
            }

            if(ctx.data.platform!=undefined && ctx.data.platform != null){

                var userID = user.getUser({userid:ctx.data.email}).id;
                var devices = db.query(sqlscripts.devices.select37, userID);
                //    ctx.data.platform = "iOS";
                var platforms = db.query(sqlscripts.platforms.select9, ctx.data.platform);
                // platformId = platforms[0].id;

                devicesArray = new Array();

                for(var j=0; j<platforms.length; j++){
                    var devices = db.query(sqlscripts.devices.select39, userID, platforms[j].id);

                    for(var i=0;i<devices.length;i++){
                        var deviceID = devices[i].id;

                        var properties = devices[i].properties;
                        var propertiesJsonObj = parse(properties);
                        var name = propertiesJsonObj.device;
                        var model = propertiesJsonObj.model;

                        var packet = {};

                        packet.id = deviceID;
                        packet.name = name;
                        packet.model = model;
                        packet.platform = ctx.data.platform;
                        devicesArray.push(packet);
                    }
                }
            }else{
                log.info(ctx.data.email);
                log.info(stringify(user.getUser({userid:ctx.data.email})));
                var userID = user.getUser({userid:ctx.data.email}).username;
                var devices = db.query(sqlscripts.devices.select37, String(userID));
                devicesArray = new Array();
                for(var i=0;i<devices.length;i++){
                    var deviceID = devices[i].id;

                    var properties = devices[i].properties;
                    var propertiesJsonObj = parse(properties);
                    var name = propertiesJsonObj.device;
                    var model = propertiesJsonObj.model;

                    var platforms = db.query(sqlscripts.devices.select38, deviceID);
                    var platform = platforms[0].platform

                    var packet = {};

                    packet.id = deviceID;
                    packet.name = name;
                    packet.model = model;
                    packet.platform = platform;

                    devicesArray.push(packet);
                }

            }
            return devicesArray;

        },
        getAllAppFromDevice: function(ctx){
            var deviceId = ctx.data.deviceId;
            var GET_APP_FEATURE_CODE = '502A';
            log.info(">>>>>>>>>>>>>>>>>>>>>>>>>EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" + "select * from notifications where `device_id`=? and `feature_code`= '"+GET_APP_FEATURE_CODE+"' and `status`='R' and `id` = (select MAX(`id`) from notifications where `device_id`=? and `feature_code`= '"+GET_APP_FEATURE_CODE+"' and `status`='R')");

            var last_notification = db.query(sqlscripts.notifications.select12, GET_APP_FEATURE_CODE, GET_APP_FEATURE_CODE, deviceId, deviceId);
            last_notification[0].received_data = JSON.parse(unescape(last_notification[0].received_data));
            return last_notification[0];
        }
    };
    // return module
    return module;
})();