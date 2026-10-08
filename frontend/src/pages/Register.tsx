import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        "Registration successful. Redirecting to login...",
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error: any) {
      console.error(
        "Registration failed:",
        error,
      );

      const message =
        error?.response?.data?.detail ||
        "Unable to create account.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #08111f 0%, #10243d 45%, #07111e 100%)",
        color: "#ffffff",
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "rgba(0, 188, 212, 0.20)",
          filter: "blur(80px)",
          top: -120,
          left: -100,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.20)",
          filter: "blur(90px)",
          bottom: -120,
          right: -80,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "0.9fr 1.1fr",
            },
            gap: {
              xs: 4,
              md: 7,
            },
            alignItems: "center",
          }}
        >
          {/* REGISTER CARD */}
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 3,
                sm: 4,
              },
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.08)",
              border:
                "1px solid rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow:
                "0 25px 60px rgba(0, 0, 0, 0.35)",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <h1
                style={{
                  margin: 0,
                  marginBottom: "8px",
                  color: "#ffffff",
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
              >
                Create Account
              </h1>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: "24px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.6,
                }}
              >
                Create your account and start
                managing your files smarter.
              </p>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background:
                      "rgba(211, 47, 47, 0.15)",
                    color: "#ffb4ab",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    background:
                      "rgba(46, 125, 50, 0.15)",
                    color: "#b9f6ca",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* USERNAME */}
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                margin="normal"
                autoComplete="username"
                disabled={loading}
                sx={{
                  "& .MuiInputLabel-root": {
                    color:
                      "rgba(255,255,255,0.65)",
                  },

                  "& .MuiInputLabel-root.Mui-focused":
                    {
                      color: "#22d3ee",
                    },

                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",

                    "& fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.25)",
                    },

                    "&:hover fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.5)",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: "#22d3ee",
                    },
                  },
                }}
              />

              {/* EMAIL */}
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                margin="normal"
                autoComplete="email"
                disabled={loading}
                sx={{
                  "& .MuiInputLabel-root": {
                    color:
                      "rgba(255,255,255,0.65)",
                  },

                  "& .MuiInputLabel-root.Mui-focused":
                    {
                      color: "#22d3ee",
                    },

                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",

                    "& fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.25)",
                    },

                    "&:hover fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.5)",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: "#22d3ee",
                    },
                  },
                }}
              />

              {/* PASSWORD */}
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                margin="normal"
                autoComplete="new-password"
                disabled={loading}
                sx={{
                  "& .MuiInputLabel-root": {
                    color:
                      "rgba(255,255,255,0.65)",
                  },

                  "& .MuiInputLabel-root.Mui-focused":
                    {
                      color: "#22d3ee",
                    },

                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",

                    "& fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.25)",
                    },

                    "&:hover fieldset": {
                      borderColor:
                        "rgba(255,255,255,0.5)",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: "#22d3ee",
                    },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 700,
                  background:
                    "linear-gradient(90deg, #06b6d4, #3b82f6)",

                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #0891b2, #2563eb)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  "Create Account"
                )}
              </Button>

              <Box
                sx={{
                  textAlign: "center",
                  mt: 2.5,
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.6)",
                    fontSize: "0.9rem",
                  }}
                >
                  Already have an account?{" "}
                </span>

                <Button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  sx={{
                    textTransform: "none",
                    color: "#22d3ee",
                    fontWeight: 600,
                    minWidth: "auto",
                    padding: 0,
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* PROJECT DESCRIPTION */}
          <Box>
            <div
              style={{
                color: "#22d3ee",
                fontWeight: 700,
                letterSpacing: "2px",
                fontSize: "0.8rem",
              }}
            >
              SMART FILE MANAGEMENT
            </div>

            <h2
              style={{
                marginTop: "10px",
                marginBottom: "16px",
                color: "#ffffff",
                fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Organize.
              <br />
              Detect. Optimize.
            </h2>

            <h3
              style={{
                marginBottom: "16px",
                color: "rgba(255,255,255,0.82)",
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            >
              Intelligent File Deduplication &
              Storage Optimization System
            </h3>

            <p
              style={{
                maxWidth: "560px",
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.8,
                fontSize: "1rem",
              }}
            >
              Keep your digital storage clean and
              efficient. Our system detects identical
              files, analyzes storage consumption,
              identifies potential savings, and
              provides safe file management tools.
            </p>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                mt: 4,
              }}
            >
              {[
                "Duplicate Detection",
                "Storage Optimization",
                "Secure File Management",
                "Background Processing",
              ].map((feature) => (
                <Box
                  key={feature}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 5,
                    background:
                      "rgba(255,255,255,0.07)",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    color:
                      "rgba(255,255,255,0.78)",
                    fontSize: "0.85rem",
                  }}
                >
                  {feature}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}