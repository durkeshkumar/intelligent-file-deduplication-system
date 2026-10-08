import {
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
  FileListResponse,
  FileRecord,
  StorageStatistics,
} from "../types";

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024),
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

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  accent: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
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
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Box
            sx={{
              color: "#617889",
              fontSize: "0.85rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {title}
          </Box>

          <Box
            sx={{
              color: "#123f5c",
              fontSize: "1.8rem",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.78rem",
              mt: 1,
            }}
          >
            {description}
          </Box>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}18`,
            color: accent,
            fontSize: "1.35rem",
            fontWeight: 700,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function FileRow({
  file,
}: {
  file: FileRecord;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
        borderBottom:
          "1px solid #edf2f5",
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Box
          sx={{
            color: "#234b63",
            fontWeight: 600,
            fontSize: "0.88rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.original_filename}
        </Box>

        <Box
          sx={{
            color: "#8a9ba6",
            fontSize: "0.72rem",
            mt: 0.3,
          }}
        >
          {formatDate(file.created_at)}
        </Box>
      </Box>

      <Box
        sx={{
          color: "#456579",
          fontSize: "0.82rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {formatBytes(file.file_size)}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const [statistics, setStatistics] =
    useState<StorageStatistics | null>(
      null,
    );

  const [recentFiles, setRecentFiles] =
    useState<FileRecord[]>([]);

  const [largestFiles, setLargestFiles] =
    useState<FileRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            statisticsResponse,
            recentResponse,
            largestResponse,
          ] = await Promise.all([
            api.get<StorageStatistics>(
              "/files/storage/statistics",
            ),

            api.get<FileListResponse>(
              "/files/",
              {
                params: {
                  page: 1,
                  page_size: 5,
                  sort_by: "created_at",
                  sort_order: "desc",
                },
              },
            ),

            api.get<FileListResponse>(
              "/files/",
              {
                params: {
                  page: 1,
                  page_size: 5,
                  sort_by: "file_size",
                  sort_order: "desc",
                },
              },
            ),
          ]);

          setStatistics(
            statisticsResponse.data,
          );

          setRecentFiles(
            recentResponse.data.files,
          );

          setLargestFiles(
            largestResponse.data.files,
          );
        } catch (error: any) {
          console.error(
            "Unable to load dashboard:",
            error,
          );

          setError(
            error?.response?.data?.detail ||
              "Unable to load dashboard data.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            "calc(100vh - 120px)",
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
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background:
            "rgba(255,255,255,0.82)",
        }}
      >
        <Box
          sx={{
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {error}
        </Box>
      </Paper>
    );
  }

  if (!statistics) {
    return null;
  }

  const totalStorage =
    statistics.total_storage;

  const duplicateStorage =
    statistics.duplicate_storage;

  const uniqueStorage = Math.max(
    totalStorage - duplicateStorage,
    0,
  );

  const duplicatePercentage =
    totalStorage > 0
      ? (duplicateStorage /
          totalStorage) *
        100
      : 0;

  const storageChartData = [
    {
      name: "Unique Storage",
      value: uniqueStorage,
    },
    {
      name: "Duplicate Storage",
      value: duplicateStorage,
    },
  ].filter((item) => item.value > 0);

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Heading */}
      <Box sx={{ mb: 4 }}>
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
          Dashboard
        </Box>

        <Box
          component="p"
          sx={{
            margin: "8px 0 0",
            color: "#617889",
          }}
        >
          Monitor your files, storage usage,
          duplicates, and potential savings.
        </Box>
      </Box>

      {/* Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Files"
          value={String(
            statistics.total_files,
          )}
          description="Files in your storage"
          icon="▤"
          accent="#0284c7"
        />

        <StatCard
          title="Total Storage"
          value={formatBytes(
            statistics.total_storage,
          )}
          description="Storage consumed"
          icon="◫"
          accent="#2563eb"
        />

        <StatCard
          title="Duplicate Files"
          value={String(
            statistics.duplicate_files,
          )}
          description="Duplicates detected"
          icon="◈"
          accent="#7c3aed"
        />

        <StatCard
          title="Duplicate Storage"
          value={formatBytes(
            statistics.duplicate_storage,
          )}
          description="Used by duplicates"
          icon="◉"
          accent="#d97706"
        />

        <StatCard
          title="Potential Savings"
          value={formatBytes(
            statistics.potential_savings,
          )}
          description="Storage recoverable"
          icon="↓"
          accent="#059669"
        />
      </Box>

      {/* Charts and storage */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Storage chart */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            minHeight: 350,
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
              fontWeight: 700,
            }}
          >
            Storage Distribution
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
              mt: 0.5,
            }}
          >
            Unique versus duplicate storage
          </Box>

          {storageChartData.length > 0 ? (
            <Box
              sx={{
                height: 250,
                mt: 2,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={storageChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#7c3aed" />
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatBytes(
                        Number(value),
                      )
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box
              sx={{
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8a9ba6",
              }}
            >
              No storage data available yet.
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              fontSize: "0.8rem",
            }}
          >
            <Box>
              <span
                style={{
                  color: "#2563eb",
                  marginRight: 6,
                }}
              >
                ●
              </span>
              Unique
            </Box>

            <Box>
              <span
                style={{
                  color: "#7c3aed",
                  marginRight: 6,
                }}
              >
                ●
              </span>
              Duplicate
            </Box>
          </Box>
        </Paper>

        {/* Storage overview */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            minHeight: 350,
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
              fontWeight: 700,
            }}
          >
            Storage Overview
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
              mt: 0.5,
            }}
          >
            Current storage and optimization
          </Box>

          <Box
            sx={{
              mt: 4,
              height: 20,
              borderRadius: 10,
              background: "#e5edf2",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.min(
                  duplicatePercentage,
                  100,
                )}%`,
                height: "100%",
                borderRadius: 10,
                background:
                  "linear-gradient(90deg, #7c3aed, #a855f7)",
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "grid",
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "#f4f8fb",
              }}
            >
              <Box
                sx={{
                  color: "#78909c",
                  fontSize: "0.75rem",
                }}
              >
                Total Storage
              </Box>

              <Box
                sx={{
                  color: "#123f5c",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {formatBytes(totalStorage)}
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "#f4f8fb",
              }}
            >
              <Box
                sx={{
                  color: "#78909c",
                  fontSize: "0.75rem",
                }}
              >
                Duplicate Storage
              </Box>

              <Box
                sx={{
                  color: "#7c3aed",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {formatBytes(
                  duplicateStorage,
                )}
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "#edf9f4",
              }}
            >
              <Box
                sx={{
                  color: "#64877d",
                  fontSize: "0.75rem",
                }}
              >
                Potential Savings
              </Box>

              <Box
                sx={{
                  color: "#087f5b",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {formatBytes(
                  statistics.potential_savings,
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Recent + Largest */}
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
        {/* Recent uploads */}
        <Paper
          elevation={0}
          sx={{
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
              fontWeight: 700,
            }}
          >
            Recent Uploads
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
              mt: 0.5,
              mb: 1,
            }}
          >
            Your latest uploaded files
          </Box>

          {recentFiles.length > 0 ? (
            recentFiles.map((file) => (
              <FileRow
                key={file.id}
                file={file}
              />
            ))
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "#8a9ba6",
                fontSize: "0.85rem",
              }}
            >
              No files uploaded yet.
            </Box>
          )}
        </Paper>

        {/* Largest files */}
        <Paper
          elevation={0}
          sx={{
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
              fontWeight: 700,
            }}
          >
            Largest Files
          </Box>

          <Box
            sx={{
              color: "#78909c",
              fontSize: "0.8rem",
              mt: 0.5,
              mb: 1,
            }}
          >
            Files consuming the most storage
          </Box>

          {largestFiles.length > 0 ? (
            largestFiles.map((file) => (
              <FileRow
                key={file.id}
                file={file}
              />
            ))
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "#8a9ba6",
                fontSize: "0.85rem",
              }}
            >
              No files uploaded yet.
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}