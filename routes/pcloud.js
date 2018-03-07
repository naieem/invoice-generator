var express = require('express');
var router = express.Router();
const axios = require('axios'); // for making http call
const message = require('../shared/message'); // success and error message texts
const defaultHost = 'https://api.pcloud.com/';
var pcloudSdk = require('pcloud-sdk-js');

/**
 * login in pcloud for storing the file 
 * api:"pcloud/login"
 * params:email,password
 * @returns {returns}
 */
router.post('/login', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    if (email && password) {
        login(email, password).then(response => {
            if (response.data.result == 0) {
                res.json({
                    access_token: response.data.auth
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
 * login in pcloud for storing the file 
 * api:"pcloud/login"
 * @returns {route params}
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
 * api:"pcloud/uploadFile"
 * @returns {route params}
 */
router.post('/uploadFile', function(req, res, next) {
    var file = req.body.file;
    var token = req.headers.authorization;
    var folderid = req.body.folderid;
    if (!file) {
        res.json({
            error: message.error.uploadfile.no_file
        });
    } else if (!token) {
        res.json({
            error: message.error.token.not_provided
        });
    } else {
        folderid = folderid ? folderid : '0';
        upload(file, token, folderid);
    }
});



function upload(file, token, folderid) {
    debugger;
    var action = "uploadfile";
    folderid = folderid ? folderid : 0;
    uploadFile(file, token, folderid, action).then(result => {
        debugger;
    }, error => {
        debugger;
    }).catch(error => {
        debugger;
    });
}

function uploadFile(file, token, folderid, action) {
    var params = {
        filename: file,
        folderid: folderid
    }
    var url = makeRouteConfiguration(action, params, token);
    return axios.get(url);
    // const client = pcloudSdk.createClient('token');
    // client.upload(this.files[0], folderid, {
    //     onBegin: () => {
    //       console.log('started');
    //     },
    //     onProgress: function(progress) {
    //       console.log(progress.loaded, progress.total);
    //     },
    //     onFinish: function(fileMetadata) {
    //       console.log('finished', fileMetadata);
    //     }
    //   }).catch(function(error) {
    //     console.error(error);
    //   });
}


//----------------------- Corresponding functions of route start ------------------------//

/**
 * getting all contents of a folder 
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
module.exports.upload = upload;