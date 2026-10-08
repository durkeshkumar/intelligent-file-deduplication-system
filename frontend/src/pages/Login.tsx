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

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      await login(username.trim(), password);

      navigate("/", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Login failed:", error);

      const message =
        error?.response?.data?.detail ||
        "Invalid username or password.";

      setError(message);
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
          {/* LOGIN CARD */}
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
                Welcome Back
              </h1>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: "24px",
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: 1.6,
                }}
              >
                Sign in to manage your files and
                optimize your storage.
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

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                margin="normal"
                autoComplete="current-password"
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
                  "Sign In"
                )}
              </Button>

              {/* REGISTER LINK */}
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
                  Don't have an account?{" "}
                </span>

                <Button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  sx={{
                    textTransform: "none",
                    color: "#22d3ee",
                    fontWeight: 600,
                    minWidth: "auto",
                    padding: 0,
                  }}
                >
                  Create Account
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
              INTELLIGENT STORAGE
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
              Smarter Files.
              <br />
              More Storage.
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
              Securely manage your files, identify
              duplicate content using SHA-256
              hashing, monitor storage consumption,
              and safely remove unnecessary copies.
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
                "SHA-256 Detection",
                "Storage Analytics",
                "Safe Deletion",
                "Secure Access",
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