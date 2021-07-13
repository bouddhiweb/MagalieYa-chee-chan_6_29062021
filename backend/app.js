require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors');

const app = express();

// Connection to MongoBD and masking of ID, MPD, ADDRESS with DOTENV
const ID = process.env.ID;
const MDP = process.env.MDP;
const ADDRESS = process.env.ADDRESS;

mongoose.connect(`mongodb+srv://${ID}:${MDP}@${ADDRESS}`,
    { useNewUrlParser: true,
            useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const router = express.Router();
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const userCtrl = require('./controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

//CORS - Blocks HTTP calls between different servers
app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
});
app.use(bodyParser.json());
app.use(cors());


app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;

