const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/User')

const TOKEN = process.env.TOKEN;

/**  Fonction pour le signup et le login **/

// SIGNUP

exports.signup = (req, res, next) => {
    // Password refusé
    if ('^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$') {   // Huit caractères au minimum, au moins une lettre et un chiffre:
        console.error('Le mot de passe doit contenir des lettres et au moins 1 chiffre (8 caractères minimum)');
        return res.status(401).json({ error: 'Le mot de passe doit contenir des lettres et au moins 1 chiffre (8 caractères minimum)' });
    } else {
        // Hash du MDP
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                })
                // Envoie du user
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé : ' + user.email }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json(
                { error }
            ));
    }
};

// LOGIN

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Find user.
        .then(user => {
            if (!user) { // If user not found
                console.error('Utilisateur non trouvé !');
                return res.status(401).json({ error: 'Utilisateur non trouvé ou mot de passe incorrect.' });
            }
            bcrypt.compare(req.body.password, user.password) // If user found, compare password send in res and user
                .then(valid => { // Boolean
                    if (!valid) { //False
                        console.error('Mot de passe incorrect !');
                        return res.status(401).json({ error: 'Utilisateur non trouvé ou mot de passe incorrect.' });
                    }
                    res.status(200).json({ //True
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            TOKEN,
                            { expiresIn: '8h' }
                        )
                    });
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json(
                    { error }
                    )
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json( { error })
        });
};