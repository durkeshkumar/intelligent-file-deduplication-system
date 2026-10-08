import {
  Alert,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";

import api from "../api/axios";
import type {
  StorageStatistics,
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

export default function Analytics() {
  const [
    statistics,
    setStatistics,
  ] = useState<StorageStatistics | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadStatistics =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<StorageStatistics>(
            "/files/storage/statistics",
          );

        setStatistics(
          response.data,
        );
      } catch (error: any) {
        console.error(
          "Unable to load storage statistics:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load storage analytics.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 500,
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
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%" }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!statistics) {
    return null;
  }

  const uniqueStorage = Math.max(
    statistics.total_storage -
      statistics.duplicate_storage,
    0,
  );

  const uniqueFiles = Math.max(
    statistics.total_files -
      statistics.duplicate_files,
    0,
  );

  const storageChartData = [
    {
      name: "Unique Storage",
      value: uniqueStorage,
    },
    {
      name: "Duplicate Storage",
      value:
        statistics.duplicate_storage,
    },
  ].filter((item) => item.value > 0);

  const fileChartData = [
    {
      name: "Unique Files",
      value: uniqueFiles,
    },
    {
      name: "Duplicate Files",
      value:
        statistics.duplicate_files,
    },
  ].filter((item) => item.value > 0);

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Header */}
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
          Storage Analytics
        </Box>

        <Box
          component="p"
          sx={{
            margin: "8px 0 0",
            color: "#617889",
          }}
        >
          Understand your storage usage
          and identify optimization
          opportunities.
        </Box>
      </Box>

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
        {/* Total Files */}
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
            Total Files
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#123f5c",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {statistics.total_files}
          </Box>
        </Paper>

        {/* Total Storage */}
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
            Total Storage
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
              statistics.total_storage,
            )}
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
              color: "#7e22ce",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {formatBytes(
              statistics.duplicate_storage,
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
              statistics.potential_savings,
            )}
          </Box>
        </Paper>
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 3,
        }}
      >
        {/* Storage Distribution */}
        <Paper
          elevation={0}
          sx={{
            minHeight: 430,
            p: 3,
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
              color: "#123f5c",
              fontSize: "1.1rem",
              fontWeight: 800,
              mb: 0.5,
            }}
          >
            Storage Distribution
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
            }}
          >
            Unique versus duplicate
            storage usage.
          </Box>

          {storageChartData.length ===
          0 ? (
            <Box
              sx={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#78909c",
              }}
            >
              No storage data
              available.
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 320,
                mt: 2,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      storageChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {storageChartData.map(
                      (_, index) => (
                        <Cell
                          key={`storage-${index}`}
                          fill={
                            index === 0
                              ? "#0891b2"
                              : "#7e22ce"
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(
                      value,
                    ) =>
                      formatBytes(
                        Number(value),
                      )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "center",
              gap: 3,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#456579",
                fontSize: "0.8rem",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    "#0891b2",
                }}
              />
              Unique Storage
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#456579",
                fontSize: "0.8rem",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    "#7e22ce",
                }}
              />
              Duplicate Storage
            </Box>
          </Box>
        </Paper>

        {/* File Distribution */}
        <Paper
          elevation={0}
          sx={{
            minHeight: 430,
            p: 3,
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
              color: "#123f5c",
              fontSize: "1.1rem",
              fontWeight: 800,
              mb: 0.5,
            }}
          >
            File Distribution
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
            }}
          >
            Unique versus duplicate
            files.
          </Box>

          {fileChartData.length ===
          0 ? (
            <Box
              sx={{
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#78909c",
              }}
            >
              No file data
              available.
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 320,
                mt: 2,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      fileChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {fileChartData.map(
                      (_, index) => (
                        <Cell
                          key={`files-${index}`}
                          fill={
                            index === 0
                              ? "#3b82f6"
                              : "#a855f7"
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "center",
              gap: 3,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#456579",
                fontSize: "0.8rem",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    "#3b82f6",
                }}
              />
              Unique Files
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#456579",
                fontSize: "0.8rem",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    "#a855f7",
                }}
              />
              Duplicate Files
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}