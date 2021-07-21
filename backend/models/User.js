// Création d'un model user avec mongoose, on importe donc mongoose
const mongoose = require('mongoose');


// On rajoute ce validateur comme plugin
const uniqueValidator = require('mongoose-unique-validator'); // package qui valide l'unicité de l'email


// la valeur unique , avec l'élément mongoose-unique-validator passé comme plug-in,
// s'assurera que deux utilisateurs ne peuvent partager la même adresse e-mail.
// Utilisation d'une expression régulière pour valider le format d'email.
// Le mot de passe fera l'objet d'une validation particulière grâce au middleware verifPasword et au model password

// On crée notre schéma de données dédié à l'utilisateur
const userSchema = mongoose.Schema({
    // L'email doit être unique
    email: {
        type: String,
        unique: true,
        required: [true, "Veuillez entrer votre adresse email"],
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Veuillez entrer une adresse email correcte"]
    },
    // enregistrement du mot de pass
    password: {
        type: String,
        required: [true, "Veuillez choisir un mot de passe"]
    }
});

// On exporte ce schéma sous forme de modèle : le modèle s'appellera user et on lui passe le schéma de données
module.exports = mongoose.model('User', userSchema);

// Pour s'assurer que deux utilisateurs ne peuvent pas utiliser la même adresse e-mail
// nous utiliserons le mot clé unique pour l'attribut email du schéma d'utilisateur userSchema.
// Les erreurs générées par défaut par MongoDB pouvant être difficiles à résoudre, nous installerons un package de validation
//pour pré-valider les informations avant de les enregistrer : npm install --save mongoose-unique-validator