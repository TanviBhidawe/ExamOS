const Result = require("../models/Result");

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({
      candidate: req.user._id,
    }).populate("exam");

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("candidate", "fullName email")
      .populate("exam", "name subject");

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};