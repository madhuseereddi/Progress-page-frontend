import React, { Component } from "react";
import { io } from "socket.io-client";
import { TailSpin } from "react-loader-spinner";
import "./index.css"; // Import your custom CSS

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
    };

    // Initialize the socket connection
    this.socket = io('https://separated-dot-variraptor.glitch.me');
  }

  componentDidMount() {
    this.fetchVerificationStatus(); // Initial fetch
    this.intervalId = setInterval(this.fetchVerificationStatus, 5000); // Fetch verification status every 5s
  }

  componentWillUnmount() {
    this.socket.disconnect(); // Clean up socket connection
    clearInterval(this.intervalId); // Clear interval on unmount
  }

  // Socket Event Handlers
  handleOtpSent = (data) => {
    this.setState({
      isOtpSent: true,
      mailStatus: "OTP Sent",
      otpStatusMessage: `OTP sent to ${data.email}`,
    });
  };

  handleVerificationAccepted = () => {
    this.setState({
      mailStatus: "accepted",
      otpStatusMessage: "Verification successful. Your application is accepted.",
      isOtpVerified: true,
    });
  };

  handleVerificationRejected = () => {
    this.setState({
      mailStatus: "rejected",
      otpStatusMessage: "Verification was rejected.",
    });
  };

  // Input Handlers
  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleOtpInputChange = (element, index) => {
    const { value } = element.target;
    if (/^\d$/.test(value) || value === "") {
      const newOtp = [...this.state.otp];
      newOtp[index] = value;
      this.setState({ otp: newOtp }, this.checkOtpComplete);

      // Move focus to the next input
      if (value && element.target.nextSibling) {
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

  // API Call Handlers
  handleVerifyMail = async () => {
    const { email } = this.state;
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    this.setState({ isLoadingVerifyMail: true });

    try {
      const response = await fetch("https://separated-dot-variraptor.glitch.me/verify-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status: "mail sent to user" }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          uniqueId: data.uniqueId,
          mailStatus: "pending",
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
      const response = await fetch("https://separated-dot-variraptor.glitch.me/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        this.handleOtpSent(data);
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
      const response = await fetch("https://separated-dot-variraptor.glitch.me/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();
      if (response.ok) {
        this.handleVerificationAccepted();
        alert(data.message);
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
    if (!email) return; // Ensure email is present

    try {
      const response = await fetch(`https://separated-dot-variraptor.glitch.me/verification-status/${email}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      
      if (data.message.includes("accept")) {
        this.handleVerificationAccepted();
      } else if (data.message.includes("reject")) {
        this.handleVerificationRejected();
      } else {
        this.setState({ otpStatusMessage: data.message });
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
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
      otpStatusMessage,
    } = this.state;

    return (
      <div className="signup-container">
        <h2>Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={this.handleInputChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={this.handleInputChange}
          required
        />

        <button onClick={this.handleVerifyMail} disabled={isLoadingVerifyMail}>
          {isLoadingVerifyMail ? (
            <TailSpin height="24" width="24" color="#ffffff" ariaLabel="loading" />
          ) : (
            "Send Verification Mail"
          )}
        </button>

        {mailStatus === "pending" && <p>Verification in process...</p>}
        {mailStatus === "accepted" && <p>{otpStatusMessage}</p>}
        {mailStatus === "rejected" && <p>{otpStatusMessage}</p>}

        {mailStatus === "accepted" && (
          <div className="otp-verification">
            <button onClick={this.handleGetOtp} disabled={isLoadingGetOtp}>
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
            <h4>OTP Sent</h4>
            {mailStatus === "accepted" && (
              <div className="otp-input">
                <h4>Enter OTP:</h4>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    maxLength="1"
                    onChange={(e) => this.handleOtpInputChange(e, index)}
                    onKeyDown={(e) => this.handleOtpBackspace(e, index)}
                  />
                ))}
                <button
                  onClick={this.handleVerifyOtp}
                  disabled={isLoadingVerifyOtp || !isOtpComplete}
                >
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

        {otpStatusMessage && <p>{otpStatusMessage}</p>}
      </div>
    );
  }
}

export default Signup;
