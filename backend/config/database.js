//RELATION ENTRE LES DIFFERENT MODELS

const db = require("./sequelize");
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment")

User.hasMany(Post, { foreignKey: "userId", onDelete: "cascade" });
Post.belongsTo(User, { foreignKey: "userId", onDelete: "cascade" });

Comment.belongsTo(Post, { foreignKey: "postId", onDelete: "cascade" });
Post.hasMany(Comment, { foreignKey: "postId", onDelete: "cascade" });

Comment.belongsTo(User, { foreignKey: "userId", onDelete: "cascade" });
User.hasMany(Comment, { foreignKey: "userId", onDelete: "cascade" });

module.exports = db;