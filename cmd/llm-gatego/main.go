package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

var version = "dev"

// run is the testable CLI entry point.
func run(args []string, out io.Writer) {
	fs := flag.NewFlagSet("llm-gatego", flag.ContinueOnError)
	fs.SetOutput(out)
	showVersion := fs.Bool("version", false, "print version")
	_ = fs.Parse(args)
	if *showVersion {
		fmt.Fprintf(out, "llm-gatego %s\n", version)
		return
	}
	fmt.Fprintln(out, "llm-gatego: use -version, start, stats, stop (coming next)")
}

func main() {
	run(os.Args[1:], os.Stdout)
}
