var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'layout'});
var bodyParser = require('body-parser');
var session = require('express-session');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Session usage
var sessionOptions = {
    secret: 'secret cookie thing',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

//global array of complaints
var complaints = [
    {"Line": "A", "Complaint": "The train was an hour late!"},
    {"Line": "F", "Complaint": "There was a possum loose on the platform"},
    {"Line": "G", "Complaint": "The person sitting next to me was eating hard-boiled eggs in the subway car (???!!!)"}
];

//Global Vars
var searched = [];          //Array filled with filtered lines
var isFiltered = false;
var found = false;
var count = 0;              //Number of complaints for each session

//Search Subway Lines
function searchLines(Line) {

    found = false;
    for (var i = 0; i < complaints.length; i++) {
        if (complaints[i].Line === Line) {
            found = true;
            searched.push(complaints[i]);
            console.log(complaints[i]);
        }
    }
}

//--------------Homepage--------------
app.get('/', function (req, res) {

    console.log("-----Open Homepage-----");

    if (!isFiltered) {
        res.render('home', {"array": complaints});
    }

    else if (isFiltered) {

        if (found) {
            res.render('home', {"array": searched});
            searched = [];
            isFiltered = false;
        }

        //If filtered but NOT found
        else {
            res.render('home', {"array": complaints});
            searched = [];
            isFiltered = false;
            console.log("You searched non-existing line");
        }

    }

});

//SEARCH LINE INPUT
app.post('/', function (req, res) {
    var input_line = req.body.Line;

    //If input is not empty
    if (input_line != "") {
        //Search and display all complaints from the input line
        console.log("Subway Line: ", input_line);
        searchLines(input_line);
        isFiltered = true;
    }

    //If input is empty
    else {
        isFiltered = false;
    }

    res.redirect('/');
});

//ADD COMPLAINT
app.post('/complain', function (req, res) {

    var input_line = req.body.Line;
    var input_complaint = req.body.Complaint;

    if (input_line != "" && input_complaint != "" && input_line.length == 1) {
        var object = {Line: input_line, Complaint: input_complaint};
        //console.log(object);
        complaints.unshift(object);

        //Increment # of complaints this session
        if (req.session.count === undefined) {
            req.session.count = 1;
        }

        else {
            req.session.count++;
        }

        console.log(req.session.count);
        res.redirect('/');
    }

    else {
        res.redirect('/complain');
        console.log("You entered nothing or it wasn't a line!");
    }

});

//--------------Complain Page--------------
app.get('/complain', function (req, res) {
    console.log("-----Complain page-----");
    res.render('complain');
});

//--------------Stats Page--------------
app.get('/stats', function (req, res) {
    console.log("-----Stats page-----");

    if (req.session.count === undefined) {
        res.render('stats');
    }

    else {
        res.render('stats', {"count": req.session.count});
    }

});

//--------------404 Not Found--------------
// app.use(function (req, res, next) {
//     console.log('404');
// });

app.listen(process.env.PORT || 5000, function () {
    console.log('Example app listening on port 5000!');
});
