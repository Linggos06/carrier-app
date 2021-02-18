require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const _ = require("lodash");
const path = require('path');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use("/", router);

app.use(express.static(path.join(__dirname, 'build')));


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const uri = process.env.MONGODB_URI;
mongoose.connect(uri || 'mongodb+srv://admin-julia:211186@cluster0.khhav.mongodb.net/carriersDB', {useNewUrlParser:true,useUnifiedTopology:true});

 const carrierSchema = {
    name: String,
    number: Number,
    origin: String,
    registration: String
};

const Carrier = mongoose.model("Carrier", carrierSchema);

let number = 0;


router.route("/create").post((req, res) => {
   
    const name = _.upperCase(req.body.name);
    const origin = _.upperCase(req.body.origin);
    const registration = req.body.registration;

    Carrier.findOne({
        name: name
    }, function (err, result) {
        if (!result) {
            const newCarrier = new Carrier({
                name,
                number: ++number,
                origin,
                registration
             });
         
             newCarrier.save();
            
        } else {
           console.log(result);
            
        }
    })

    
});


router.route("/find").get((req, res) => {
    
    const input = _.upperCase(req.query.q);

    Carrier.find({name: {$regex: new RegExp(input, "g") }}).then(foundCarrier => {

        foundCarrier.forEach(item => {
        item.name = _.capitalize(item.name);
        item.origin = _.capitalize(item.origin);
    })
        res.send(foundCarrier);  
    })
    .catch(err => {
        console.log(err);
    })
})


let port = process.env.PORT || 3001;
app.listen(port, function() { console.log("App is running on port 3001")});


