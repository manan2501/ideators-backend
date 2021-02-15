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
      { user: req.body.to },
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
      { user: req.body.to },
      { $set: { isBanned: false } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("User unbanned successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
