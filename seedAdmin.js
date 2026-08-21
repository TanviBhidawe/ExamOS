require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  await connectDB();

  const email = "prachibhise@gmail.com";
  const password = "prachi@123";

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    fullName: "ExamOS Admin",
    email,
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin created");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
//Email: prachibhise@gmail.com
//Password: prachi@123