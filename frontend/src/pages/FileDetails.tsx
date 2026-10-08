import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import type { FileRecord } from "../types";

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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "220px 1fr",
        },
        gap: 1,
        py: 1.8,
        borderBottom:
          "1px solid #edf2f5",
      }}
    >
      <Box
        sx={{
          color: "#607d8b",
          fontSize: "0.85rem",
          fontWeight: 700,
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          color: "#234b63",
          fontSize: "0.88rem",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

export default function FileDetails() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [file, setFile] =
    useState<FileRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const loadFile = async () => {
    if (!id) {
      setError("Invalid file ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<FileRecord>(
          `/files/${id}`,
        );

      setFile(response.data);
    } catch (error: any) {
      console.error(
        "Unable to load file details:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to load file details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFile();
  }, [id]);

  const handleDownload = async () => {
    if (!file) {
      return;
    }

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

  const handleDelete = async () => {
    if (!file) {
      return;
    }

    if (file.is_protected) {
      setError(
        "Protected files cannot be deleted.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.original_filename}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/files/${file.id}`,
        {
          params: {
            deletion_reason:
              "Deleted from File Details",
          },
        },
      );

      setSuccess(
        "File deleted successfully.",
      );

      setTimeout(() => {
        navigate("/files");
      }, 1000);
    } catch (error: any) {
      console.error(
        "File deletion failed:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to delete file.",
      );
    } finally {
      setDeleting(false);
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

  if (!file) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error || "File not found."}
        </Alert>

        <Button
          variant="outlined"
          onClick={() =>
            navigate("/files")
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Back to My Files
        </Button>
      </Box>
    );
  }

  const statusStyle =
    getHashStatusStyle(
      file.hash_status,
    );

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Header */}
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
            File Details
          </Box>

          <Box
            component="p"
            sx={{
              margin: "8px 0 0",
              color: "#617889",
            }}
          >
            View information and manage
            this file.
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={() =>
            navigate("/files")
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Back to My Files
        </Button>
      </Box>

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

      {/* File overview */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
          borderRadius: 3,
          background:
            "rgba(255,255,255,0.82)",
          border:
            "1px solid rgba(25,75,105,0.08)",
          boxShadow:
            "0 8px 30px rgba(25,75,105,0.08)",
        }}
      >
        {/* File title */}
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            pb: 3,
            borderBottom:
              "1px solid #e2eaf0",
          }}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  md: "1.35rem",
                },
                fontWeight: 800,
                color: "#234b63",
                wordBreak:
                  "break-word",
              }}
            >
              {file.original_filename}
            </Box>

            <Box
              sx={{
                mt: 0.7,
                color: "#78909c",
                fontSize: "0.8rem",
              }}
            >
              File ID: {file.id}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {file.is_duplicate && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 5,
                  background:
                    "#f3e8ff",
                  color: "#7e22ce",
                  fontSize:
                    "0.72rem",
                  fontWeight: 700,
                }}
              >
                Duplicate
              </Box>
            )}

            {file.is_protected && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 5,
                  background:
                    "#fef3c7",
                  color: "#92400e",
                  fontSize:
                    "0.72rem",
                  fontWeight: 700,
                }}
              >
                Protected
              </Box>
            )}

            <Box
              sx={{
                px: 1.5,
                py: 0.6,
                borderRadius: 5,
                background:
                  statusStyle.background,
                color:
                  statusStyle.color,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              {file.hash_status}
            </Box>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ mt: 1 }}>
          <DetailRow
            label="Original Filename"
            value={
              file.original_filename
            }
          />

          <DetailRow
            label="Stored Filename"
            value={
              file.stored_filename
            }
          />

          <DetailRow
            label="File Size"
            value={formatBytes(
              file.file_size,
            )}
          />

          <DetailRow
            label="MIME Type"
            value={
              file.mime_type ||
              "Unknown"
            }
          />

          <DetailRow
            label="File Extension"
            value={
              file.file_extension ||
              "Unknown"
            }
          />

          <DetailRow
            label="Hash Status"
            value={file.hash_status}
          />

          <DetailRow
            label="Duplicate"
            value={
              file.is_duplicate
                ? "Yes"
                : "No"
            }
          />

          <DetailRow
            label="Protected"
            value={
              file.is_protected
                ? "Yes"
                : "No"
            }
          />

          <DetailRow
            label="Deleted"
            value={
              file.is_deleted
                ? "Yes"
                : "No"
            }
          />

          <DetailRow
            label="Uploaded On"
            value={formatDate(
              file.created_at,
            )}
          />
        </Box>

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            onClick={
              handleDownload
            }
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
            Download File
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={
              file.is_protected ||
              deleting ||
              file.is_deleted
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {deleting ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Delete File"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}