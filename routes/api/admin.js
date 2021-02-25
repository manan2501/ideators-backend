const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");

// @route    POST api/admin/addCredits
// @desc     Add credits to user profile
// @access   Private
router.post("/addCredit", auth, async (req, res) => {
  try {
    const myprofile = await Profile.findOne({
      user: req.user.id,
    });

    if (!myprofile.isAdmin) {
      return res.status(403).json({ msg: "Only for admins" });
    }

    const addAmount = req.body.amount;

    await Profile.findOneAndUpdate(
      { user: req.body.to },
      { $inc: { credits: addAmount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("Credit added");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/admin/banUser
// @desc     Ban user from the application
// @access   Private
router.post("/banUser", auth, async (req, res) => {
  try {
    const myprofile = await Profile.findOne({
      user: req.user.id,
    });

    if (!myprofile.isAdmin) {
      return res.status(403).json({ msg: "Only for admins" });
    }

    await Profile.findOneAndUpdate(
      { user: req.body.who },
      { $set: { isBanned: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("User banned successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/admin/unbanUser
// @desc     Unban user from the application
// @access   Private
router.post("/unbanUser", auth, async (req, res) => {
  try {
    const myprofile = await Profile.findOne({
      user: req.user.id,
    });

    if (!myprofile.isAdmin) {
      return res.status(403).json({ msg: "Only for admins" });
    }

    await Profile.findOneAndUpdate(
      { user: req.body.who },
      { $set: { isBanned: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("User unbanned successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/admin/forceStop
// @desc     Forcefully stop a session, if someone leaves without stopping their session.
// @access   Private
router.post("/forceStop", auth, async (req, res) => {
  try {
    const myprofile = await Profile.findOne({
      user: req.user.id,
    });
    if (!myprofile.isAdmin) {
      return res.status(403).json({ msg: "Only for admins" });
    }

    const deskID = req.body.deskID;
    const desk = await Desk.findOne({
      deskID: deskID,
    });
    if (!desk.inUse) {
      return res.status(403).json({ msg: "Desk is not in use" });
    }

    const userID = desk.userUsing;
    const profile = await Profile.findOne({ user: userID });
    const profileFields = {
      isActive: false,
      checkoutTime: new Date().getTime(), //A Number, representing the number of milliseconds since midnight January 1, 1970
    };
    const usage = (
      (profileFields.checkoutTime - profile.checkinTime) /
      60000
    ).toFixed(1); //milliseconds to minutes
    const cost = ((usage * 5) / 3).toFixed(2);
    await Profile.findOneAndUpdate(
      { user: userID },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userID },
      { $inc: { credits: -cost } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const updatedDesk = await Desk.findOneAndUpdate(
      { deskID: deskID },
      { $set: { inUse: false, userUsing: null } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const data = {
      usage: usage,
      cost: cost,
      previousCredits: profile.credits,
      currentCredits: updatedProfile.credits,
      desk: updatedDesk,
    };
    res.status(200).json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
