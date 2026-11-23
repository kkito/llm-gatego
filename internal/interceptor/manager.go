package interceptor

type Manager struct{ fns []Fn }

func NewManager() *Manager   { return &Manager{} }
func (m *Manager) Use(fn Fn) { m.fns = append(m.fns, fn) }
func (m *Manager) Clear()    { m.fns = nil }
func (m *Manager) Execute(req *UpstreamRequest, ctx *Context) (*UpstreamRequest, error) {
	cur := req
	for _, fn := range m.fns {
		next, err := fn(cur, ctx)
		if err != nil {
			return nil, err
		}
		cur = next
	}
	return cur, nil
}
