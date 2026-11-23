package interceptor

import "fmt"

type PermissionError struct{ Model string }

func (e *PermissionError) Error() string {
	return fmt.Sprintf("You don't have access to model: %s", e.Model)
}

func UserModelAccess(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	if ctx.CurrentUser == nil || len(ctx.CurrentUser.AllowedModels) == 0 {
		return req, nil
	}
	for _, m := range ctx.CurrentUser.AllowedModels {
		if m == ctx.CustomModel {
			return req, nil
		}
	}
	return nil, &PermissionError{ctx.CustomModel}
}
