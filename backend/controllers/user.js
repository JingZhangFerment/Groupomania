const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

//--------------INSCRIPTION DES UTILISATEURS----------------
exports.signup = (req, res, next) => {
  //contrôle des validations des champs
  if (!req.body.firstName || !req.body.lastName) {
    res.status(400).json({
      message: "Merci de bien vérifier si les champs sont tous remplis !",
    });
    return;
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        isAdmin: false,
      })
        .then((User) =>
          res.status(201).json({ message: "Utilisateur créé et sauvegardé !" })
        )
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error });
    });
};

//------------CONNECTER LES UTILISATEURS EXISTANTS------------
exports.login = (req, res, next) => {
  //vérifier que l'email entré par l'utilisateur correspond à un utilisateur existant de la base de données
  User.findOne({
    where: { email: req.body.email },
  })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      //comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user.id,
            token: jwt.sign({ userId: user.id }, process.env.SECRET_TOKEN, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error });
    });
};

//------------AFFICHER LE PROFILE D'UN UTILISATEUR------------
exports.getOneUser = (req, res, next) => {
  User.findOne({
    where: { id: req.params.id },
    attributes: {
      exclude: ["id", "password", "email", "createdAt", "updatedAt"],
    },
  }) // ne pas envoyer le mot de passe pour la sécurité
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(404).json({ error }));
};

//------------MODIFIER LE PROFILE D'UN UTILISATEUR------------
exports.modifyUser = (req, res, next) => {
  const userObject = req.file
    ? {
        ...req.body,
        photoUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      //supprimer l'ancien fichier dans le cas où un nouveau fichier est différent de l'image "avatar_default.png"
      if (
        user.photoUrl != "http://localhost:3000/images/avatar_default.png" &&
        req.file
      ) {
        const oldFilename = user.photoUrl.split("/images/")[1];
        fs.unlink(`images/${oldFilename}`, (error) => {
          console.log(error);
        });
      }
    })
    .catch((error) => {
      return res.status(400).json({ error });
    });

  // mettre à jour la base des donnée
  User.update(
    { ...userObject, id: req.params.id },
    { where: { id: req.params.id } }
  ).then((user) =>
    // si l'enregistrement réussi
    User.findOne({ where: { id: req.params.id } })
      .then((user) => {
        // récupérer "user" à jour
        res.status(200).json({ message: "Profil bien à jour !", user });
      })
      .catch((error) => res.status(400).json(error))
  );
};

//------------SUPPRIMER LE PROFILE D'UN UTILISATEUR------------
exports.deleteUser = (req, res, next) => {
  User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé !" });
      }

      const filename = user.photoUrl.split("/images/")[1];
      if (user.photoUrl != "http://localhost:3000/images/avatar_default.png") {
        // supprimer l'image uniquement s'il est différent de l'image avatar_default.png
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            console.log(error);
          }
        });
      }

      // on supprime l'utilisateur de la base de donnée en indiquant son id
      User.destroy({ where: { id: req.params.id } })
        .then((user) =>
          res.status(200).json({ message: "Utilisateur supprimé !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
