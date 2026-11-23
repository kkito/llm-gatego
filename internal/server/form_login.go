package server

import (
	"net/http"
	"os"
	"strconv"

	"github.com/kkito/llm-gatego/internal/auth"
	"github.com/kkito/llm-gatego/internal/util"
)

// Original v1.15.0 admin/user login form handlers: cookie + 302 redirect.
func RegisterFormLoginAliases(mux *http.ServeMux, d APIDeps) {
	mux.HandleFunc("POST /admin/login", func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		pw := r.FormValue("password")
		cfg, err := d.load()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		if cfg.AdminPassword == "" {
			if pw == "" {
				http.Redirect(w, r, "/admin/login?error=请输入密码", http.StatusFound)
				return
			}
			cfg.AdminPassword = pw
			if err := d.save(cfg); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
		} else if pw != cfg.AdminPassword {
			http.Redirect(w, r, "/admin/login?error=密码错误", http.StatusFound)
			return
		}
		id := util.SHA256Password(pw + strconv.Itoa(os.Getpid()))[:32]
		auth.SetSession(id)
		http.SetCookie(w, &http.Cookie{Name: "session", Value: id, Path: "/", HttpOnly: true})
		http.Redirect(w, r, "/admin/models", http.StatusFound)
	})
	mux.HandleFunc("POST /user/login", func(w http.ResponseWriter, r *http.Request) {
		_ = r.ParseForm()
		id, err := auth.LoginUserSession(r.FormValue("apikey"), d.path())
		if err != nil || id == "" {
			http.Redirect(w, r, "/user/login?error=无效的 API Key", http.StatusFound)
			return
		}
		http.SetCookie(w, &http.Cookie{Name: "user_session", Value: id, Path: "/", HttpOnly: true})
		http.Redirect(w, r, "/user/main", http.StatusFound)
	})
}
