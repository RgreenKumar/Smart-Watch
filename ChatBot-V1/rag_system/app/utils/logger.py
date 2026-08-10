"""
Simple logging configuration
"""

import logging
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "rag_system.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Create logger instance
log = logging.getLogger(__name__)

# Export for easy import
__all__ = ['log']