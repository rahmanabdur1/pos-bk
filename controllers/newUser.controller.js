import User from "../models/newUser.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
        // user: 'rahmanabdurr65@gmail.com',
        // pass: 'sviu rehb oqut galk',
    },
};

// Send OTP via Email
const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport(emailConfig);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Verification",
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <b>${otp}</b></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP sent to", email);
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};

// Token Generation
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

// Set Cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};



export const createUser = async (req, res) => {
  try {
    const {
      image,
      firstName,
      lastName,
      designation,
      username,
      email,
      phone,
      password,
      confirmPassword,
      userRole,
      enableCustomAccess,
      customPermissions
    } = req.body;

    // 1. Validate required fields
    if (!firstName || !lastName || !username || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 2. Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 3. Role and custom access conflict check
    if (enableCustomAccess && userRole) {
      return res.status(400).json({ message: 'Cannot enable both custom access and assign a role' });
    }

    // 4. Check for existing user by email/username/phone
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email, username, or phone already exists'
      });
    }

    // 5. Handle optional role
    const userRoleValue = (!userRole || userRole === "null" || userRole === "") ? null : userRole;


    const newUser = new User({
      image: image || null, 
      firstName,
      lastName,
      designation,
      username,
      email,
      phone,
      password,
      userRole: userRoleValue,
      enableCustomAccess,
      customPermissions: enableCustomAccess ? customPermissions : [],
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username,
        phone: newUser.phone,
        designation: newUser.designation,
        role: newUser.userRole,
        enableCustomAccess: newUser.enableCustomAccess,
        image: newUser.image,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};


// Step 1: Initial login request
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate OTP and expiry
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
        await user.save();

        // Send OTP via email
        await sendOTP(email, otp);

        return res.status(200).json({ message: "OTP sent to your email for verification." });
    } catch (error) {
        console.log("Error in login OTP step:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ Logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Logout error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Refresh Token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Refresh token error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get Profile
export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!user.otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired. Please try login again." });
        }

        if (parseInt(user.otp) !== parseInt(otp)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user._id);
        setCookies(res, accessToken, refreshToken);

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.log("Error in OTP verification:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
