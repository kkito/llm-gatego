package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/kkito/llm-gatego/internal/config"
	"github.com/kkito/llm-gatego/internal/server"
	"github.com/kkito/llm-gatego/internal/store"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
)

var version = "dev"

func run(args []string, out io.Writer) {
	if err := runE(args, out); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
	}
}
func runE(args []string, out io.Writer) error {
	if len(args) == 0 {
		printUsage(out)
		return nil
	}
	switch args[0] {
	case "-version", "--version", "-v":
		fmt.Fprintf(out, "llm-gatego %s\n", version)
		return nil
	case "start":
		return startCommand(args[1:], out, false)
	case "daemon":
		return startCommand(args[1:], out, true)
	case "-D", "--daemon":
		return startCommand(args, out, true)
	case "stop", "--stop":
		return stopCommand(args[1:], out)
	case "stats":
		return statsCommand(args[1:], out)
	case "-h", "--help", "help":
		printUsage(out)
		return nil
	}
	if args[0][0] == '-' { // legacy root flags
		return startCommand(args, out, false)
	}
	printUsage(out)
	return nil
}
func printUsage(out io.Writer) {
	fmt.Fprintln(out, "llm-gatego - Go rewrite of llm-gateway")
	fmt.Fprintln(out, "usage: llm-gatego <start|daemon|stop|stats> [options]")
	fmt.Fprintln(out, "  start  -C/--config-dir DIR  -p/--port N  -t/--timeout MS  --debug")
	fmt.Fprintln(out, "  stats  -C/--config-dir DIR  --date YYYY-MM-DD  --week YYYY-Www  --month YYYY-MM  --by-hour  --json")
}

type startOpts struct {
	configDir           string
	port                int
	timeout             int
	daemon, stop, debug bool
}

func parseStart(args []string, out io.Writer) (startOpts, error) {
	home, _ := os.UserHomeDir()
	o := startOpts{configDir: filepath.Join(home, ".llm-gateway"), port: 4000, timeout: 300000}
	fs := flag.NewFlagSet("start", flag.ContinueOnError)
	fs.SetOutput(out)
	fs.StringVar(&o.configDir, "C", o.configDir, "config directory")
	fs.StringVar(&o.configDir, "config-dir", o.configDir, "config directory")
	fs.IntVar(&o.port, "p", o.port, "port")
	fs.IntVar(&o.port, "port", o.port, "port")
	fs.IntVar(&o.timeout, "t", o.timeout, "timeout ms")
	fs.IntVar(&o.timeout, "timeout", o.timeout, "timeout ms")
	fs.BoolVar(&o.daemon, "D", false, "daemon")
	fs.BoolVar(&o.daemon, "daemon", false, "daemon")
	fs.BoolVar(&o.stop, "stop", false, "stop")
	fs.BoolVar(&o.debug, "debug", false, "debug")
	if err := fs.Parse(args); err != nil {
		return o, err
	}
	return o, nil
}
func pidPath(dir string) string { return filepath.Join(dir, "llm-gateway.pid") }
func readPID(dir string) (int, error) {
	b, err := os.ReadFile(pidPath(dir))
	if err != nil {
		return 0, err
	}
	pid, err := strconv.Atoi(strings.TrimSpace(string(b)))
	if err != nil {
		return 0, err
	}
	p, err := os.FindProcess(pid)
	if err != nil {
		return 0, err
	}
	if err := p.Signal(syscall.Signal(0)); err != nil {
		_ = os.Remove(pidPath(dir))
		return 0, fmt.Errorf("stale pidfile")
	}
	return pid, nil
}
func startCommand(args []string, out io.Writer, daemon bool) error {
	o, err := parseStart(args, out)
	if err != nil {
		return err
	}
	o.daemon = o.daemon || daemon
	if o.stop {
		return stopCommand(nil, out)
	}
	if err := os.MkdirAll(o.configDir, 0755); err != nil {
		return err
	}
	if _, err := readPID(o.configDir); err == nil {
		return fmt.Errorf("already running")
	}
	cfg, err := config.LoadFullConfig(filepath.Join(o.configDir, "config.json"))
	if err != nil {
		cfg = &config.ProxyConfig{}
	}
	ctx := config.CreateConfigContext(o.configDir)
	dm := store.GetDatabaseManager(ctx.ConfigDir)
	if err := dm.Initialize(); err != nil {
		return err
	}
	deps := proxyDeps(cfg, ctx, o.timeout)
	deps.RequestLogger = store.GetRequestLogger(dm)
	h := server.New(cfg, deps, ctx, server.Options{Debug: o.debug})
	if o.daemon {
		exe, err := os.Executable()
		if err != nil {
			return err
		}
		child := exec.Command(exe, "start", "-C", o.configDir, "-p", strconv.Itoa(o.port), "-t", strconv.Itoa(o.timeout))
		child.Stdout = out
		child.Stderr = os.Stderr
		child.Env = append(os.Environ(), "LLM_GATEGO_DAEMON_CHILD=1")
		if err := child.Start(); err != nil {
			return err
		}
		for i := 0; i < 50; i++ {
			if resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/health", o.port)); err == nil {
				resp.Body.Close()
				break
			}
			time.Sleep(100 * time.Millisecond)
		}
		fmt.Fprintf(out, "daemon started (pid %d)\n", child.Process.Pid)
		return nil
	}
	if err := os.WriteFile(pidPath(o.configDir), []byte(strconv.Itoa(os.Getpid())), 0644); err != nil {
		return err
	}
	defer os.Remove(pidPath(o.configDir))
	fmt.Fprintf(out, "llm-gatego listening on :%d\n", o.port)
	return http.ListenAndServe(fmt.Sprintf(":%d", o.port), h)
}
func stopCommand(args []string, out io.Writer) error {
	dir := "."
	home, _ := os.UserHomeDir()
	if home != "" {
		dir = filepath.Join(home, ".llm-gateway")
	}
	fs := flag.NewFlagSet("stop", flag.ContinueOnError)
	fs.SetOutput(out)
	fs.StringVar(&dir, "C", dir, "config directory")
	fs.StringVar(&dir, "config-dir", dir, "config directory")
	_ = fs.Parse(args)
	pid, err := readPID(dir)
	if err != nil {
		return fmt.Errorf("not running")
	}
	p, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	if err := p.Signal(syscall.SIGTERM); err != nil {
		return err
	}
	_ = os.Remove(pidPath(dir))
	fmt.Fprintln(out, "stopped")
	return nil
}

