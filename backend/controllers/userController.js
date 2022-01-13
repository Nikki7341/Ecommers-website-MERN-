const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../modals/userModal");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")

// Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
      const { name, email, password } = req.body;

      const user = await User.create({
            name,
            email,
            password,
            avatar: {
                  public_id: "this is a sample id",
                  url: "profilesampleurl"
            }
      })
      sendToken(user, 201, res)
})

// Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
      const { email, password } = req.body

      if (!email || !password) {
            return next(new ErrorHandler("Please enter email & password", 400));
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401))
      }

      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401))
      }

      sendToken(user, 200, res)

})

// Logout User 
exports.logout = catchAsyncErrors(async (req, res, next) => {
      res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
      });

      res.status(200).json({
            success: true,
            message: "Logged Out",
      })
})

// Forgot Password 
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
            return next(new ErrorHandler("User not found", 404));
      }
      // Get ResetPassword Token

      const resetToken = user.getResetPasswordToken();

      await user.save({ validateBeforeSave: false });

      const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

      const message = `Your password reset link is :- \n\n ${resetPasswordUrl} \n\n 
      If you have not requested thie email then, please ignore it`;

      try {
            await sendEmail({
                  email: user.email,
                  subject: `Ecommerce Password Recovery`,
                  message,
            })

            res.status(200).json({
                  success: true,
                  message: `Email sent to ${user.email} successfully `,
            })
            
      } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorHandler(error.message, 500))
      }
})

// Reset Password 
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
      // creating hash token 
      const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex")
      
      const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now() },
      })

      if (!user) {
            return next(new ErrorHandler("Reset Password link is invalid or has been expired", 404))
      }

      if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match ", 400))
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();
      sendToken(user, 200, res);
})


// Get user Details

exports.getuserDetails = catchAsyncErrors(async (req, res, next) => {
      const user = await User.findById(req.user.id);

      res.status(200).json({
            success: true,
            user,
      })
})

// Update password 

exports.passwordUpdate = catchAsyncErrors(async (req, res, next) => {
      const user = await User.findById(req.user.id).select("+password")

      const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

      if (!isPasswordMatched) {
            return next(new ErrorHandler("old password does not match ", 401))
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match", 401))
      }

      user.password = req.body.newPassword 
      await user.save().select("-password")

      sendToken(user, 200, res)
})

// update profile

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
      const { name, email } = req.body
      const newUserData = {
            name,
            email
      }

      const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
      })

      res.status(200).json({
            success: true,
            message: "Profile updated successfully "
      })
})

// get all users --admin

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
      const users = await User.find();

      res.status(200).json({
            success: true,
            users
      })
})

// Get single user (admin)

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
      const user = await User.findById(req.params.id);

      if (!user) {
            return next(new ErrorHandler("User not exist with Id :- ${req.params.is}", 404))
      }

      res.status(200).json({
            success: true,
            user
      })
})

// update profile and role by admin 

exports.updateProfileWithRole = catchAsyncErrors(async (req, res, next) => {
      const { name, email, role } = req.body
      const newUserData = {
            name,
            email,
            role
      }

      const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
      })

      res.status(200).json({
            success: true,
            message: "Profile updated successfully "
      })
})

// delete user --admin

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
      const user = await User.findById(req.params.id);

      if (!user) {
            return next(new ErrorHandler(`User not found with ID :- ${req.params.id}`, 404))
      }

      await user.remove();

      res.status(200).json({
            success: true,
            message: `User ${user.name} deleted successfully`
      })


})



