var express = require("express");
var bodyParser = require("body-parser");
var twilio = require("twilio");

var app = express();



app.use(bodyParser.urlencoded({ extended: true }));

app.set("port", 5100);

var oPlayers = {};

app.use(express.static('www'));

function Player() {
    this.number1 = (Math.ceil(Math.random() * 9));
    this.number2 = (Math.ceil(Math.random() * 9));
    this.nGuesses = 0;
    this.nCorrect = 0;
    this.fWelcoming = function (req, twiml) {
        twiml.message("Welcome to FlashCard Game. What is " + this.number1 + "+" + this.number2 + "?");
        this.fCurstate = this.fGuessing;
    }
    this.fGuessing = function (req, twiml) {
        if (req.body.Body == this.number1 + this.number2) {
            this.number1 = (Math.ceil(Math.random() * 10));
            this.number2 = (Math.ceil(Math.random() * 10));
            this.nCorrect++;
            if (this.nCorrect != 5) {
                twiml.message("Correct. What is " + this.number1 + "+" + this.number2 + "?");
            }
            this.nGuesses = 0;
        }
        else if (req.body.Body != this.number1 + this.number2) {
            this.nGuesses++;
            if (this.nGuesses == 1) {
                twiml.message("Incorrect. Try again?");
            }
            else {
                this.number1 = (Math.ceil(Math.random() * 10));
                this.number2 = (Math.ceil(Math.random() * 10));
                twiml.message("Incorrect. Whats " + this.number1 + "+" + this.number2 + "?");
                this.nGuesses = 0;
            }
        }
        else {
            twiml.message("please enter only numbers");
        }

        if (this.nCorrect == 5) {
            this.nCorrect = 0;
            this.number1 = (Math.ceil(Math.random() * 100));
            this.number2 = (Math.ceil(Math.random() * 100));
            twiml.message("Correct. What is " + this.number1 + "+" + this.number2 + "?");
        }

    }
    this.fCurstate = this.fWelcoming;
}


app.post('/sms', function (req, res) {
    var sFrom = req.body.From;
    if (!oPlayers.hasOwnProperty(sFrom)) {
        oPlayers[sFrom] = new Player();
    }
    var twiml = new twilio.twiml.MessagingResponse();
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    oPlayers[sFrom].fCurstate(req, twiml);
    var sMessage = twiml.toString();
    res.end(sMessage);
});

var server = app.listen(app.get("port"), function () {
    console.log("Javascript is rocking on port " + app.get("port"));
});