type statsOpts struct {
	configDir, date, week, month string
	byHour, jsonOutput           bool
}

func parseStats(args []string, out io.Writer) (statsOpts, error) {
	home, _ := os.UserHomeDir()
	o := statsOpts{configDir: filepath.Join(home, ".llm-gateway")}
	fs := flag.NewFlagSet("stats", flag.ContinueOnError)
	fs.SetOutput(out)
	fs.StringVar(&o.configDir, "C", o.configDir, "config directory")
	fs.StringVar(&o.configDir, "config-dir", o.configDir, "config directory")
	fs.StringVar(&o.date, "date", "", "date")
	fs.StringVar(&o.week, "week", "", "week")
	fs.StringVar(&o.month, "month", "", "month")
	fs.BoolVar(&o.byHour, "by-hour", false, "by hour")
	fs.BoolVar(&o.jsonOutput, "json", false, "json")
	if err := fs.Parse(args); err != nil {
		return o, err
	}
	return o, nil
}
func statsCommand(args []string, out io.Writer) error {
	o, err := parseStats(args, out)
	if err != nil {
		return err
	}
	ctx := config.CreateConfigContext(o.configDir)
	dm := store.GetDatabaseManager(ctx.ConfigDir)
	from, to := "", ""
	switch {
	case o.date != "":
		d, err := time.ParseInLocation("2006-01-02", o.date, time.Local)
		if err != nil {
			return err
		}
		from = d.Format(time.RFC3339)
		to = d.AddDate(0, 0, 1).Format(time.RFC3339)
	case o.week != "":
		start, err := parseISOWeekCLI(o.week)
		if err != nil {
			return err
		}
		from = start.Format(time.RFC3339)
		to = start.AddDate(0, 0, 7).Format(time.RFC3339)
	case o.month != "":
		m, err := time.ParseInLocation("2006-01", o.month, time.Local)
		if err != nil {
			return err
		}
		from = m.Format(time.RFC3339)
		to = m.AddDate(0, 1, 0).Format(time.RFC3339)
	}
	rows, err := dm.QueryRows(from, to, 0)
	if err != nil {
		return err
	}
	type byModel struct {
		Model    string `json:"model"`
		Requests int    `json:"requests"`
		Success  int    `json:"success"`
		Errors   int    `json:"errors"`
		Tokens   int    `json:"tokens"`
	}
	counts := map[string]*byModel{}
	hours := map[int]int{}
	for _, r := range rows {
		m := counts[r.CustomModel]
		if m == nil {
			m = &byModel{Model: r.CustomModel}
			counts[r.CustomModel] = m
		}
		m.Requests++
		if r.StatusCode < 400 && r.ErrorMessage == "" {
			m.Success++
		} else {
			m.Errors++
		}
		if r.TotalTokens != nil {
			m.Tokens += *r.TotalTokens
		}
		if o.byHour || o.jsonOutput {
			if t, err := time.Parse(time.RFC3339, r.Timestamp); err == nil {
				hours[t.Hour()]++
			}
		}
	}
	list := []byModel{}
	for _, v := range counts {
		list = append(list, *v)
	}
	result := map[string]any{"total": len(rows), "byModel": list}
	if o.byHour || o.jsonOutput {
		result["byHour"] = hours
	}
	if o.jsonOutput {
		b, _ := json.MarshalIndent(result, "", "  ")
		fmt.Fprintln(out, string(b))
		return nil
	}
	fmt.Fprintf(out, "Total requests: %d\n", len(rows))
	for _, m := range list {
		fmt.Fprintf(out, "  %s: %d (ok %d, err %d, tokens %d)\n", m.Model, m.Requests, m.Success, m.Errors, m.Tokens)
	}
	if o.byHour {
		for h := 0; h < 24; h++ {
			fmt.Fprintf(out, "  %02d:00 - %d\n", h, hours[h])
		}
	}
	return nil
}
func parseISOWeekCLI(s string) (time.Time, error) {
	var year, week int
	if _, err := fmt.Sscanf(s, "%d-W%d", &year, &week); err != nil {
		return time.Time{}, err
	}
	jan4 := time.Date(year, 1, 4, 0, 0, 0, 0, time.Local)
	start := jan4.AddDate(0, 0, -int(jan4.Weekday()+6)%7)
	return start.AddDate(0, 0, (week-1)*7), nil
}
func main() { run(os.Args[1:], os.Stdout) }
