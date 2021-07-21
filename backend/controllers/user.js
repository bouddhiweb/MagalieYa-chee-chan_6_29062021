// On retrouve ici la logique métier en lien avec nos utilisateurs, appliqué aux routes POST pour les opérations d'inscription et de connexion

// On utilise l'algorithme bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require('bcrypt')

// On récupère notre model User ,créer avec le schéma mongoose
const User = require('../models/user');

// On utilise le package jsonwebtoken pour attribuer un token à un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');

// Middleware pour crée un nouvel utilisateur

// On sauvegarde un nouvel utilisateur et crypte son mot de passe avec un hash généré par bcrypt
exports.signup = (req, res, next) => {
    // Password is not acceptable
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.{6,})/.test(req.body.password)) {   // Test password strength
        return res.status(401).json({ error: 'Le mot de passe doit contenir une lettre majuscule, une minuscule et au moins 1 chiffre (6 caractères min)' });
    } else {
        // Password is acceptable, hash it
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                })
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    }
};

// Le Middleware pour la connexion d'un utilisateur vérifie si l'utilisateur existe dans la base MongoDB lors du login
//si oui il vérifie son mot de passe, s'il est bon il renvoie un TOKEN contenant l'id de l'utilisateur, sinon il renvoie une erreur
exports.login = (req, res, next) => {
    // On doit trouver l'utilisateur dans la BDD qui correspond à l'adresse entrée par l'utilisateur
    User.findOne({
        email: req.body.email
    })
        .then(user => {
            // Si on trouve pas l'utilisateur on va renvoyer un code 401 "non autorisé"
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            // On utilise bcrypt pour comparer les hashs et savoir si ils ont la même string d'origine
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si false, c'est que ce n'est pas le bon utilisateur, ou le mot de passe est incorrect
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrect !'
                        });
                    }
                    // Si true, on renvoie un statut 200 et un objet JSON avec un userID + un token
                    res.status(200).json({ // Le serveur backend renvoie un token au frontend
                        userId: user._id,
                        // Permet de vérifier si la requête est authentifiée
                        // on va pouvoir obtenir un token encodé pour cette authentification grâce à jsonwebtoken, on va créer des tokens et les vérifier
                        token: jwt.sign( // Encode un nouveau token avec une chaine de développement temporaire
                            {
                                userId: user._id
                            }, // Encodage de l'userdID nécéssaire dans le cas où une requête transmettrait un userId (ex: modification d'une sauce)
                            'RANDOM_TOKEN_SECRET', // Clé d'encodage du token qui peut être rendue plus complexe en production
                            // Argument de configuration avec une expiration au bout de 24h
                            {
                                expiresIn: '24h'
                            }
                        )
                        // On encode le userID pour la création de nouveaux objets, et cela permet d'appliquer le bon userID
                        // aux objets et ne pas modifier les objets des autres
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};