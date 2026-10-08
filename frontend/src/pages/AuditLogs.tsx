import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import api from "../api/axios";
import type {
  AuditLog,
  AuditLogListResponse,
} from "../types";

function formatDate(date: string): string {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function AuditLogs() {
  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [action, setAction] =
    useState("");

  const loadAuditLogs =
    async () => {
      try {
        setLoading(true);
        setError("");

        const params: Record<
          string,
          string
        > = {};

        if (action.trim()) {
          params.action =
            action.trim().toUpperCase();
        }

        const response =
          await api.get<AuditLogListResponse>(
            "/audit-logs/",
            {
              params,
            },
          );

        setLogs(
          response.data.logs,
        );

        setTotal(
          response.data.total,
        );
      } catch (error: any) {
        console.error(
          "Unable to load audit logs:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load audit logs.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const handleFilter = () => {
    loadAuditLogs();
  };

  const handleClear = () => {
    setAction("");

    setTimeout(() => {
      loadAuditLogs();
    }, 0);
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
        }}
      >
        <Box
          component="h1"
          sx={{
            margin: 0,
            color: "#123f5c",
            fontSize: {
              xs: "1.8rem",
              md: "2.3rem",
            },
            fontWeight: 800,
          }}
        >
          Audit Logs
        </Box>

        <Box
          component="p"
          sx={{
            margin: "8px 0 0",
            color: "#617889",
          }}
        >
          Track important activities
          performed in your account.
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background:
            "rgba(255,255,255,0.82)",
          border:
            "1px solid rgba(25,75,105,0.08)",
          boxShadow:
            "0 8px 30px rgba(25,75,105,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 1.5,
          }}
        >
          <TextField
            label="Action"
            placeholder="Example: DELETE_FILE"
            value={action}
            onChange={(event) =>
              setAction(event.target.value)
            }
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                md: 280,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background:
                  "rgba(255,255,255,0.9)",
              },
            }}
          />

          <Box
            component="button"
            type="button"
            onClick={handleFilter}
            sx={{
              border: 0,
              borderRadius: 2,
              px: 3,
              py: 1.2,
              background:
                "linear-gradient(90deg, #06b6d4, #3b82f6)",
              color: "#ffffff",
              fontFamily:
                "inherit",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": {
                background:
                  "linear-gradient(90deg, #0891b2, #2563eb)",
              },
            }}
          >
            Filter
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleClear}
            sx={{
              border:
                "1px solid #cbd5e1",
              borderRadius: 2,
              px: 3,
              py: 1.1,
              background: "#ffffff",
              color: "#456579",
              fontFamily:
                "inherit",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": {
                background: "#f8fafc",
              },
            }}
          >
            Clear
          </Box>

          <Box
            sx={{
              ml: {
                xs: 0,
                md: "auto",
              },
              color: "#607d8b",
              fontSize: "0.82rem",
            }}
          >
            Total Logs:{" "}
            <Box
              component="span"
              sx={{
                color: "#123f5c",
                fontWeight: 800,
              }}
            >
              {total}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Audit Log Table */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 3,
          background:
            "rgba(255,255,255,0.82)",
          border:
            "1px solid rgba(25,75,105,0.08)",
          boxShadow:
            "0 8px 30px rgba(25,75,105,0.08)",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              sx={{
                color: "#0891b2",
              }}
            />
          </Box>
        ) : logs.length === 0 ? (
          <Box
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              px: 3,
            }}
          >
            <Box
              sx={{
                fontSize: "3rem",
                mb: 1,
              }}
            >
              ◷
            </Box>

            <Box
              sx={{
                color: "#234b63",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              No audit logs found
            </Box>

            <Box
              sx={{
                mt: 0.7,
                color: "#78909c",
                fontSize: "0.85rem",
              }}
            >
              Account activities will
              appear here.
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                minWidth: 1050,
                display: "grid",
                gridTemplateColumns:
                  "0.6fr 1.2fr 1fr 1fr 2.5fr 1.4fr",
                alignItems: "center",
                px: 3,
                py: 2,
                background: "#f2f7fa",
                borderBottom:
                  "1px solid #e2eaf0",
                color: "#607d8b",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              <Box>ID</Box>
              <Box>ACTION</Box>
              <Box>ENTITY</Box>
              <Box>ENTITY ID</Box>
              <Box>DESCRIPTION</Box>
              <Box>DATE</Box>
            </Box>

            {/* Rows */}
            {logs.map(
              (log) => (
                <Box
                  key={log.id}
                  sx={{
                    minWidth: 1050,
                    display: "grid",
                    gridTemplateColumns:
                      "0.6fr 1.2fr 1fr 1fr 2.5fr 1.4fr",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    borderBottom:
                      "1px solid #edf2f5",
                    "&:hover": {
                      background:
                        "#f8fbfd",
                    },
                  }}
                >
                  {/* ID */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    #{log.id}
                  </Box>

                  {/* Action */}
                  <Box>
                    <Box
                      sx={{
                        display:
                          "inline-block",
                        px: 1.2,
                        py: 0.5,
                        borderRadius: 1.5,
                        background:
                          "#ecfeff",
                        color: "#0e7490",
                        fontSize:
                          "0.7rem",
                        fontWeight: 800,
                        letterSpacing:
                          "0.02em",
                      }}
                    >
                      {log.action}
                    </Box>
                  </Box>

                  {/* Entity */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    {log.entity_type ||
                      "-"}
                  </Box>

                  {/* Entity ID */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    {log.entity_id ??
                      "-"}
                  </Box>

                  {/* Description */}
                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.78rem",
                      pr: 2,
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                    title={
                      log.description ||
                      ""
                    }
                  >
                    {log.description ||
                      "No description"}
                  </Box>

                  {/* Date */}
                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.76rem",
                    }}
                  >
                    {formatDate(
                      log.created_at,
                    )}
                  </Box>
                </Box>
              ),
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}