package store

import (
	"embed"
	"fmt"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

func init() {
	SetMigrationFS(func(name string) ([]byte, error) {
		b, err := migrationFS.ReadFile("migrations/" + name)
		if err != nil {
			return nil, fmt.Errorf("embedded migration %s: %w", name, err)
		}
		return b, nil
	})
}
