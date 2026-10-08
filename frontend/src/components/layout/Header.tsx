import {
  Avatar,
  Box,
  Button,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const username =
    user?.username || "User";

  const initial =
    username.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        height: 72,
        position: "fixed",
        top: 0,
        left: 250,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: {
          xs: 2,
          md: 4,
        },
        background:
          "rgba(8, 17, 31, 0.82)",
        borderBottom:
          "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter:
          "blur(18px)",
        color: "#ffffff",
        zIndex: 1100,
      }}
    >
      {/* Page title */}
      <Box>
        <Box
          sx={{
            fontSize: {
              xs: "1rem",
              md: "1.2rem",
            },
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          File Management
        </Box>

        <Box
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
            fontSize: "0.75rem",
            color:
              "rgba(255,255,255,0.45)",
            mt: 0.3,
          }}
        >
          Intelligent storage optimization
        </Box>
      </Box>

      {/* User section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
            textAlign: "right",
          }}
        >
          <Box
            sx={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {username}
          </Box>

          <Box
            sx={{
              fontSize: "0.7rem",
              color:
                "rgba(255,255,255,0.45)",
              mt: 0.2,
            }}
          >
            {user?.email || ""}
          </Box>
        </Box>

        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontSize: "0.9rem",
            fontWeight: 700,
            background:
              "linear-gradient(135deg, #06b6d4, #3b82f6)",
          }}
        >
          {initial}
        </Avatar>

        <Button
          onClick={handleLogout}
          variant="outlined"
          size="small"
          sx={{
            ml: 0.5,
            borderRadius: 2,
            textTransform: "none",
            color: "#ffffff",
            borderColor:
              "rgba(255,255,255,0.20)",

            "&:hover": {
              borderColor: "#22d3ee",
              background:
                "rgba(34,211,238,0.08)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}