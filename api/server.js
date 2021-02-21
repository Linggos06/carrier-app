require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');
const _ = require("lodash");
const path = require('path');


app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());


const uri = process.env.MONGODB_URI;
mongoose.connect(uri || 'mongodb+srv://admin-julia:211186@cluster0.khhav.mongodb.net/carriersDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => {
        console.log('MongoDB connected!!');
    }).catch(err => {
        console.log('Failed to connect to MongoDB', err);
    });
    
    const connection = mongoose.connection;
    const AutoIncrement = AutoIncrementFactory(connection);


const carrierSchema = mongoose.Schema({
    name: String,
    origin: String,
    registration: String
});

carrierSchema.plugin(AutoIncrement, {
    inc_field: 'id'
});

const Carrier = mongoose.model("Carrier", carrierSchema);


app.route("/api/create").post((req, res) => {

    const name = _.upperCase(req.body.name);
    const origin = _.upperCase(req.body.origin);
    const registration = req.body.registration;

   Carrier.findOne({
        name: name
    }, function(err, result){
        if (!result) {
            const newCarrier = new Carrier({
                name,
                origin,
                registration
            });

            newCarrier.save().then(doc => {
                res.send("successful " + doc);
            });
       }

        if(err){
            res.send(err);
        }
    })


});


app.route("/api/find").get((req, res) => {

    const input = _.upperCase(req.query.q);

    Carrier.find({
            name: {
                $regex: new RegExp(input, "g")
            }
        }).then(foundCarrier => {

            // foundCarrier.forEach(item => {
            //     item.name = _.capitalize(item.name);
            //     item.origin = _.capitalize(item.origin);
            // })
            res.send(foundCarrier);
        })
        .catch(err => {
            console.log(err);
        })
})



if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
  }

let port = process.env.PORT || 3001;
app.listen(port, function () {
    console.log(`App is running on port ${port}`)
});


