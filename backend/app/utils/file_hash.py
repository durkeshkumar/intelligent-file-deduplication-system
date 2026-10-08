import hashlib
from pathlib import Path


def calculate_sha256(
    file_path: str | Path,
    chunk_size: int = 1024 * 1024,
) -> str:
    """
    Calculate the SHA-256 hash of a file.

    The file is read in chunks so large files do not
    need to be loaded completely into memory.
    """

    sha256 = hashlib.sha256()

    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(
            f"File not found: {path}"
        )

    with path.open("rb") as file:
        while True:
            chunk = file.read(chunk_size)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()