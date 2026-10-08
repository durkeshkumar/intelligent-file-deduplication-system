import {
  Alert,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";

import api from "../api/axios";
import type {
  DeletionHistory as DeletionHistoryRecord,
  DeletionHistoryListResponse,
} from "../types";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : 2,
  )} ${units[index]}`;
}

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

export default function DeletionHistory() {
  const [
    history,
    setHistory,
  ] = useState<
    DeletionHistoryRecord[]
  >([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDeletionHistory =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<DeletionHistoryListResponse>(
            "/files/history/deletions",
          );

        setHistory(
          response.data.history,
        );

        setTotal(
          response.data.total,
        );
      } catch (error: any) {
        console.error(
          "Unable to load deletion history:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load deletion history.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDeletionHistory();
  }, []);

  const totalStorageFreed =
    history.reduce(
      (sum, record) =>
        sum + record.file_size,
      0,
    );

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
          Deletion History
        </Box>

        <Box
          component="p"
          sx={{
            margin: "8px 0 0",
            color: "#617889",
          }}
        >
          Review files that have been
          safely deleted and the storage
          that was freed.
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

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 2,
          mb: 3,
          maxWidth: 700,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
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
              color: "#78909c",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform:
                "uppercase",
            }}
          >
            Deleted Files
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#123f5c",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {total}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #ecfeff, #eff6ff)",
            border:
              "1px solid rgba(14,116,144,0.12)",
            boxShadow:
              "0 8px 30px rgba(25,75,105,0.08)",
          }}
        >
          <Box
            sx={{
              color: "#0e7490",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform:
                "uppercase",
            }}
          >
            Storage Freed
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#0369a1",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {formatBytes(
              totalStorageFreed,
            )}
          </Box>
        </Paper>
      </Box>

      {/* History Table */}
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
        ) : history.length === 0 ? (
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
              🗑️
            </Box>

            <Box
              sx={{
                color: "#234b63",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              No deleted files
            </Box>

            <Box
              sx={{
                mt: 0.7,
                color: "#78909c",
                fontSize: "0.85rem",
              }}
            >
              Your deletion history will
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
            {/* Header */}
            <Box
              sx={{
                minWidth: 900,
                display: "grid",
                gridTemplateColumns:
                  "0.7fr 2fr 1fr 1.5fr 1.4fr",
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
              <Box>FILE</Box>
              <Box>SIZE</Box>
              <Box>DELETION REASON</Box>
              <Box>DELETED AT</Box>
            </Box>

            {/* Rows */}
            {history.map(
              (record) => (
                <Box
                  key={record.id}
                  sx={{
                    minWidth: 900,
                    display: "grid",
                    gridTemplateColumns:
                      "0.7fr 2fr 1fr 1.5fr 1.4fr",
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
                    #{record.id}
                  </Box>

                  {/* File */}
                  <Box
                    sx={{
                      minWidth: 0,
                      pr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        color: "#234b63",
                        fontSize:
                          "0.85rem",
                        fontWeight: 700,
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                      title={
                        record.filename
                      }
                    >
                      {record.filename}
                    </Box>

                    <Box
                      sx={{
                        mt: 0.4,
                        color:
                          "#78909c",
                        fontSize:
                          "0.7rem",
                      }}
                    >
                      File ID:{" "}
                      {record.file_id}
                    </Box>
                  </Box>

                  {/* Size */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.82rem",
                    }}
                  >
                    {formatBytes(
                      record.file_size,
                    )}
                  </Box>

                  {/* Reason */}
                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.78rem",
                      pr: 2,
                    }}
                  >
                    {record.deletion_reason ||
                      "No reason provided"}
                  </Box>

                  {/* Deleted At */}
                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.76rem",
                    }}
                  >
                    {formatDate(
                      record.deleted_at,
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