var express = require('express');
var router = express.Router();
var Mustache = require('mustache');
var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' };
var faker = require('faker');
/* GET home page. */
router.post('/', function(req, res, next) {
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
    var uid = faker.random.uuid();
    pdf.create(html, options).toFile('./pdfs/invoice_' + uid + '.pdf', function(err, response) {
        if (err) return console.log(err);
        console.log(response);
        res.json(response);
    });
});

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