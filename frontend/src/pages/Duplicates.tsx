import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import type {
  DuplicateGroup,
  DuplicateGroupListResponse,
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
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function Duplicates() {
  const navigate = useNavigate();

  const [groups, setGroups] =
    useState<DuplicateGroup[]>([]);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [rebuilding, setRebuilding] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadDuplicateGroups =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<DuplicateGroupListResponse>(
            "/files/duplicate-groups",
          );

        setGroups(
          response.data.groups,
        );

        setTotal(
          response.data.total,
        );
      } catch (error: any) {
        console.error(
          "Unable to load duplicate groups:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load duplicate groups.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDuplicateGroups();
  }, []);

  const handleRebuild =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to rebuild the duplicate groups?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setRebuilding(true);
        setError("");
        setSuccess("");

        const response =
          await api.post(
            "/files/duplicate-groups/rebuild",
          );

        setSuccess(
          response.data.message ||
            "Duplicate groups rebuilt successfully.",
        );

        await loadDuplicateGroups();
      } catch (error: any) {
        console.error(
          "Unable to rebuild duplicate groups:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to rebuild duplicate groups.",
        );
      } finally {
        setRebuilding(false);
      }
    };

  const totalStorage =
    groups.reduce(
      (sum, group) =>
        sum + group.total_storage,
      0,
    );

  const totalSavings =
    groups.reduce(
      (sum, group) =>
        sum + group.potential_savings,
      0,
    );

  const totalDuplicateFiles =
    groups.reduce(
      (sum, group) =>
        sum +
        Math.max(
          group.total_files - 1,
          0,
        ),
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
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent:
            "space-between",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
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
            Duplicate Files
          </Box>

          <Box
            component="p"
            sx={{
              margin: "8px 0 0",
              color: "#617889",
            }}
          >
            Identify duplicate files and
            see how much storage can be
            recovered.
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleRebuild}
          disabled={rebuilding}
          sx={{
            minWidth: 170,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, #06b6d4, #3b82f6)",
            "&:hover": {
              background:
                "linear-gradient(90deg, #0891b2, #2563eb)",
            },
          }}
        >
          {rebuilding ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "Rebuild Groups"
          )}
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Duplicate Groups */}
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
            Duplicate Groups
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

        {/* Duplicate Files */}
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
            Duplicate Files
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#7e22ce",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {totalDuplicateFiles}
          </Box>
        </Paper>

        {/* Duplicate Storage */}
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
            Duplicate Storage
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#123f5c",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {formatBytes(
              totalStorage,
            )}
          </Box>
        </Paper>

        {/* Potential Savings */}
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
            Potential Savings
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
              totalSavings,
            )}
          </Box>
        </Paper>
      </Box>

      {/* Duplicate Groups Table */}
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
        ) : groups.length === 0 ? (
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
              ✓
            </Box>

            <Box
              sx={{
                color: "#234b63",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              No duplicate groups
              found
            </Box>

            <Box
              sx={{
                mt: 0.7,
                color: "#78909c",
                fontSize: "0.85rem",
              }}
            >
              Your files currently
              have no detected duplicates.
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
                minWidth: 950,
                display: "grid",
                gridTemplateColumns:
                  "0.5fr 1.7fr 0.9fr 1.1fr 1.1fr 1fr 1fr",
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
              <Box>HASH</Box>
              <Box>FILES</Box>
              <Box>TOTAL SIZE</Box>
              <Box>SAVINGS</Box>
              <Box>CREATED</Box>
              <Box>ORIGINAL</Box>
            </Box>

            {/* Table Rows */}
            {groups.map(
              (group) => (
                <Box
                  key={group.id}
                  component="button"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/duplicate-groups/${group.id}`,
                    )
                  }
                  sx={{
                    minWidth: 950,
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns:
                      "0.5fr 1.7fr 0.9fr 1.1fr 1.1fr 1fr 1fr",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    border: 0,
                    borderBottom:
                      "1px solid #edf2f5",
                    background:
                      "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily:
                      "inherit",
                    "&:hover": {
                      background:
                        "#f0f9ff",
                    },
                  }}
                >
                  {/* ID */}
                  <Box
                    sx={{
                      color: "#0e7490",
                      fontSize:
                        "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    #{group.id}
                  </Box>

                  {/* Hash */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.76rem",
                      fontFamily:
                        "monospace",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                      pr: 2,
                    }}
                    title={group.hash_id}
                  >
                    {group.hash_id}
                  </Box>

                  {/* Files */}
                  <Box
                    sx={{
                      color: "#7e22ce",
                      fontSize:
                        "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {group.total_files}
                  </Box>

                  {/* Total Storage */}
                  <Box
                    sx={{
                      color: "#234b63",
                      fontSize:
                        "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {formatBytes(
                      group.total_storage,
                    )}
                  </Box>

                  {/* Savings */}
                  <Box
                    sx={{
                      color: "#0e7490",
                      fontSize:
                        "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    {formatBytes(
                      group.potential_savings,
                    )}
                  </Box>

                  {/* Created */}
                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.78rem",
                    }}
                  >
                    {formatDate(
                      group.created_at,
                    )}
                  </Box>

                  {/* Original */}
                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.78rem",
                    }}
                  >
                    {group.original_file_id
                      ? `File #${group.original_file_id}`
                      : "Not set"}
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