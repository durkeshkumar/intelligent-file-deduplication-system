import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/axios";
import type {
  DuplicateCheckResponse,
  DuplicateGroup,
  DuplicateGroupListResponse,
  FileRecord,
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

function getHashStatusStyle(
  status: FileRecord["hash_status"],
) {
  switch (status) {
    case "COMPLETED":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "PROCESSING":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "FAILED":
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };

    default:
      return {
        background: "#e0f2fe",
        color: "#075985",
      };
  }
}

function FileRow({
  file,
  isOriginal,
  onDownload,
}: {
  file: FileRecord;
  isOriginal: boolean;
  onDownload: (
    file: FileRecord,
  ) => void;
}) {
  const statusStyle =
    getHashStatusStyle(
      file.hash_status,
    );

  return (
    <Box
      sx={{
        minWidth: 900,
        display: "grid",
        gridTemplateColumns:
          "2fr 0.9fr 0.9fr 1fr 1fr 1.1fr",
        alignItems: "center",
        px: 3,
        py: 2,
        borderBottom:
          "1px solid #edf2f5",
        "&:hover": {
          background: "#f8fbfd",
        },
      }}
    >
      {/* Filename */}
      <Box
        sx={{
          minWidth: 0,
          pr: 2,
        }}
      >
        <Box
          sx={{
            color: "#234b63",
            fontWeight: 700,
            fontSize: "0.88rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={file.original_filename}
        >
          {file.original_filename}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 0.7,
            flexWrap: "wrap",
            mt: 0.6,
          }}
        >
          {isOriginal && (
            <Box
              sx={{
                display: "inline-block",
                px: 1,
                py: 0.2,
                borderRadius: 5,
                background: "#dcfce7",
                color: "#166534",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              Original
            </Box>
          )}

          {file.is_duplicate && (
            <Box
              sx={{
                display: "inline-block",
                px: 1,
                py: 0.2,
                borderRadius: 5,
                background: "#f3e8ff",
                color: "#7e22ce",
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              Duplicate
            </Box>
          )}

          {file.is_protected && (
            <Box
              sx={{
                display: "inline-block",
                px: 1,
                py: 0.2,
                borderRadius: 5,
                background: "#fef3c7",
                color: "#92400e",
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              Protected
            </Box>
          )}
        </Box>
      </Box>

      {/* Size */}
      <Box
        sx={{
          color: "#456579",
          fontSize: "0.82rem",
        }}
      >
        {formatBytes(
          file.file_size,
        )}
      </Box>

      {/* Type */}
      <Box
        sx={{
          color: "#607d8b",
          fontSize: "0.8rem",
        }}
      >
        {file.file_extension ||
          file.mime_type ||
          "Unknown"}
      </Box>

      {/* Hash */}
      <Box>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1.2,
            py: 0.5,
            borderRadius: 5,
            background:
              statusStyle.background,
            color:
              statusStyle.color,
            fontSize: "0.68rem",
            fontWeight: 700,
          }}
        >
          {file.hash_status}
        </Box>
      </Box>

      {/* Date */}
      <Box
        sx={{
          color: "#607d8b",
          fontSize: "0.76rem",
        }}
      >
        {formatDate(
          file.created_at,
        )}
      </Box>

      {/* Action */}
      <Box>
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            onDownload(file)
          }
          sx={{
            minWidth: 80,
            textTransform: "none",
            borderRadius: 1.5,
            fontSize: "0.72rem",
          }}
        >
          Download
        </Button>
      </Box>
    </Box>
  );
}

export default function DuplicateGroupDetails() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [group, setGroup] =
    useState<DuplicateGroup | null>(
      null,
    );

  const [files, setFiles] =
    useState<FileRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reloading, setReloading] =
    useState(false);

  const loadGroupDetails =
    async () => {
      if (!id) {
        setError(
          "Invalid duplicate group ID.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get all duplicate groups.
        const groupsResponse =
          await api.get<DuplicateGroupListResponse>(
            "/files/duplicate-groups",
          );

        const selectedGroup =
          groupsResponse.data.groups.find(
            (item) =>
              item.id === Number(id),
          );

        if (!selectedGroup) {
          setError(
            "Duplicate group not found.",
          );
          setGroup(null);
          setFiles([]);
          return;
        }

        setGroup(selectedGroup);

        if (
          !selectedGroup.original_file_id
        ) {
          setFiles([]);
          return;
        }

        // Get the files belonging
        // to this duplicate group.
        const duplicateResponse =
          await api.post<DuplicateCheckResponse>(
            `/files/${selectedGroup.original_file_id}/check-duplicate`,
          );

        const duplicateFiles =
          duplicateResponse.data
            .duplicates || [];

        const originalFileResponse =
          await api.get<FileRecord>(
            `/files/${selectedGroup.original_file_id}`,
          );

        const originalFile =
          originalFileResponse.data;

        const allFiles: FileRecord[] = [
          originalFile,
          ...duplicateFiles.filter(
            (file) =>
              file.id !==
              originalFile.id,
          ),
        ];

        setFiles(allFiles);
      } catch (error: any) {
        console.error(
          "Unable to load duplicate group details:",
          error,
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load duplicate group details.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  const handleRefresh =
    async () => {
      try {
        setReloading(true);
        setError("");
        await loadGroupDetails();
      } finally {
        setReloading(false);
      }
    };

  const handleDownload = async (
    file: FileRecord,
  ) => {
    try {
      setError("");

      const response =
        await api.get(
          `/files/${file.id}/download`,
          {
            responseType: "blob",
          },
        );

      const blob = new Blob([
        response.data,
      ]);

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        file.original_filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(
        "File download failed:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to download file.",
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
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

  if (!group) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error ||
            "Duplicate group not found."}
        </Alert>

        <Button
          variant="outlined"
          onClick={() =>
            navigate("/duplicates")
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Back to Duplicates
        </Button>
      </Box>
    );
  }

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
            Duplicate Group #{group.id}
          </Box>

          <Box
            component="p"
            sx={{
              margin: "8px 0 0",
              color: "#617889",
            }}
          >
            View all files sharing the same
            file hash.
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              navigate("/duplicates")
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Back to Duplicates
          </Button>

          <Button
            variant="contained"
            onClick={handleRefresh}
            disabled={reloading}
            sx={{
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
            {reloading ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Refresh"
            )}
          </Button>
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

      {/* Group Summary */}
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
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform:
                "uppercase",
            }}
          >
            Files in Group
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#7e22ce",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {group.total_files}
          </Box>
        </Paper>

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
              fontSize: "0.72rem",
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
              group.total_storage,
            )}
          </Box>
        </Paper>

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
              fontSize: "0.72rem",
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
              color: "#0e7490",
              fontSize: "1.8rem",
              fontWeight: 800,
            }}
          >
            {formatBytes(
              group.potential_savings,
            )}
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
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform:
                "uppercase",
            }}
          >
            Original File
          </Box>

          <Box
            sx={{
              mt: 1,
              color: "#0369a1",
              fontSize: "1rem",
              fontWeight: 800,
            }}
          >
            {group.original_file_id
              ? `File #${group.original_file_id}`
              : "Not set"}
          </Box>
        </Paper>
      </Box>

      {/* Hash */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
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
            color: "#607d8b",
            fontSize: "0.72rem",
            fontWeight: 700,
            mb: 1,
          }}
        >
          SHA HASH
        </Box>

        <Box
          sx={{
            color: "#234b63",
            fontFamily: "monospace",
            fontSize: "0.82rem",
            wordBreak: "break-all",
            background: "#f2f7fa",
            borderRadius: 2,
            p: 1.5,
          }}
        >
          {group.hash_id}
        </Box>
      </Paper>

      {/* Files */}
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
        <Box
          sx={{
            p: 3,
            borderBottom:
              "1px solid #e2eaf0",
          }}
        >
          <Box
            sx={{
              color: "#123f5c",
              fontSize: "1rem",
              fontWeight: 800,
            }}
          >
            Files in This Group
          </Box>

          <Box
            sx={{
              mt: 0.5,
              color: "#78909c",
              fontSize: "0.8rem",
            }}
          >
            These files have identical
            content hashes.
          </Box>
        </Box>

        {files.length === 0 ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#78909c",
              textAlign: "center",
              px: 3,
            }}
          >
            No files could be loaded
            for this duplicate group.
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                minWidth: 900,
                display: "grid",
                gridTemplateColumns:
                  "2fr 0.9fr 0.9fr 1fr 1fr 1.1fr",
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
              <Box>FILE</Box>
              <Box>SIZE</Box>
              <Box>TYPE</Box>
              <Box>HASH STATUS</Box>
              <Box>UPLOADED</Box>
              <Box>ACTION</Box>
            </Box>

            {files.map(
              (file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isOriginal={
                    file.id ===
                    group.original_file_id
                  }
                  onDownload={
                    handleDownload
                  }
                />
              ),
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}