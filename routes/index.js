var express = require('express');
var router = express.Router();
var Mustache = require('mustache'); // binding dynamic data in html
var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' }; // invoice generating config
var faker = require('faker'); // dummy text generator
const axios = require('axios'); // for making http call
const message = require('../shared/message'); // success and error message texts
var pcloud = require('./pcloud');

/**
 * generating pdf invoice
 * api:"invoice/create/"
 * @param obj
 */
router.post('/create', function(req, res, next) {
    var token = req.headers.authorization; // getting authorization token to uploading file to pcloud
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
        // console.log(pcloud);
        if (token) {
            pcloud.upload(response.filename, token).then(result => {
                debugger;
                res.json(result);
            }, error => {
                debugger;
                res.json(error);
            }).catch(error => {
                debugger;
                res.json(error);
            });
        } else {
            response.error = message.error.uploadfile.no_token
            res.json(response);
        }
    });
});

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

module.exports = router