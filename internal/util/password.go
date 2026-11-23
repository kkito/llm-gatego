package util

import (
	"crypto/sha256"
	"encoding/hex"
)

func SHA256Password(password string) string {
	h := sha256.Sum256([]byte(password))
	return hex.EncodeToString(h[:])
}
