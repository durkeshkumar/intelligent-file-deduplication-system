import {
  Box,
  Divider,
  List,
  ListItemButton,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: "▦",
  },
  {
    label: "My Files",
    path: "/files",
    icon: "▤",
  },
  {
    label: "Duplicates",
    path: "/duplicates",
    icon: "◈",
  },
  {
    label: "Deletion History",
    path: "/deletion-history",
    icon: "↻",
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: "◉",
  },
  {
    label: "Storage Analytics",
    path: "/analytics",
    icon: "▥",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 17, 31, 0.88)",
        borderRight:
          "1px solid rgba(255, 255, 255, 0.10)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        color: "#ffffff",
        zIndex: 1200,
      }}
    >
      {/* Application Logo */}
      <Box
        sx={{
          px: 3,
          py: 3,
        }}
      >
        <Box
          sx={{
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          Intelligent
        </Box>

        <Box
          sx={{
            fontSize: "0.82rem",
            color: "#22d3ee",
            fontWeight: 600,
            mt: 0.3,
          }}
        >
          Storage Optimizer
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor:
            "rgba(255, 255, 255, 0.10)",
        }}
      />

      {/* Navigation */}
      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              onClick={() =>
                navigate(item.path)
              }
              sx={{
                minHeight: 48,
                mb: 0.7,
                borderRadius: 2,
                color: isActive
                  ? "#ffffff"
                  : "rgba(255,255,255,0.62)",

                background: isActive
                  ? "linear-gradient(90deg, rgba(6,182,212,0.22), rgba(59,130,246,0.18))"
                  : "transparent",

                border: isActive
                  ? "1px solid rgba(34,211,238,0.18)"
                  : "1px solid transparent",

                "&:hover": {
                  background:
                    "rgba(255,255,255,0.07)",
                  color: "#ffffff",
                },
              }}
            >
              {/* Simple icon */}
              <Box
                component="span"
                sx={{
                  width: 42,
                  fontSize: "1.25rem",
                  color: isActive
                    ? "#22d3ee"
                    : "rgba(255,255,255,0.55)",
                }}
              >
                {item.icon}
              </Box>

              {/* Navigation text */}
              <Box
                component="span"
                sx={{
                  fontSize: "0.92rem",
                  fontWeight: isActive
                    ? 600
                    : 400,
                  color: "inherit",
                }}
              >
                {item.label}
              </Box>
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom Information */}
      <Box
        sx={{
          mt: "auto",
          px: 3,
          py: 3,
        }}
      >
        <Box
          sx={{
            fontSize: "0.72rem",
            color:
              "rgba(255,255,255,0.35)",
          }}
        >
          File Deduplication System
        </Box>

        <Box
          sx={{
            fontSize: "0.7rem",
            color:
              "rgba(255,255,255,0.25)",
            mt: 0.5,
          }}
        >
          v1.0.0
        </Box>
      </Box>
    </Box>
  );
}