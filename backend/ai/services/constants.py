# Weight constants for the job matcher scoring system
# The values sum to 1.0 and represent relative importance of each component.
# Configurable via environment variables; defaults are provided.

import os
from django.core.exceptions import ImproperlyConfigured

def _load_weight(env_name: str, default: float) -> float:
    """Load a weight from the environment, falling back to ``default``.
    Validates that the value is numeric and non‑negative.
    """
    raw = os.getenv(env_name)
    if raw is None:
        return default
    try:
        value = float(raw)
    except ValueError as exc:
        raise ImproperlyConfigured(f"Environment variable {env_name} must be a numeric value.") from exc
    if value < 0:
        raise ImproperlyConfigured(f"Environment variable {env_name} must be >= 0.")
    return value

# Default weights (must sum to 1.0)
_DEFAULT_ROLE_WEIGHT = 0.30
_DEFAULT_SKILLS_WEIGHT = 0.25
_DEFAULT_EXPERIENCE_WEIGHT = 0.10
_DEFAULT_RESPONSIBILITY_WEIGHT = 0.20
_DEFAULT_DOMAIN_WEIGHT = 0.10
_DEFAULT_EDUCATION_WEIGHT = 0.03
_DEFAULT_TRANSFERABLE_WEIGHT = 0.02

# Load from environment, overriding defaults when present
ROLE_WEIGHT = _load_weight("ROLE_WEIGHT", _DEFAULT_ROLE_WEIGHT)
SKILLS_WEIGHT = _load_weight("SKILLS_WEIGHT", _DEFAULT_SKILLS_WEIGHT)
EXPERIENCE_WEIGHT = _load_weight("EXPERIENCE_WEIGHT", _DEFAULT_EXPERIENCE_WEIGHT)
RESPONSIBILITY_WEIGHT = _load_weight("RESPONSIBILITY_WEIGHT", _DEFAULT_RESPONSIBILITY_WEIGHT)
DOMAIN_WEIGHT = _load_weight("DOMAIN_WEIGHT", _DEFAULT_DOMAIN_WEIGHT)
EDUCATION_WEIGHT = _load_weight("EDUCATION_WEIGHT", _DEFAULT_EDUCATION_WEIGHT)
TRANSFERABLE_WEIGHT = _load_weight("TRANSFERABLE_WEIGHT", _DEFAULT_TRANSFERABLE_WEIGHT)

# Validate total weight equals 1.0
_total = (
    ROLE_WEIGHT + SKILLS_WEIGHT + EXPERIENCE_WEIGHT +
    RESPONSIBILITY_WEIGHT + DOMAIN_WEIGHT + EDUCATION_WEIGHT + TRANSFERABLE_WEIGHT
)
if abs(_total - 1.0) > 1e-6:
    raise ImproperlyConfigured(
        f"Sum of weight constants must equal 1.0; got {_total:.6f}. "
        "Check environment variable values."
    )
