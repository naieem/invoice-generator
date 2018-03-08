var express = require('express');
var router = express.Router();
var fs = require('fs');
const axios = require('axios'); // for making http call
const message = require('../shared/message'); // success and error message texts
const defaultHost = 'https://api.pcloud.com/';
var pcloudConfig = JSON.parse(fs.readFileSync('./pcloudconfig.json', 'utf8')); // getting pccloud login information


/**
 * login in pcloud for getting auth token
 * api:"pcloud/login"
 * params:email,password
 * @returns {returns}
 */
router.post('/login', function(req, res, next) {
    var email = pcloudConfig.email;
    var password = pcloudConfig.password;
    if (email && password) {
        login(email, password).then(response => {
            if (response.data.result == 0) {
                // client = pCloudSdk.createClient(token);
                res.json({
                    access_token: response.data.auth,
                    clientInfo: response.data
                });
            } else {
                res.json({
                    error: response.data.error
                });
            }
        }, error => {
            res.json({
                error: error
            });
        }).catch(function(error) {
            res.json({
                error: error
            });
        });
    } else {
        res.json({
            error: message.error.login.login_validation
        });
    }
});

/**
 * getting list of all files in an individual folder 
 * api:"pcloud/getfoldercontents"
 * params:folderid
 * @returns {all  folders details}
 */
router.post('/getfoldercontents', function(req, res, next) {

    var folderid = req.body.folderid;
    var token = req.headers.authorization;
    if (token) {
        getfoldercontents(token, folderid).then(result => {
            res.json({
                resultCount: result.data.metadata.contents.length,
                files: result.data.metadata.contents
            });
        }, error => {
            res.json({
                error: error
            });
        }).catch(error => {
            error: error
        });
    } else {
        res.json({
            error: message.error.token.not_provided
        });
    }
});

/**
 * Uploading and saving file to pcloud storage
 * api:"pcloud/createfolder"
 * params{token,foldername,}
 * @returns {route params}
 */
router.post('/createfolder', function(req, res, next) {
    var token = req.headers.authorization;
    var foldername = req.body.foldername;
    if (!token) {
        res.json({
            error: message.error.token.not_provided
        });
    } else if (!foldername) {
        res.json({
            error: message.error.folder.name_empty
        });
    } else {
        var rand = Math.floor((Math.random() * 10000) + 1);
        folderid = 0;
        createfolder(foldername, token, folderid).then(result => {
            res.json({
                response: result.data
            });
        }, error => {
            res.json({
                error: error
            });
        }).catch(error => {
            res.json({
                error: error
            });
        });
    }
});


/**
 * Deleting folder from pcloud storage
 * api:"pcloud/deletefolder"
 * params{token,folderid}
 * @returns {route params}
 */
router.post('/deletefolder', function(req, res, next) {
    var token = req.headers.authorization;
    var folderid = req.body.folderid;
    if (!token) {
        res.json({
            error: message.error.token.not_provided
        });
    } else if (!folderid) {
        res.json({
            error: message.error.folder.id_empty
        });
    } else {
        deletefolder(token, folderid).then(result => {
            res.json({
                response: result.data
            });
        }, error => {
            res.json({
                error: error
            });
        }).catch(error => {
            res.json({
                error: error
            });
        });
    }
});

/**
 * Get files download link
 * api:"pcloud/getfilelink"
 * params{token,fileid}
 * @returns {route params}
 */
router.post('/getfilelink', function(req, res, next) {
    var token = req.headers.authorization;
    var fileid = req.body.fileid;
    if (!token) {
        res.json({
            error: message.error.token.not_provided
        });
    } else if (!fileid) {
        res.json({
            error: message.error.file.id_empty
        });
    } else {
        getfilelink(token, fileid).then(result => {
            res.json({
                response: result.data.hosts[0] + result.data.path
            });
        }, error => {
            res.json({
                error: error
            });
        }).catch(error => {
            res.json({
                error: error
            });
        });
    }
});

/**
 * Get files publick downloadable link
 * this is very well decorated rather just download link
 * api:"pcloud/getfilepublink"
 * params{token,fileid}
 * @returns {route params}
 */
router.post('/getfilepublink', function(req, res, next) {
    var token = req.headers.authorization;
    var fileid = req.body.fileid;
    if (!token) {
        res.json({
            error: message.error.token.not_provided
        });
    } else if (!fileid) {
        res.json({
            error: message.error.file.id_empty
        });
    } else {
        getfilepublink(token, fileid).then(result => {
            res.json({
                response: result.data
            });
        }, error => {
            res.json({
                error: error
            });
        }).catch(error => {
            res.json({
                error: error
            });
        });
    }
});


//----------------------- Corresponding functions of route start ------------------------//

/**
 * Getting download link by fileid 
 * @params {token,folderid:int} 
 * @returns {promise}
 */
function getfilepublink(token, fileid) {
    var params = {
        fileid: fileid
    }
    var url = makeRouteConfiguration('getfilepublink', params, token);
    return axios.get(url);
}

/**
 * Getting public download link by fileid 
 * @params {token,folderid:int} 
 * @returns {promise}
 */
function getfilelink(token, fileid) {
    var params = {
        fileid: fileid
    }
    var url = makeRouteConfiguration('getfilelink', params, token);
    return axios.get(url);
}

/**
 * Deleting a folder by folder id 
 * @params {token,folderid:int} 
 * @returns {promise}
 */
function deletefolder(token, folderid) {
    var params = {
        folderid: folderid
    }
    var url = makeRouteConfiguration('deletefolder', params, token);
    return axios.get(url);
}

/**
 * getting all contents of a folder 
 * @params {foldername:string,token,folderid:int} 
 * @returns {promise}
 */
function createfolder(foldername, token, folderid) {
    var params = {
        folderid: folderid,
        name: foldername,
        parentfolderid: 0
    }
    var url = makeRouteConfiguration('createfolder', params, token);
    return axios.get(url);
}


/**
 * Creating a new folder 
 * @params {access_token,folderid} 
 * @returns {promise}
 */
function getfoldercontents(token, folderid) {
    var params = {
        folderid: folderid
    }
    var url = makeRouteConfiguration('listfolder', params, token);
    return axios.get(url);
}


/**
 * Login and get access token 
 * @params {email,password} 
 * @returns {promise}
 */
function login(email, password) {
    return axios.get("https://api.pcloud.com/userinfo?getauth=1&logout=0&username=" + email + "&password=" + password);
}

//----------------------- Corresponding functions of route ends ------------------------//

/**
 * Creating url from parameter and token and according to action 
 * @params {action:string,parameter:object,token:string} 
 * @returns {url}
 */
function makeRouteConfiguration(action, parameter, token) {
    var result = defaultHost + action + "?auth=" + token;
    if (parameter) {
        for (const key in parameter) {
            if (parameter.hasOwnProperty(key)) {
                const element = parameter[key];
                result += '&' + key + '=' + element;
            }
        }
    }

    return result;
}
module.exports = router;
// module.exports.upload = upload;