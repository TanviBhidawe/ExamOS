
const Result = require("../models/Result");

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({
      candidate: req.user._id,
    })
      .populate("exam")
      .populate("answers.question")
      .populate("candidate", "fullName email");

    const formattedResults = results.map((result) => {
      const resultObject = result.toObject();

      if (!resultObject.exam && resultObject.examSnapshot) {
        resultObject.exam = resultObject.examSnapshot;
      }

      return resultObject;
    });

    res.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Get my results error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("candidate", "fullName email")
      .populate("exam", "name subject")
      .populate("answers.question");

    const formattedResults = results.map((result) => {
      const resultObject = result.toObject();

      if (!resultObject.exam && resultObject.examSnapshot) {
        resultObject.exam = resultObject.examSnapshot;
      }

      return resultObject;
    });

    res.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Get all results error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

