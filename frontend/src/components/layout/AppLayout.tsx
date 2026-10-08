import { Box } from "@mui/material";
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef6fb 0%, #f5f9fc 45%, #eaf3f8 100%)",
        color: "#16324a",
      }}
    >
      <Sidebar />

      <Header />

      <Box
        component="main"
        sx={{
          marginLeft: {
            xs: 0,
            md: "250px",
          },

          paddingTop: "72px",

          minHeight: "100vh",

          width: {
            xs: "100%",
            md: "calc(100% - 250px)",
          },

          background:
            "linear-gradient(135deg, #eef6fb 0%, #f8fbfd 50%, #eaf3f8 100%)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight:
              "calc(100vh - 72px)",

            padding: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}