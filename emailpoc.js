/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
const express = require('express');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
const cfenv = require('cfenv');
const bodyParser = require('body-parser');
const NaturalLanguageClassifierV1 = require('watson-developer-cloud/natural-language-classifier/v1');

var app = express();

const classifier = new NaturalLanguageClassifierV1({
  // If unspecified here, the NATURAL_LANGUAGE_CLASSIFIER_USERNAME and
  // NATURAL_LANGUAGE_CLASSIFIER_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  username: '<insert your username here>',
  password: '<insert your password here>'
});

const NLC_classifier_ID = '<insert your classifier ID here>';

//START - added following for HTTPS
//**************************************************************************
//to run this locally, you need to comment out this section as you cannot
//run HTTPS from your own machine, only from Bluemix
//**************************************************************************
//
// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.

//uncomment when running on Bluemix
//////////////app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.

//uncomment when running on Bluemix
/*
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});
*/
//END - added following for HTTPS

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('js',__dirname + '/js');
app.set('scripts',__dirname + '/scripts');
app.set('css',__dirname + '/css');
app.set('fonts',__dirname + '/fonts');
app.set('images',__dirname + '/images');


var userE = '<insert your email address you want to READ from>';
var passwordE = '<insert your email address password>';
var hostEIMAP = 'imap.gmail.com';
var hostESMTP = 'smtp.gmail.com';
var portE = 993;
var tlsE = true;

/*
// tester API to make sure that the server is listening
*/
app.get('/v1/api',function(request,response) {
    response.send('You may now go behind the veil...');
});



app.get('/v1/getEmails',function(request,response) {

  var MailParser = require("mailparser").MailParser;

  var Imap = require('imap'),
      inspect = require('util').inspect;

  var emailText = [];

  var imap = new Imap({
    user: userE,
    password: passwordE,
    host: hostEIMAP,
    port: portE,
    tls: tlsE
  });

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      //Fetch the 'date', 'from', 'to', 'subject' message headers and the message
      //structure of the first 3 messages in the Inbox
//      var f = imap.seq.fetch('1:3', {
//        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)', //BODY
//        struct: true
//      });

//      var f = imap.seq.fetch('1:3', {
//        bodies: ['HEADER.FIELDS (FROM)','TEXT'],
//        struct: true 
//      });
      var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT)','TEXT'] });
      f.on('message', function(msg, seqno) {
        console.log('Processing msg #%d', seqno);

        var parser = new MailParser();

        parser.on("headers", function(headers) {
            console.log("Header: " + JSON.stringify(headers));
        });

        parser.on("subject", function(subject) {
          console.log("subject:" + subject);
        });
/*
        parser.on('data', data => {
           if (data.type === 'text') {
                Object.keys(data).forEach(key => {
                    console.log(key);
                    console.log('----');
                    console.log(data[key]);
                });
            }
        });
*/
        parser.on('data', data => {
//console.log(data);                
            if (data.type === 'text') {
                console.log(seqno); //email number
                //seems to lose the 1st line of the email text
                //for PoC, it's okay to lose the "Hi Support," line
//                console.log(data.text);
//[{"success":"true","text":"This is a test support email concerning the fact I cannot connect to my =\nwifi and need support assistance.\n\nmany thanks\n\ntony pigram=\nFrom: Tony Pigram <tony.pigram@gmail.com>\nSubject: test email\n\n"}]
                var outputT   = "";
                var fromT     = "";
                var subjectT  = "";
                var emailT    = data.text;

                var n = emailT.search("From:");
                if(n!= -1) {
                  outputT = emailT.substring(0, n);
                  //now remove any \n or = values from outputT
                  var res1 = outputT.replace(/\n/g, ' ');
                  var res2 = res1.replace(/=/g, '');
                  outputT = res2;

                  var m = emailT.search("Subject");
                  fromT = emailT.substring(n+6, m);
                  if(m!= -1) {
                    subjectT += emailT.substring(m+9, emailT.length);
                  }
                }
                emailText.push( {
                    "success":  "true",
                    "text": outputT,
                    "from": fromT,
                    "subject": subjectT
                });

                response.send(emailText);
                console.log(JSON.stringify(emailText));
/*
[
    {
        "success": "true",
        "text": "This is a test support email concerning the fact I cannot connect to my  wifi and need support assistance.  many thanks  tony pigram ",
        "from": "Tony Pigram <tony.pigram@gmail.com>\n",
        "subject": "test email\n\n"
    }
]
*/                
            }

            // if (data.type === 'attachment') {
            //     console.log(data.filename);
            //     data.content.pipe(process.stdout);
            //     // data.content.on('end', () => data.release());
            // }
         });

        msg.on("body", function(stream) {
            stream.on("data", function(chunk) {
                parser.write(chunk.toString("utf8"));
            });
        });
        msg.once("end", function() {
            // console.log("Finished msg #" + seqno);
            parser.end();
        });
      });


      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });

    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
  });

  imap.connect();  

})


/**
 * Classify text
 */
app.post('/v1/classify', (req, res, next) => {

  classifier.classify({
    text: req.body.text,
    classifier_id: NLC_classifier_ID,
  }, (err, data) => {
    if (err) {
      return next(err);
    }

    //data will contain the JSON object with the top_class and classes
    //where we can check the confidence % and then choose who to fwd the email onto

    console.log('data='+JSON.stringify(data));

    return res.json(data);
  });
/*
{
    "classifier_id": "9ddfa8x241-nlc-16309",
    "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/9ddfa8x241-nlc-16309",
    "text": "This is a test support email concerning the fact I cannot connect to my  wifi and need support assistance.  many thanks  tony pigram ",
    "top_class": "network_access",
    "classes": [
        {
            "class_name": "network_access",
            "confidence": 0.9790284574324678
        },
        {
            "class_name": "status",
            "confidence": 0.014765075897394087
        },
        {
            "class_name": "account_access",
            "confidence": 0.003280823473231082
        },
        {
            "class_name": "password_reset",
            "confidence": 0.002925643196907013
        }
    ]
}
*/

});


app.post('/v1/sendToGroup', function(request, response) {
  
//{"to": "Watson PoC Group1 <watson@donotreply.com>", text": "This is a test support email concerning the fact I cannot connect to my  wifi and need support assistance.  many thanks  tony pigram ", "subject": "this is a test", "from": "Tony Pigram <tony.pigram@gmail.com>"}

  var toT   = request.body.to;
  var textT = request.body.text;
  var fromT = request.body.from;
  var subjectT = request.body.subject;

  var email   = require("emailjs/email");
  var server  = email.server.connect({
     user:    userE, 
     password:passwordE, 
     host:    hostESMTP, 
     ssl:     tlsE
  });

  // send the message and get a callback with an error or details of the message that was sent
  server.send({
     text:    textT, 
     from:    fromT, 
     to:      toT,
     cc:      '',
     subject: subjectT
  }, function(err, message) { 
    console.log(err || message); 
  });  
})







// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start HTTP web server on the specified port and binding host
var server = app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});


