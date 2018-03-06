var express = require('express');
var router = express.Router();
var Mustache = require('mustache'); // binding dynamic data in html
var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' }; // invoice generating config
var faker = require('faker'); // dummy text generator
const axios = require('axios'); // for making http call
var pcloudSdk = require('pcloud-sdk-js'); // pcloud js sdk
var client = pcloudSdk.createClient(null, 'pcloud'); // initializing pcloud client

/**
 * generating pdf invoice
 * api:"invoice/create/"
 * @param obj
 */
router.post('/create', function(req, res, next) {
    var html = fs.readFileSync('./template/invoice.html', 'utf8');
    var totalAmount = calculateTotalAmount(req.body.invoice_info.tasklist, req.body.invoice_info.hourlyRate);
    req.body.invoice_info.totalAmount = totalAmount; // getting total amont
    req.body.invoice_info.invoice_date = new Date().toDateString(); // formatting invoice date
    // calculating subamount for individual tasks
    req.body.invoice_info.subAmount = function() {
        var result = 0;
        var totalMins = (this.timeHours * 60) + this.timeMins;
        var amount = (totalMins * req.body.invoice_info.hourlyRate) / 60;
        result = result + amount;
        return result;
    }
    var html = Mustache.render(html, req.body.invoice_info);
    // uid for individual pdfs
    var uid = faker.random.uuid();
    // generating pdf function
    pdf.create(html, options).toFile('./pdfs/invoice_' + uid + '.pdf', function(err, response) {
        if (err) return console.log(err);
        console.log(response);
        upload(response.filename);
        // res.json(response);
    });
});

/**
 * login in pcloud for storing the file 
 * api:"invoice/login/"
 * @returns {returns}
 */
router.post('/login', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    getUserInformation(email, password).then(response => {
        console.log(response);
        // res.json({
        //     userInformation: response
        // });
    }, error => {
        // res.json({
        //     erro: error
        // });
    }).catch(function(error) {
        console.log(error);
    });
    // client.login(email, password).then(function(response) {
    //     
    //     getUserInformation(response).then(res => {
    //         
    //         res.json({
    //             authToken: response,
    //             userInformation: res
    //         });
    //     }, error => {
    //         res.json({
    //             authToken: response,
    //             error: error
    //         });
    //     });
    // }, function(err) {
    //     
    //     res.json({
    //         error: err
    //     });
    // });
});

function upload(file) {
    // client.login("naieemsupto@gmail.com", "1qazZAQ!2wsxXSW@").then(function(response) {
    //     
    //     uploadFile(file);
    //     // res.json({
    //     //     auth_token: response
    //     // });
    // }, function(err) {
    //     
    //     // res.json({
    //     //     error: err
    //     // });
    // });
    uploadFile(file);
}

function uploadFile(file) {
    client.upload(file, 0, {
        onBegin: function() {
            console.log('Upload started.');
        },
        onProgress: function(progress) {
            console.log(progress.direction, progress.loaded, progress.total);
        },
        onFinish: function(uploadData) {

            console.log(uploadData);
        }
    });
}

function getUserInformation(email, password) {
    return axios.get("https://api.pcloud.com/userinfo?getauth=1&logout=1&username=" + email + "&password=" + password);
}
/**
 * calculating total amount
 * @param [list of task,hourlyrate]
 */

function calculateTotalAmount(list, hourlyRate) {
    var result = 0;
    for (let index = 0; index < list.length; index++) {
        var totalMins = (list[index].timeHours * 60) + list[index].timeMins;
        var amount = (totalMins * hourlyRate) / 60;
        result = result + amount;
    }
    return result;
}

module.exports = router;