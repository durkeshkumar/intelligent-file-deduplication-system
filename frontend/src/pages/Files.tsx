import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import type {
  FileListResponse,
  FileRecord,
  FileUploadResponse,
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

export default function Files() {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [files, setFiles] =
    useState<FileRecord[]>([]);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // Search
  const [search, setSearch] =
    useState("");

  // Filters
  const [fileType, setFileType] =
    useState("");

  const [minSize, setMinSize] =
    useState("");

  const [maxSize, setMaxSize] =
    useState("");

  const [duplicateFilter, setDuplicateFilter] =
    useState("");

  const [hashStatus, setHashStatus] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  // Sorting
  const [sortBy, setSortBy] =
    useState<
      | "created_at"
      | "file_size"
      | "original_filename"
    >("created_at");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] =
    useState(1);

  const pageSize = 10;

  const loadFiles = async (
    requestedPage = page,
  ) => {
    try {
      setLoading(true);
      setError("");

      const params: Record<
        string,
        string | number | boolean
      > = {
        page: requestedPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (fileType) {
        params.file_type = fileType;
      }

      if (minSize) {
        params.min_size = Number(minSize);
      }

      if (maxSize) {
        params.max_size = Number(maxSize);
      }

      if (duplicateFilter) {
        params.is_duplicate =
          duplicateFilter === "true";
      }

      if (hashStatus) {
        params.hash_status = hashStatus;
      }

      if (dateFrom) {
        params.date_from =
          `${dateFrom}T00:00:00`;
      }

      if (dateTo) {
        params.date_to =
          `${dateTo}T23:59:59`;
      }

      const response =
        await api.get<FileListResponse>(
          "/files/",
          {
            params,
          },
        );

      setFiles(response.data.files);
      setTotal(response.data.total);
      setTotalPages(
        response.data.total_pages,
      );
    } catch (error: any) {
      console.error(
        "Unable to load files:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to load files.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(page);
  }, [
    page,
    sortBy,
    sortOrder,
  ]);

  const handleSearch = () => {
    setPage(1);
    loadFiles(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFileType("");
    setMinSize("");
    setMaxSize("");
    setDuplicateFilter("");
    setHashStatus("");
    setDateFrom("");
    setDateTo("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);

    setTimeout(() => {
      loadFiles(1);
    }, 0);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "uploaded_file",
        selectedFile,
      );

      const response =
        await api.post<FileUploadResponse>(
          "/files/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );

      setSuccess(
        response.data.message ||
          "File uploaded successfully.",
      );

      setPage(1);

      await loadFiles(1);
    } catch (error: any) {
      console.error(
        "File upload failed:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to upload file.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const handleDelete = async (
    file: FileRecord,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.original_filename}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/files/${file.id}`,
        {
          params: {
            deletion_reason:
              "Deleted from My Files",
          },
        },
      );

      setSuccess(
        "File deleted successfully.",
      );

      await loadFiles(page);
    } catch (error: any) {
      console.error(
        "File deletion failed:",
        error,
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to delete file.",
      );
    }
  };

  const handleFileTypeChange = (
    event: SelectChangeEvent,
  ) => {
    setFileType(event.target.value);
  };

  const handleDuplicateChange = (
    event: SelectChangeEvent,
  ) => {
    setDuplicateFilter(
      event.target.value,
    );
  };

  const handleHashStatusChange = (
    event: SelectChangeEvent,
  ) => {
    setHashStatus(event.target.value);
  };

  const handleSortByChange = (
    event: SelectChangeEvent,
  ) => {
    setSortBy(
      event.target.value as
        | "created_at"
        | "file_size"
        | "original_filename",
    );

    setPage(1);
  };

  const handleSortOrderChange = (
    event: SelectChangeEvent,
  ) => {
    setSortOrder(
      event.target.value as
        | "asc"
        | "desc",
    );

    setPage(1);
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Heading */}
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
            My Files
          </Box>

          <Box
            component="p"
            sx={{
              margin: "8px 0 0",
              color: "#617889",
            }}
          >
            Manage, search, filter and
            organize your uploaded files.
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleUploadClick}
          disabled={uploading}
          sx={{
            minWidth: 150,
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
          {uploading ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "Upload File"
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileUpload}
        />
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

      {/* Search and filters */}
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
            color: "#123f5c",
            fontSize: "1rem",
            fontWeight: 700,
            mb: 2,
          }}
        >
          Search & Filters
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Search filename"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            size="small"
            fullWidth
          />

          <Select
            value={fileType}
            onChange={
              handleFileTypeChange
            }
            displayEmpty
            size="small"
            fullWidth
          >
            <MenuItem value="">
              All File Types
            </MenuItem>

            <MenuItem value=".pdf">
              PDF
            </MenuItem>

            <MenuItem value=".txt">
              TXT
            </MenuItem>

            <MenuItem value=".doc">
              DOC
            </MenuItem>

            <MenuItem value=".docx">
              DOCX
            </MenuItem>

            <MenuItem value=".jpg">
              JPG
            </MenuItem>

            <MenuItem value=".jpeg">
              JPEG
            </MenuItem>

            <MenuItem value=".png">
              PNG
            </MenuItem>

            <MenuItem value=".zip">
              ZIP
            </MenuItem>
          </Select>

          <TextField
            label="Minimum size (bytes)"
            type="number"
            value={minSize}
            onChange={(event) =>
              setMinSize(event.target.value)
            }
            size="small"
            fullWidth
          />

          <TextField
            label="Maximum size (bytes)"
            type="number"
            value={maxSize}
            onChange={(event) =>
              setMaxSize(event.target.value)
            }
            size="small"
            fullWidth
          />

          <Select
            value={duplicateFilter}
            onChange={
              handleDuplicateChange
            }
            displayEmpty
            size="small"
            fullWidth
          >
            <MenuItem value="">
              All Files
            </MenuItem>

            <MenuItem value="true">
              Duplicates Only
            </MenuItem>

            <MenuItem value="false">
              Unique Only
            </MenuItem>
          </Select>

          <Select
            value={hashStatus}
            onChange={
              handleHashStatusChange
            }
            displayEmpty
            size="small"
            fullWidth
          >
            <MenuItem value="">
              All Hash Status
            </MenuItem>

            <MenuItem value="PENDING">
              Pending
            </MenuItem>

            <MenuItem value="PROCESSING">
              Processing
            </MenuItem>

            <MenuItem value="COMPLETED">
              Completed
            </MenuItem>

            <MenuItem value="FAILED">
              Failed
            </MenuItem>
          </Select>

          <TextField
            label="Date from"
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value,
              )
            }
            size="small"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Date to"
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(event.target.value)
            }
            size="small"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        {/* Sorting */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Box
            sx={{
              color: "#617889",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            Sort:
          </Box>

          <Select
            value={sortBy}
            onChange={
              handleSortByChange
            }
            size="small"
            sx={{
              minWidth: 190,
            }}
          >
            <MenuItem value="created_at">
              Upload Date
            </MenuItem>

            <MenuItem value="file_size">
              File Size
            </MenuItem>

            <MenuItem value="original_filename">
              Filename
            </MenuItem>
          </Select>

          <Select
            value={sortOrder}
            onChange={
              handleSortOrderChange
            }
            size="small"
            sx={{
              minWidth: 140,
            }}
          >
            <MenuItem value="desc">
              Descending
            </MenuItem>

            <MenuItem value="asc">
              Ascending
            </MenuItem>
          </Select>

          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              background: "#0e7490",
              "&:hover": {
                background: "#155e75",
              },
            }}
          >
            Apply Filters
          </Button>

          <Button
            variant="outlined"
            onClick={
              handleResetFilters
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Results summary */}
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            color: "#617889",
            fontSize: "0.82rem",
          }}
        >
          Showing{" "}
          <strong>
            {files.length}
          </strong>{" "}
          of{" "}
          <strong>
            {total}
          </strong>{" "}
          files
        </Box>
      </Box>

      {/* File table */}
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
              minHeight: 300,
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
        ) : files.length === 0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#78909c",
              px: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                fontSize: "2.5rem",
                mb: 1,
              }}
            >
              📁
            </Box>

            <Box
              sx={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#456579",
              }}
            >
              No files found
            </Box>

            <Box
              sx={{
                fontSize: "0.85rem",
                mt: 0.5,
              }}
            >
              Try changing your search or
              filter options.
            </Box>
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
                minWidth: 950,
                display: "grid",
                gridTemplateColumns:
                  "2.2fr 0.8fr 0.8fr 1fr 0.9fr 1.2fr",
                alignItems: "center",
                px: 3,
                py: 2,
                background: "#f2f7fa",
                borderBottom:
                  "1px solid #e2eaf0",
                color: "#607d8b",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              <Box>FILE</Box>
              <Box>SIZE</Box>
              <Box>TYPE</Box>
              <Box>HASH STATUS</Box>
              <Box>DATE</Box>
              <Box>ACTIONS</Box>
            </Box>

            {files.map((file) => {
              const statusStyle =
                getHashStatusStyle(
                  file.hash_status,
                );

              return (
                <Box
                  key={file.id}
                  sx={{
                    minWidth: 950,
                    display: "grid",
                    gridTemplateColumns:
                      "2.2fr 0.8fr 0.8fr 1fr 0.9fr 1.2fr",
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
                  {/* Clickable filename */}
                  <Box
                    sx={{
                      minWidth: 0,
                      pr: 2,
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() =>
                        navigate(
                          `/files/${file.id}`,
                        )
                      }
                      sx={{
                        display: "block",
                        width: "100%",
                        padding: 0,
                        border: 0,
                        background:
                          "transparent",
                        color: "#0e7490",
                        fontWeight: 700,
                        fontSize:
                          "0.88rem",
                        textAlign: "left",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                        "&:hover": {
                          color: "#0369a1",
                          textDecoration:
                            "underline",
                        },
                      }}
                    >
                      {
                        file.original_filename
                      }
                    </Box>

                    {file.is_duplicate && (
                      <Box
                        sx={{
                          display:
                            "inline-block",
                          mt: 0.5,
                          px: 1,
                          py: 0.2,
                          borderRadius: 5,
                          background:
                            "#f3e8ff",
                          color: "#7e22ce",
                          fontSize:
                            "0.68rem",
                          fontWeight: 600,
                        }}
                      >
                        Duplicate
                      </Box>
                    )}

                    {file.is_protected && (
                      <Box
                        sx={{
                          display:
                            "inline-block",
                          mt: 0.5,
                          ml: 0.5,
                          px: 1,
                          py: 0.2,
                          borderRadius: 5,
                          background:
                            "#fef3c7",
                          color: "#92400e",
                          fontSize:
                            "0.68rem",
                          fontWeight: 600,
                        }}
                      >
                        Protected
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      color: "#456579",
                      fontSize:
                        "0.82rem",
                    }}
                  >
                    {formatBytes(
                      file.file_size,
                    )}
                  </Box>

                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    {file.file_extension ||
                      file.mime_type ||
                      "Unknown"}
                  </Box>

                  <Box>
                    <Box
                      component="span"
                      sx={{
                        display:
                          "inline-block",
                        px: 1.2,
                        py: 0.5,
                        borderRadius: 5,
                        background:
                          statusStyle.background,
                        color:
                          statusStyle.color,
                        fontSize:
                          "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {file.hash_status}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      color: "#607d8b",
                      fontSize:
                        "0.78rem",
                    }}
                  >
                    {formatDate(
                      file.created_at,
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleDownload(file)
                      }
                      sx={{
                        minWidth: 72,
                        textTransform:
                          "none",
                        borderRadius: 1.5,
                        fontSize:
                          "0.72rem",
                      }}
                    >
                      Download
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        handleDelete(file)
                      }
                      disabled={
                        file.is_protected
                      }
                      sx={{
                        minWidth: 60,
                        textTransform:
                          "none",
                        borderRadius: 1.5,
                        fontSize:
                          "0.72rem",
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            disabled={page <= 1}
            onClick={() =>
              setPage((current) =>
                Math.max(
                  current - 1,
                  1,
                ),
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Previous
          </Button>

          <Box
            sx={{
              color: "#456579",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Page {page} of{" "}
            {totalPages}
          </Box>

          <Button
            variant="outlined"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  current + 1,
                  totalPages,
                ),
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}