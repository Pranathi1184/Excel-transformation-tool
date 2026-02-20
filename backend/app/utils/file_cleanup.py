"""
Output file cleanup: delete files in outputs/ older than max_age_seconds.
"""
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

# Default: delete files older than 1 hour
DEFAULT_MAX_AGE_SECONDS = 3600


def cleanup_outputs_dir(outputs_path: Path, max_age_seconds: int = DEFAULT_MAX_AGE_SECONDS) -> int:
    """
    Remove files in outputs_path that are older than max_age_seconds.
    Returns the number of files deleted.
    """
    if not outputs_path.exists() or not outputs_path.is_dir():
        return 0
    now = time.time()
    deleted = 0
    for f in outputs_path.iterdir():
        if not f.is_file():
            continue
        try:
            if now - f.stat().st_mtime > max_age_seconds:
                f.unlink()
                deleted += 1
                logger.info("Cleaned up output file: %s", f.name)
        except OSError as e:
            logger.warning("Could not delete %s: %s", f, e)
    return deleted
