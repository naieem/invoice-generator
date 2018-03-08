# Invoice generator

Generating invoice from html file

### Template file

Predefined template file will be converted into pdf content

### Installing

Clone
* [invoice generator](https://github.com/naieem/invoice-generator.git) - from github
* run npm install
* run npm start
* run http://localhost:3000/invoice/create to create new invoice

### Template files

Templates for pdf will be found in the template folder

## Heroku Api link
* https://invoice-generator.herokuapp.com/

## Apis

### Creating invoice
* url 'invoice/create/'
* params:{
    "invoice_info": {
        "invoice_number": "4",
        "customer_name": "Naieem Mahmud Supto",
        "currency": "$",
        "hourlyRate": 12,
        "tasklist": [{
                "title": "task number1",
                "timeHours": 2,
                "timeMins": 45,
                "taskDate": "02.02.2018"
            },
            {
                "title": "task number2",
                "timeHours": 32,
                "timeMins": 15,
                "taskDate": "02.02.2018"
            },
            {
                "title": "task number3",
                "timeHours": 5,
                "timeMins": 5,
                "taskDate": "02.02.2018"
            }
        ]
    }
}

### Getting access_token From pcloud

 * api:"pcloud/login"
 * params:email,password

### Getting list of all files in an individual folder 

 * api:"pcloud/getfoldercontents"
 * params:folderid(Default is root folder)

### Uploading and saving file to pcloud storage

 * api:"pcloud/createfolder"
 * params{token,foldername}

### Uploading and saving file to pcloud storage

 * api:"pcloud/deletefolder"
 * params{token,foldername}

### Get files download link

 * api:"pcloud/getfilelink"
 * params{token,fileid}

### Get files publicly downloadable link. this is very well decorated rather just download link

 * api:"pcloud/getfilepublink"
 * params{token,fileid}