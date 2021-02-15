const express = require("express");
const router = express.Router();
const Desk = require("../../models/Desk");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");

// // @route    GET api/desk/:id
// // @desc     Create desk with given id
// // @access   Public
// router.post("/:id", async (req, res) => {
//   const deskID = req.params.id;
//   try {
//     desk = new Desk({
//       deskID,
//     });
//     await desk.save();
//     res.status(500).send("Desk created");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// @route    GET api/desk
// @desc     Get all desks
// @access   Public
router.get("/", async (req, res) => {
  try {
    const desks = await Desk.find();
    console.log(desks);
    res.json(desks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/desk/startUsing
// @desc     Start using the particular desk
// @access   Private
router.post("/startUsing", auth, async (req, res) => {
  try {
    const deskID = req.body.deskID;
    const desk = await Desk.findOne({
      deskID: deskID,
    });

    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "email"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    if (profile.isActive) {
      return res.status(400).json({ msg: "User already using the desk" });
    }
    if (desk.inUse) {
      return res.status(400).json({ msg: "Desk is already in use" });
    }
    if (profile.credits <= 0) {
      return res.status(400).json({
        msg: "Not enough credits available, Add credits to your account",
      });
    }
    const deskFields = {
      inUse: true,
      userUsing: req.user.id,
    };
    await Desk.findOneAndUpdate(
      { deskID: deskID },
      { $set: deskFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const profileFields = {
      isActive: true,
      checkinTime: new Date().getTime(), //A Number, representing the number of milliseconds since midnight January 1, 1970
    };
    await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("Session Stared");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/desk/stopUsing
// @desc     Stop using the desk
// @access   Private
router.post("/stopUsing", auth, async (req, res) => {
  try {
    const desk = await Desk.findOne({
      userUsing: req.user.id,
    });
    if (!desk) {
      return res.status(400).json({ msg: "This user is not using any desk" });
    }
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "email"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    await Desk.findOneAndUpdate(
      { deskID: desk.deskID },
      { $set: { inUse: false, userUsing: null } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

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
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { credits: -cost } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const data = {
      usage: usage,
      cost: cost,
      previousCredits: profile.credits,
      currentCredits: updatedProfile.credits,
    };
    res.status(200).json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
