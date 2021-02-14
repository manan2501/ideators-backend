const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");

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

module.exports = router;
