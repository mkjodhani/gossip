const express = require("express");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/newGossip", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});
const router = express.Router();
const bodyParser = require("body-parser");
const {
    Users,
    Sockets,
    Messages,
    Chats,
    Histories,
    Friends,
} = require("../models/models");

router.use(bodyParser.urlencoded({ extended: true }));

router.post("/register", (req, res) => {
    (async () => {
        const result = await createUser(req.body);
        if (result) {
            provideResources(result.username);
            res.redirect("../login.html");
        } else {
            res.end("Already exsisted user provided...");
        }
    })();
});

router.post("/login", (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.psw,
    };
    Users.findOne(user).then((result) => {
        if (result) {
            res.cookie("username", result.username);
            res.redirect("../chat/chat.html");
        } else {
            res.end("Username or password is incorreact.");
        }
    });
});

async function provideResources(username) {
    const friends = await new Friends({ username: username }).save();
    const history = await new Histories({ username: username }).save();
    const socket = await new Sockets({
        username,
        socketID: "None",
        active: true,
    }).save();
}

async function createUser(data) {
    const { username, firstName, lastName, about, psw } = data;
    const user = await Users.findOne({ username: username });
    if (user) {
        return null;
    } else {
        var savedUser;
        savedUser = await new Users({
            username: username,
            firstName: firstName,
            lastName: lastName,
            about: about,
            password: psw,
        }).save();
        return savedUser;
    }
}
module.exports = router;
