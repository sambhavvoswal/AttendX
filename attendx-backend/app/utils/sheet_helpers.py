import re

DATE_COL_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def is_date_column(header: str) -> bool:
    return bool(DATE_COL_REGEX.match(header))

def extract_sheet_id_from_url(url: str) -> str:
    """Extracts the Google Sheet ID from a full URL."""
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9_-]+)', url)
    if not match:
        raise ValueError("Not a valid Google Sheet URL")
    return match.group(1)
