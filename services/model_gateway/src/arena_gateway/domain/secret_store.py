"""AES-256-GCM Secret Store for credentials (F1.1, ADR-015)."""

import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class SecretStore:
    """Manages encrypted secrets using AES-256-GCM and a master key."""

    def __init__(self, master_key_hex: str | None = None) -> None:
        key_hex = master_key_hex or os.environ.get(
            "ARENA_MASTER_KEY",
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        )
        self._key = bytes.fromhex(key_hex[:64])
        self._aesgcm = AESGCM(self._key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt secret string into base64-encoded nonce+ciphertext."""
        nonce = os.urandom(12)
        ciphertext = self._aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return base64.b64encode(nonce + ciphertext).decode("utf-8")

    def decrypt(self, encrypted_b64: str) -> str:
        """Decrypt base64-encoded encrypted secret."""
        raw = base64.b64decode(encrypted_b64.encode("utf-8"))
        nonce = raw[:12]
        ciphertext = raw[12:]
        plaintext = self._aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")

    @staticmethod
    def mask_secret(secret: str) -> str:
        """Return masked preview of secret, showing only prefix and suffix."""
        if len(secret) <= 8:
            return "********"
        return f"{secret[:4]}...{secret[-4:]}"
