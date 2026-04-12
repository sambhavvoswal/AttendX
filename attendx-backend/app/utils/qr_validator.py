from typing import Optional, List, Dict, Any

def validate_qr_payload(
    payload: Dict[str, Any],
    pk_column_key: str,         # QR key name for PK (e.g., "roll_no")
    sheet_column_keys: List[str] # All QR key names mapped (non-PK)
) -> Dict[str, Any]:
    """
    Returns:
    {
        "valid": bool,
        "pk_value": Optional[str],
        "missing_fields": list[str],
        "error": Optional[str]
    }
    """
    result = {
        "valid": False,
        "pk_value": None,
        "missing_fields": [],
        "error": None
    }

    # Build a case-insensitive lookup from the payload
    # e.g., payload = {"VSN": 79} → lower_map = {"vsn": 79}
    lower_map = {k.lower(): v for k, v in payload.items()}
    pk_key_lower = pk_column_key.lower()

    if pk_key_lower not in lower_map:
        result["error"] = "Invalid QR — Primary key not found"
        return result

    pk_value = str(lower_map[pk_key_lower]).strip()
    if not pk_value:
        result["error"] = "Invalid QR — Primary key is empty"
        return result

    result["pk_value"] = pk_value
    result["valid"] = True

    for key in sheet_column_keys:
        if key.lower() not in lower_map:
            result["missing_fields"].append(key)

    return result
