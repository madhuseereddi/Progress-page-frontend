import React, { Component } from "react";
import { io } from "socket.io-client";
import { TailSpin } from "react-loader-spinner";
import confetti from 'canvas-confetti'; // Import confetti animation library
import {withRouter,Redirect} from "react-router-dom"
import "./index.css"; 

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      otp: Array(6).fill(""),
      isOtpSent: false,
      isOtpComplete: false,
      isOtpVerified: false,
      isLoadingVerifyMail: false,
      isLoadingGetOtp: false,
      isLoadingVerifyOtp: false,
      mailStatus: null,
      uniqueId: "",
      otpStatusMessage: "",
      startingPhase: false,
      count: false,
      confettiShown: false, // New state variable to track confetti
    };

    

    // Initialize the socket connection
    this.socket = io('https://sharp-instinctive-ceres.glitch.me'); // Updated to the new backend URL
  }


  componentDidMount() {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      
      this.props.history.push("/face-recognition");
      <Redirect to="/face-verification" />
    } else {
      this.fetchVerificationStatus();
      this.intervalId = setInterval(this.fetchVerificationStatus, 5000);
    }
  }

  componentWillUnmount() {
    this.socket.disconnect(); // Clean up socket connection
    clearInterval(this.intervalId); // Clear interval on unmount
  }

  confettiEffect = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: {x : 0.25, y: 0.75 },
    });
  };

  handleOtpSent = (data) => {
    this.setState({
      isOtpSent: true,
      mailStatus: "OTP Sent",
      otpStatusMessage: `OTP sent to ${data.email}`,
    });
  };

  handleVerificationAccepted = (data) => {
    this.setState({
      mailStatus: "accepted",
      otpStatusMessage: "Verification successful. Your application is accepted.",
      isOtpVerified: true,
    });
  };

  handleVerificationRejected = (data) => {
    this.setState({
      mailStatus: "rejected",
      otpStatusMessage: "Verification was rejected.",
    });
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleOtpInputChange = (element, index) => {
    const { value } = element.target;
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...this.state.otp];
      newOtp[index] = value;
      this.setState({ otp: newOtp }, this.checkOtpComplete);

      if (value !== "" && element.target.nextSibling) {
        element.target.nextSibling.focus();
      }
    }
  };

  handleOtpBackspace = (element, index) => {
    if (element.key === "Backspace" && !this.state.otp[index] && element.target.previousSibling) {
      element.target.previousSibling.focus();
    }
  };

  checkOtpComplete = () => {
    const isOtpComplete = this.state.otp.every((digit) => digit !== "");
    this.setState({ isOtpComplete });
  };

  handleVerifyMail = async () => {
    const { email } = this.state;
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    this.setState({ isLoadingVerifyMail: true });

    try {
      const response = await fetch("https://sharp-instinctive-ceres.glitch.me/verify-mail", { // Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status: "mail sent to user" }),
      });

      const data = await response.json();

      console.log(data)

      if (response.ok) {
        this.setState({
          uniqueId: data.uniqueId,
          mailStatus: "pending",
          startingPhase : true
        });
        alert(data.message);
      } else {
        alert(data.message || "Error sending verification email");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the verification email.");
    } finally {
      this.setState({ isLoadingVerifyMail: false });
    }
  };

  handleGetOtp = async () => {
    const { email } = this.state;
    if (!email) {
      alert("Please enter an email address to get OTP");
      return;
    }

    this.setState({ isLoadingGetOtp: true });

    try {
      const response = await fetch("https://sharp-instinctive-ceres.glitch.me/send-otp", { // Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        this.setState({ isOtpSent: true });
        
      } else {
        alert(data.message || "Error sending OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the OTP.");
    } finally {
      this.setState({ isLoadingGetOtp: false });
    }
  };

  handleVerifyOtp = async () => {
    const { email, otp } = this.state;
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    this.setState({ isLoadingVerifyOtp: true });

    try {
      const response = await fetch("https://sharp-instinctive-ceres.glitch.me/verify-otp", { // Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();
      if (response.ok) {
        this.setState({ isOtpVerified: true });
        localStorage.setItem("userEmail", email);
        alert(data.message);
        this.props.history.push("/face-verification");
        
      } else {
        alert(data.message || "Error verifying OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while verifying the OTP.");
    } finally {
      this.setState({ isLoadingVerifyOtp: false });
    }
  };

  
  fetchVerificationStatus = async () => {
    const { email } = this.state;
    
    try {
      const response = await fetch(`https://sharp-instinctive-ceres.glitch.me/verification-status/${email}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data.message exists before using it
      if (data.message) {
        if (data.message.includes("accept")) {
          // Check if confetti has already been shown
          this.setState({ count: true });
          if (this.state.count && !this.state.confettiShown) {
            this.confettiEffect();
            this.setState({ confettiShown: true }); // Set the confettiShown to true
          }
           if(this.state.count === true){          
            this.setState({
            mailStatus: "accepted",
            otpStatusMessage: "Verification accepted!",
            count: false,
          });
        }
        } else if (data.message.includes("reject")) {
          this.setState({
            mailStatus: "rejected",
            otpStatusMessage: "Verification rejected.",
          });
        } else {
          this.setState({ otpStatusMessage: data.message });
        }
      } else {
        this.setState({ otpStatusMessage: "Unexpected response format." });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      this.setState({ otpStatusMessage: "An error occurred while fetching verification status." });
    }
  };
  
  render() {
    const {
      email,
      otp,
      isOtpSent,
      isOtpComplete,
      isLoadingVerifyMail,
      isLoadingGetOtp,
      isLoadingVerifyOtp,
      mailStatus,
      startingPhase,
      confettiShown
    } = this.state;

    return (
      <div className="full-page-login">
      <div className="signup-container">
        <div className="header">
        <img src = "https://res.cloudinary.com/dx97khgxd/image/upload/v1729914264/Screenshot_2024-10-26_091353-removebg-preview_h1oae1.png" className="main-logo1" alt = "logo1" />
        <h2 className="head2">One time SignUp</h2>
        </div>

<input
  type="text"
  name="name"
  placeholder="Name"
  onChange={this.handleInputChange}
  required
  className="input1"
  autoComplete="off"
  autoCapitalize="words"
/>

<input
  type="email"
  name="email"
  placeholder="Email"
  value={email}
  onChange={this.handleInputChange}
  required
  className="input1"
  autoComplete="off"
  autoCapitalize="words"
/>
{
  !confettiShown ? 


(<button onClick={this.handleVerifyMail} disabled={isLoadingVerifyMail} className="btn1">
  {isLoadingVerifyMail ? (
    <TailSpin height="24" width="24" color="#ffffff" ariaLabel="loading" />
  ) : (
    "Send Verification Mail"
  )}
</button>) : null

  }

{mailStatus === "pending" && startingPhase && (
  <p style={{ color: "#FFA500", fontWeight: "bold", textAlign : "center" }}>
    Your verification is in process. Please wait...
  </p>
)}
{mailStatus === "accepted" && startingPhase && (
  <p style={{ color: "#4CAF50", fontWeight: "bold",textAlign : "center" }}>
    Congratulations! Your application has been approved.
  </p>
)}
{mailStatus === "rejected" && startingPhase && (
  <p style={{ color: "#FF0000", fontWeight: "bold",textAlign : "center" }}>
    We regret to inform you that your application has been rejected.
  </p>
)}


{mailStatus === "accepted" && startingPhase && (
  <div className="otp-verification">
    <button onClick={this.handleGetOtp} disabled={isLoadingGetOtp} className="btn1">
      {isLoadingGetOtp ? (
        <TailSpin height="24" width="24" color="#ffffff" ariaLabel="loading" />
      ) : (
        isOtpSent ? "Resend OTP" : "Get OTP"
      )}
    </button>
  </div>
)}

{isOtpSent && (
  <div>
    {mailStatus === "accepted" && (
      <div className="otp-input">
        <h4>Enter OTP:</h4>
        <div>
        {otp.map((digit, index) => (
          <input
          className="input2"
            key={index}
            type="text"
            value={digit}
            maxLength="1"
            onChange={(e) => this.handleOtpInputChange(e, index)}
            onKeyDown={(e) => this.handleOtpBackspace(e, index)}
          />
          
        ))}</div>
        <button onClick={this.handleVerifyOtp} className="btn1" disabled={!isOtpComplete || isLoadingVerifyOtp}>
          {isLoadingVerifyOtp ? (
            <TailSpin height="24" width="24" color="#ffffff" ariaLabel="loading" />
          ) : (
            "Verify OTP"
          )}
        </button>
      </div>
    )}
   
  </div>
)}

       <br/>
      </div>

      <img src = "https://res.cloudinary.com/dx97khgxd/image/upload/v1729940305/undraw_chore_list_re_2lq8-removebg-preview_h9b55q.png" alt="img1" className="main-img"/> 
      </div>
    );
  }
}

export default withRouter(Signup);